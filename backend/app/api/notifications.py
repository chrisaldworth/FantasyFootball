from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import json

from app.core.database import get_session
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.services.fpl_service import fpl_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# In-memory storage for previous stats (resets on server restart)
# For production, consider using Redis
previous_stats: Dict[int, Dict[int, Dict[str, Any]]] = {}


class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class SubscriptionData(BaseModel):
    endpoint: str
    expirationTime: Optional[int] = None
    keys: SubscriptionKeys


class SubscribeRequest(BaseModel):
    subscription: SubscriptionData


class NotificationPreferences(BaseModel):
    notify_goals: bool = True
    notify_assists: bool = True
    notify_yellow_cards: bool = True
    notify_red_cards: bool = True
    notify_substitutions: bool = True
    notify_match_end: bool = True
    notify_bonus_points: bool = True


@router.post("/subscribe")
async def subscribe_to_push(
    request: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Subscribe to push notifications"""
    subscription_data = request.subscription
    
    # Check if subscription already exists
    existing = session.exec(
        select(PushSubscription).where(
            PushSubscription.endpoint == subscription_data.endpoint
        )
    ).first()
    
    if existing:
        # Update existing subscription
        existing.user_id = current_user.id
        existing.p256dh_key = subscription_data.keys.p256dh
        existing.auth_key = subscription_data.keys.auth
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
        session.add(existing)
    else:
        # Create new subscription
        new_subscription = PushSubscription(
            user_id=current_user.id,
            endpoint=subscription_data.endpoint,
            p256dh_key=subscription_data.keys.p256dh,
            auth_key=subscription_data.keys.auth,
        )
        session.add(new_subscription)
    
    session.commit()
    
    return {"status": "subscribed", "message": "Successfully subscribed to push notifications"}


@router.post("/unsubscribe")
async def unsubscribe_from_push(
    endpoint: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Unsubscribe from push notifications"""
    subscription = session.exec(
        select(PushSubscription).where(
            PushSubscription.endpoint == endpoint,
            PushSubscription.user_id == current_user.id
        )
    ).first()
    
    if subscription:
        subscription.is_active = False
        session.add(subscription)
        session.commit()
    
    return {"status": "unsubscribed", "message": "Successfully unsubscribed from push notifications"}


@router.get("/status")
async def get_notification_status(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current notification subscription status"""
    subscriptions = session.exec(
        select(PushSubscription).where(
            PushSubscription.user_id == current_user.id,
            PushSubscription.is_active == True
        )
    ).all()
    
    return {
        "subscribed": len(subscriptions) > 0,
        "subscription_count": len(subscriptions),
    }


@router.put("/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update notification preferences for all subscriptions"""
    subscriptions = session.exec(
        select(PushSubscription).where(
            PushSubscription.user_id == current_user.id,
            PushSubscription.is_active == True
        )
    ).all()
    
    for sub in subscriptions:
        sub.notify_goals = preferences.notify_goals
        sub.notify_assists = preferences.notify_assists
        sub.notify_yellow_cards = preferences.notify_yellow_cards
        sub.notify_red_cards = preferences.notify_red_cards
        sub.notify_substitutions = preferences.notify_substitutions
        sub.notify_match_end = preferences.notify_match_end
        sub.notify_bonus_points = preferences.notify_bonus_points
        sub.updated_at = datetime.utcnow()
        session.add(sub)
    
    session.commit()
    
    return {"status": "updated", "message": "Preferences updated successfully"}


# ============================================
# CRON-TRIGGERED NOTIFICATION CHECK ENDPOINT
# ============================================

@router.post("/check")
async def check_for_notifications(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    secret: Optional[str] = None
):
    """
    Endpoint to trigger notification check.
    Call this from a cron service every 1-2 minutes during matches.
    
    Optional: Add a secret query param for security:
    POST /api/notifications/check?secret=your-secret-key
    """
    # Optional: Validate secret to prevent abuse
    # if secret != settings.CRON_SECRET:
    #     raise HTTPException(status_code=403, detail="Invalid secret")
    
    # Run the check in the background so the request returns quickly
    background_tasks.add_task(run_notification_check, session)
    
    return {
        "status": "checking",
        "message": "Notification check triggered",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/check")
async def check_for_notifications_get(
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """GET version of check endpoint for simple cron services"""
    background_tasks.add_task(run_notification_check, session)
    
    return {
        "status": "checking", 
        "message": "Notification check triggered",
        "timestamp": datetime.utcnow().isoformat()
    }


async def run_notification_check(session: Session):
    """Run the actual notification check logic"""
    global previous_stats
    
    try:
        # Get bootstrap data for current gameweek
        bootstrap = await fpl_service.get_bootstrap_static()
        current_event = next((e for e in bootstrap['events'] if e['is_current']), None)
        
        if not current_event:
            print(f"[{datetime.utcnow()}] No current gameweek")
            return
        
        gameweek = current_event['id']
        
        # Get live data
        try:
            live_data = await fpl_service.get_live_gameweek(gameweek)
        except Exception as e:
            print(f"[{datetime.utcnow()}] Failed to fetch live data: {e}")
            return
            
        live_elements = {e['id']: e for e in live_data.get('elements', [])}
        players_info = {p['id']: p for p in bootstrap.get('elements', [])}
        teams_info = {t['id']: t for t in bootstrap.get('teams', [])}
        
        # Get all active subscriptions
        subscriptions = session.exec(
            select(PushSubscription).where(PushSubscription.is_active == True)
        ).all()
        
        print(f"[{datetime.utcnow()}] Checking {len(subscriptions)} subscriptions for GW{gameweek}")
        
        for subscription in subscriptions:
            try:
                await check_user_notifications(
                    session,
                    subscription,
                    gameweek,
                    live_elements,
                    players_info,
                    teams_info
                )
            except Exception as e:
                print(f"[{datetime.utcnow()}] Error for user {subscription.user_id}: {e}")
                
    except Exception as e:
        print(f"[{datetime.utcnow()}] Notification check error: {e}")


async def check_user_notifications(
    session: Session,
    subscription: PushSubscription,
    gameweek: int,
    live_elements: Dict[int, Any],
    players_info: Dict[int, Any],
    teams_info: Dict[int, Any]
):
    """Check for notifications for a specific user"""
    global previous_stats
    
    # Get user's FPL team ID
    user = session.exec(select(User).where(User.id == subscription.user_id)).first()
    if not user or not user.fpl_team_id:
        return
    
    # Get user's picks
    try:
        picks_data = await fpl_service.get_user_picks(user.fpl_team_id, gameweek)
        picks = picks_data.get('picks', [])
    except:
        return
    
    user_id = user.id
    if user_id not in previous_stats:
        previous_stats[user_id] = {}
    
    notifications = []
    
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
        
        prev = previous_stats[user_id].get(player_id, {})
        
        if prev:
            # Goals
            if current['goals'] > prev.get('goals', 0) and subscription.notify_goals:
                notifications.append({
                    'title': f"⚽ GOAL! {player_name}",
                    'body': f"{player_name} scored for {team_name}!",
                })
            
            # Assists  
            if current['assists'] > prev.get('assists', 0) and subscription.notify_assists:
                notifications.append({
                    'title': f"🅰️ ASSIST! {player_name}",
                    'body': f"{player_name} assist for {team_name}!",
                })
            
            # Yellow cards
            if current['yellow_cards'] > prev.get('yellow_cards', 0) and subscription.notify_yellow_cards:
                notifications.append({
                    'title': f"🟨 Yellow: {player_name}",
                    'body': f"{player_name} booked",
                })
            
            # Red cards
            if current['red_cards'] > prev.get('red_cards', 0) and subscription.notify_red_cards:
                notifications.append({
                    'title': f"🟥 RED! {player_name}",
                    'body': f"{player_name} sent off!",
                })
            
            # Substitution
            if (subscription.notify_substitutions and
                prev.get('minutes', 0) > 0 and
                prev.get('minutes', 0) < 90 and
                current['minutes'] == prev.get('minutes') and
                current['red_cards'] == 0 and
                not prev.get('subbed')):
                current['subbed'] = True
                notifications.append({
                    'title': f"🔄 Sub: {player_name}",
                    'body': f"{player_name} off at {current['minutes']}'",
                })
        
        previous_stats[user_id][player_id] = current
    
    # Send notifications
    for notif in notifications:
        await send_push(subscription, notif['title'], notif['body'])


async def send_push(subscription: PushSubscription, title: str, body: str):
    """Send a push notification"""
    try:
        from pywebpush import webpush, WebPushException
        
        if not settings.VAPID_PRIVATE_KEY:
            print(f"[{datetime.utcnow()}] VAPID not configured")
            return
        
        payload = json.dumps({
            'title': title,
            'body': body,
            'icon': '/icon-192.png',
            'badge': '/icon-192.png',
        })
        
        webpush(
            subscription_info={
                'endpoint': subscription.endpoint,
                'keys': {
                    'p256dh': subscription.p256dh_key,
                    'auth': subscription.auth_key,
                }
            },
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_EMAIL}"}
        )
        
        print(f"[{datetime.utcnow()}] Sent: {title}")
        
    except Exception as e:
        print(f"[{datetime.utcnow()}] Push failed: {e}")
