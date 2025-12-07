"""
FPL Live Notification Worker

This worker monitors live FPL games and sends push notifications
to subscribed users when their players score, get cards, etc.

Run with: python -m app.services.notification_worker
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from pywebpush import webpush, WebPushException

from sqlmodel import Session, select
from app.core.database import engine
from app.core.config import settings
from app.models.push_subscription import PushSubscription, NotificationLog
from app.models.user import User
from app.services.fpl_service import fpl_service


class NotificationWorker:
    """Worker that monitors FPL live data and sends push notifications"""
    
    def __init__(self):
        self.previous_stats: Dict[int, Dict[int, Dict[str, Any]]] = {}  # user_id -> player_id -> stats
        self.poll_interval = 60  # seconds
        self.is_running = False
        
        # VAPID keys for web push (generate these for production)
        self.vapid_private_key = settings.VAPID_PRIVATE_KEY if hasattr(settings, 'VAPID_PRIVATE_KEY') else None
        self.vapid_public_key = settings.VAPID_PUBLIC_KEY if hasattr(settings, 'VAPID_PUBLIC_KEY') else None
        self.vapid_claims = {
            "sub": f"mailto:{settings.VAPID_EMAIL}" if hasattr(settings, 'VAPID_EMAIL') else "mailto:admin@fplassistant.com"
        }
    
    async def start(self):
        """Start the notification worker"""
        print(f"[{datetime.now()}] Starting FPL Notification Worker...")
        self.is_running = True
        
        while self.is_running:
            try:
                await self.check_for_updates()
            except Exception as e:
                print(f"[{datetime.now()}] Error in worker: {e}")
            
            await asyncio.sleep(self.poll_interval)
    
    def stop(self):
        """Stop the notification worker"""
        print(f"[{datetime.now()}] Stopping FPL Notification Worker...")
        self.is_running = False
    
    async def check_for_updates(self):
        """Check FPL live data for updates and send notifications"""
        
        # Get current gameweek
        try:
            bootstrap = await fpl_service.get_bootstrap_static()
            current_event = next((e for e in bootstrap['events'] if e['is_current']), None)
            
            if not current_event:
                print(f"[{datetime.now()}] No current gameweek found")
                return
            
            gameweek = current_event['id']
            
            # Check if any matches are currently live
            if not current_event.get('is_current') and current_event.get('finished'):
                print(f"[{datetime.now()}] GW{gameweek} - No live matches")
                return
            
            print(f"[{datetime.now()}] Checking GW{gameweek} for updates...")
            
            # Get live data
            live_data = await fpl_service.get_live_gameweek(gameweek)
            live_elements = {e['id']: e for e in live_data.get('elements', [])}
            
            # Get all players info
            players_info = {p['id']: p for p in bootstrap.get('elements', [])}
            teams_info = {t['id']: t for t in bootstrap.get('teams', [])}
            
            # Get all active subscriptions with user's team picks
            with Session(engine) as session:
                subscriptions = session.exec(
                    select(PushSubscription).where(PushSubscription.is_active == True)
                ).all()
                
                for subscription in subscriptions:
                    try:
                        await self.check_user_updates(
                            session,
                            subscription,
                            gameweek,
                            live_elements,
                            players_info,
                            teams_info
                        )
                    except Exception as e:
                        print(f"[{datetime.now()}] Error checking user {subscription.user_id}: {e}")
        
        except Exception as e:
            print(f"[{datetime.now()}] Error fetching FPL data: {e}")
    
    async def check_user_updates(
        self,
        session: Session,
        subscription: PushSubscription,
        gameweek: int,
        live_elements: Dict[int, Any],
        players_info: Dict[int, Any],
        teams_info: Dict[int, Any]
    ):
        """Check for updates for a specific user's team"""
        
        # Get user's team ID
        user = session.exec(select(User).where(User.id == subscription.user_id)).first()
        if not user or not user.fpl_team_id:
            return
        
        # Get user's picks for this gameweek
        try:
            picks_data = await fpl_service.get_user_picks(user.fpl_team_id, gameweek)
            picks = picks_data.get('picks', [])
        except Exception as e:
            print(f"[{datetime.now()}] Error fetching picks for user {user.id}: {e}")
            return
        
        user_id = user.id
        if user_id not in self.previous_stats:
            self.previous_stats[user_id] = {}
        
        notifications_to_send = []
        
        for pick in picks:
            player_id = pick['element']
            live_stats = live_elements.get(player_id, {}).get('stats', {})
            player_info = players_info.get(player_id, {})
            team_info = teams_info.get(player_info.get('team', 0), {})
            
            player_name = player_info.get('web_name', 'Unknown')
            team_name = team_info.get('short_name', 'UNK')
            
            current = {
                'goals': live_stats.get('goals_scored', 0),
                'assists': live_stats.get('assists', 0),
                'yellow_cards': live_stats.get('yellow_cards', 0),
                'red_cards': live_stats.get('red_cards', 0),
                'bonus': live_stats.get('bonus', 0),
                'minutes': live_stats.get('minutes', 0),
            }
            
            prev = self.previous_stats[user_id].get(player_id, {})
            
            if prev:
                # Check for goals
                if current['goals'] > prev.get('goals', 0) and subscription.notify_goals:
                    notifications_to_send.append({
                        'type': 'goal',
                        'title': f"⚽ GOAL! {player_name}",
                        'body': f"{player_name} has scored for {team_name}!",
                        'player_id': player_id,
                        'player_name': player_name,
                    })
                
                # Check for assists
                if current['assists'] > prev.get('assists', 0) and subscription.notify_assists:
                    notifications_to_send.append({
                        'type': 'assist',
                        'title': f"🅰️ ASSIST! {player_name}",
                        'body': f"{player_name} provided an assist for {team_name}!",
                        'player_id': player_id,
                        'player_name': player_name,
                    })
                
                # Check for yellow cards
                if current['yellow_cards'] > prev.get('yellow_cards', 0) and subscription.notify_yellow_cards:
                    notifications_to_send.append({
                        'type': 'yellow',
                        'title': f"🟨 Yellow Card: {player_name}",
                        'body': f"{player_name} ({team_name}) has been booked",
                        'player_id': player_id,
                        'player_name': player_name,
                    })
                
                # Check for red cards
                if current['red_cards'] > prev.get('red_cards', 0) and subscription.notify_red_cards:
                    notifications_to_send.append({
                        'type': 'red',
                        'title': f"🟥 RED CARD! {player_name}",
                        'body': f"{player_name} ({team_name}) has been sent off!",
                        'player_id': player_id,
                        'player_name': player_name,
                    })
                
                # Check for substitution (minutes stopped but was playing)
                if (prev.get('minutes', 0) > 0 and 
                    prev.get('minutes', 0) < 90 and
                    current['minutes'] == prev.get('minutes', 0) and
                    current['red_cards'] == 0 and
                    subscription.notify_substitutions):
                    # Only notify once per sub
                    if not prev.get('subbed_off'):
                        current['subbed_off'] = True
                        notifications_to_send.append({
                            'type': 'substitution',
                            'title': f"🔄 Subbed Off: {player_name}",
                            'body': f"{player_name} ({team_name}) substituted at {current['minutes']}'",
                            'player_id': player_id,
                            'player_name': player_name,
                        })
            
            # Update previous stats
            self.previous_stats[user_id][player_id] = current
        
        # Send notifications
        for notification in notifications_to_send:
            await self.send_push_notification(session, subscription, notification)
    
    async def send_push_notification(
        self,
        session: Session,
        subscription: PushSubscription,
        notification: Dict[str, Any]
    ):
        """Send a push notification to a subscription"""
        
        if not self.vapid_private_key:
            print(f"[{datetime.now()}] VAPID keys not configured, skipping push")
            return
        
        payload = json.dumps({
            'title': notification['title'],
            'body': notification['body'],
            'icon': '/icon-192.png',
            'badge': '/icon-192.png',
            'tag': f"{notification['type']}-{notification['player_id']}-{datetime.now().timestamp()}",
            'data': {
                'type': notification['type'],
                'player_id': notification['player_id'],
            }
        })
        
        try:
            webpush(
                subscription_info={
                    'endpoint': subscription.endpoint,
                    'keys': {
                        'p256dh': subscription.p256dh_key,
                        'auth': subscription.auth_key,
                    }
                },
                data=payload,
                vapid_private_key=self.vapid_private_key,
                vapid_claims=self.vapid_claims,
            )
            
            print(f"[{datetime.now()}] Sent notification: {notification['title']}")
            
            # Log successful notification
            log = NotificationLog(
                user_id=subscription.user_id,
                notification_type=notification['type'],
                player_id=notification['player_id'],
                player_name=notification['player_name'],
                message=notification['body'],
                success=True,
            )
            session.add(log)
            session.commit()
            
        except WebPushException as e:
            print(f"[{datetime.now()}] Push failed: {e}")
            
            # Handle subscription gone (user unsubscribed)
            if e.response and e.response.status_code in [404, 410]:
                subscription.is_active = False
                subscription.last_error = "Subscription expired or invalid"
                session.add(subscription)
                session.commit()
            
            # Log failed notification
            log = NotificationLog(
                user_id=subscription.user_id,
                notification_type=notification['type'],
                player_id=notification['player_id'],
                player_name=notification['player_name'],
                message=notification['body'],
                success=False,
                error_message=str(e),
            )
            session.add(log)
            session.commit()


# Entry point for running the worker
async def main():
    worker = NotificationWorker()
    try:
        await worker.start()
    except KeyboardInterrupt:
        worker.stop()


if __name__ == "__main__":
    asyncio.run(main())

