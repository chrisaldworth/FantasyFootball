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
    try:
        statement = select(Team).offset(skip).limit(limit)
        teams = session.exec(statement).all()
        total = session.exec(select(func.count(Team.id))).one()
        
        return {
            "teams": teams,
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}. Please ensure the PL database is configured and accessible."
        )


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
        conditions.append(Match.match_date >= date_from)
    if date_to:
        conditions.append(Match.match_date <= date_to)
    
    if conditions:
        statement = statement.where(and_(*conditions))
    
    # Order by date (newest first)
    statement = statement.order_by(Match.match_date.desc()).offset(skip).limit(limit)
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
    
    # Get player stats with player names
    player_stats_raw = session.exec(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    ).all()
    
    # Enrich player stats with player names
    player_stats = []
    for stat in player_stats_raw:
        player = session.get(Player, stat.player_id) if stat.player_id else None
        stat_dict = stat.model_dump()
        stat_dict["player_name"] = player.name if player else None
        player_stats.append(stat_dict)
    
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
    
    statement = statement.order_by(Match.match_date.desc()).offset(skip).limit(limit)
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
    
    statement = statement.order_by(Match.match_date.desc()).offset(skip).limit(limit)
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
    try:
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}. Please ensure the PL database is configured and accessible."
        )


@router.get("/head-to-head")
async def get_head_to_head(
    team1_name: str = Query(..., description="Name of first team"),
    team2_name: str = Query(..., description="Name of second team"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of matches to return"),
    session: Session = Depends(get_pl_session),
):
    """
    Get head-to-head matches between two teams from the database.
    Returns matches where the two teams played against each other.
    """
    try:
        # Find teams by name (case-insensitive, partial match)
        team1 = session.exec(
            select(Team).where(func.lower(Team.name).contains(team1_name.lower()))
        ).first()
        
        team2 = session.exec(
            select(Team).where(func.lower(Team.name).contains(team2_name.lower()))
        ).first()
        
        if not team1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team not found: {team1_name}"
            )
        
        if not team2:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team not found: {team2_name}"
            )
        
        # Get matches where team1 is home and team2 is away, or vice versa
        statement = select(Match).where(
            or_(
                and_(Match.home_team_id == team1.id, Match.away_team_id == team2.id),
                and_(Match.home_team_id == team2.id, Match.away_team_id == team1.id)
            )
        ).order_by(Match.match_date.desc()).limit(limit)
        
        matches = session.exec(statement).all()
        
        # Format matches for response
        formatted_matches = []
        for match in matches:
            is_team1_home = match.home_team_id == team1.id
            home_team = team1 if is_team1_home else team2
            away_team = team2 if is_team1_home else team1
            
            formatted_matches.append({
                "match_id": str(match.id),
                "date": match.match_date.isoformat(),
                "season": match.season,
                "matchday": match.matchday,
                "home_team": home_team.name,
                "away_team": away_team.name,
                "home_score": match.score_home,
                "away_score": match.score_away,
                "venue": match.venue,
                "status": match.status,
                "referee": match.referee,
                "attendance": match.attendance,
            })
        
        return {
            "team1": team1.name,
            "team2": team2.name,
            "matches": formatted_matches,
            "count": len(formatted_matches),
            "total_in_db": len(formatted_matches),  # Could add a count query if needed
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_db_error(e)

