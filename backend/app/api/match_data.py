"""
Match Data API endpoints
Endpoints for querying scraped match data from database
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import date
from uuid import UUID
from sqlmodel import Session, select, func, and_, or_

from app.core.pl_database import get_pl_session
from app.models.pl_data import (
    Team,
    Player,
    Match,
    MatchPlayerStats,
    MatchEvent,
    Lineup,
    TeamStats,
)

router = APIRouter(prefix="/match-data", tags=["Match Data"])


@router.get("/teams")
async def get_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_pl_session),
):
    """Get all teams"""
    statement = select(Team).offset(skip).limit(limit)
    teams = session.exec(statement).all()
    total = session.exec(select(func.count(Team.id))).one()
    
    return {
        "teams": teams,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/teams/{team_id}")
async def get_team(
    team_id: UUID,
    session: Session = Depends(get_pl_session),
):
    """Get a specific team by ID"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team not found: {team_id}"
        )
    return team


@router.get("/players")
async def get_players(
    team_id: Optional[UUID] = Query(None, description="Filter by team ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_pl_session),
):
    """Get all players, optionally filtered by team"""
    statement = select(Player)
    if team_id:
        statement = statement.where(Player.current_team_id == team_id)
    
    statement = statement.offset(skip).limit(limit)
    players = session.exec(statement).all()
    
    count_statement = select(func.count(Player.id))
    if team_id:
        count_statement = count_statement.where(Player.current_team_id == team_id)
    total = session.exec(count_statement).one()
    
    return {
        "players": players,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/players/{player_id}")
async def get_player(
    player_id: UUID,
    session: Session = Depends(get_pl_session),
):
    """Get a specific player by ID"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player not found: {player_id}"
        )
    return player


@router.get("/matches")
async def get_matches(
    season: Optional[str] = Query(None, description="Filter by season (e.g., '2025-2026')"),
    team_id: Optional[UUID] = Query(None, description="Filter by team ID (home or away)"),
    date_from: Optional[date] = Query(None, description="Filter matches from this date"),
    date_to: Optional[date] = Query(None, description="Filter matches to this date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    session: Session = Depends(get_pl_session),
):
    """Get matches with optional filters"""
    statement = select(Match)
    
    # Apply filters
    conditions = []
    if season:
        conditions.append(Match.season == season)
    if team_id:
        conditions.append(
            or_(Match.home_team_id == team_id, Match.away_team_id == team_id)
        )
    if date_from:
        conditions.append(Match.date >= date_from)
    if date_to:
        conditions.append(Match.date <= date_to)
    
    if conditions:
        statement = statement.where(and_(*conditions))
    
    # Order by date (newest first)
    statement = statement.order_by(Match.date.desc()).offset(skip).limit(limit)
    matches = session.exec(statement).all()
    
    # Get total count
    count_statement = select(func.count(Match.id))
    if conditions:
        count_statement = count_statement.where(and_(*conditions))
    total = session.exec(count_statement).one()
    
    return {
        "matches": matches,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/matches/{match_id}")
async def get_match(
    match_id: UUID,
    session: Session = Depends(get_pl_session),
):
    """Get a specific match by ID with all related data"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match not found: {match_id}"
        )
    
    # Get related data
    home_team = session.get(Team, match.home_team_id)
    away_team = session.get(Team, match.away_team_id)
    
    # Get lineups
    lineups = session.exec(
        select(Lineup).where(Lineup.match_id == match_id)
    ).all()
    
    # Get events
    events = session.exec(
        select(MatchEvent).where(MatchEvent.match_id == match_id)
        .order_by(MatchEvent.minute)
    ).all()
    
    # Get player stats
    player_stats = session.exec(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    ).all()
    
    # Get team stats
    team_stats = session.exec(
        select(TeamStats).where(TeamStats.match_id == match_id)
    ).all()
    
    return {
        "match": match,
        "home_team": home_team,
        "away_team": away_team,
        "lineups": lineups,
        "events": events,
        "player_stats": player_stats,
        "team_stats": team_stats,
    }


@router.get("/matches/{match_id}/events")
async def get_match_events(
    match_id: UUID,
    event_type: Optional[str] = Query(None, description="Filter by event type (goal, card, substitution)"),
    session: Session = Depends(get_pl_session),
):
    """Get events for a specific match"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match not found: {match_id}"
        )
    
    statement = select(MatchEvent).where(MatchEvent.match_id == match_id)
    if event_type:
        statement = statement.where(MatchEvent.event_type == event_type)
    
    statement = statement.order_by(MatchEvent.minute)
    events = session.exec(statement).all()
    
    return {
        "match_id": match_id,
        "events": events,
        "count": len(events),
    }


@router.get("/matches/{match_id}/stats")
async def get_match_stats(
    match_id: UUID,
    session: Session = Depends(get_pl_session),
):
    """Get player and team statistics for a match"""
    match = session.get(Match, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match not found: {match_id}"
        )
    
    # Get player stats
    player_stats = session.exec(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    ).all()
    
    # Get team stats
    team_stats = session.exec(
        select(TeamStats).where(TeamStats.match_id == match_id)
    ).all()
    
    return {
        "match_id": match_id,
        "player_stats": player_stats,
        "team_stats": team_stats,
    }


@router.get("/players/{player_id}/matches")
async def get_player_matches(
    player_id: UUID,
    season: Optional[str] = Query(None, description="Filter by season"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    session: Session = Depends(get_pl_session),
):
    """Get all matches for a specific player"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player not found: {player_id}"
        )
    
    # Get matches where player has stats
    statement = select(Match).join(
        MatchPlayerStats, Match.id == MatchPlayerStats.match_id
    ).where(MatchPlayerStats.player_id == player_id)
    
    if season:
        statement = statement.where(Match.season == season)
    
    statement = statement.order_by(Match.date.desc()).offset(skip).limit(limit)
    matches = session.exec(statement).all()
    
    # Get total count
    count_statement = select(func.count(Match.id)).join(
        MatchPlayerStats, Match.id == MatchPlayerStats.match_id
    ).where(MatchPlayerStats.player_id == player_id)
    if season:
        count_statement = count_statement.where(Match.season == season)
    total = session.exec(count_statement).one()
    
    return {
        "player": player,
        "matches": matches,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/players/{player_id}/stats")
async def get_player_stats(
    player_id: UUID,
    season: Optional[str] = Query(None, description="Filter by season"),
    session: Session = Depends(get_pl_session),
):
    """Get aggregated statistics for a player"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player not found: {player_id}"
        )
    
    # Get all player stats
    statement = select(MatchPlayerStats).join(
        Match, MatchPlayerStats.match_id == Match.id
    ).where(MatchPlayerStats.player_id == player_id)
    
    if season:
        statement = statement.where(Match.season == season)
    
    stats_list = session.exec(statement).all()
    
    # Aggregate statistics
    total_matches = len(stats_list)
    total_goals = sum(s.goals or 0 for s in stats_list)
    total_assists = sum(s.assists or 0 for s in stats_list)
    total_minutes = sum(s.minutes or 0 for s in stats_list)
    total_shots = sum(s.shots or 0 for s in stats_list)
    total_passes = sum(s.passes or 0 for s in stats_list)
    
    return {
        "player": player,
        "season": season or "all",
        "total_matches": total_matches,
        "total_goals": total_goals,
        "total_assists": total_assists,
        "total_minutes": total_minutes,
        "total_shots": total_shots,
        "total_passes": total_passes,
        "matches_played": total_matches,
    }


@router.get("/teams/{team_id}/matches")
async def get_team_matches(
    team_id: UUID,
    season: Optional[str] = Query(None, description="Filter by season"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    session: Session = Depends(get_pl_session),
):
    """Get all matches for a specific team"""
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team not found: {team_id}"
        )
    
    statement = select(Match).where(
        or_(Match.home_team_id == team_id, Match.away_team_id == team_id)
    )
    
    if season:
        statement = statement.where(Match.season == season)
    
    statement = statement.order_by(Match.date.desc()).offset(skip).limit(limit)
    matches = session.exec(statement).all()
    
    # Get total count
    count_statement = select(func.count(Match.id)).where(
        or_(Match.home_team_id == team_id, Match.away_team_id == team_id)
    )
    if season:
        count_statement = count_statement.where(Match.season == season)
    total = session.exec(count_statement).one()
    
    return {
        "team": team,
        "matches": matches,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/seasons")
async def get_seasons(
    session: Session = Depends(get_pl_session),
):
    """Get all available seasons"""
    statement = select(Match.season).distinct().order_by(Match.season.desc())
    seasons = session.exec(statement).all()
    
    # Get match count per season
    season_counts = {}
    for season in seasons:
        count = session.exec(
            select(func.count(Match.id)).where(Match.season == season)
        ).one()
        season_counts[season] = count
    
    return {
        "seasons": seasons,
        "counts": season_counts,
    }

