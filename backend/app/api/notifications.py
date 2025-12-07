from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.push_subscription import PushSubscription

router = APIRouter(prefix="/notifications", tags=["Notifications"])


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

