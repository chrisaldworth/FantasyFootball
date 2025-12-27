#!/usr/bin/env python3
"""
Test script to directly scrape a single match report URL
Bypasses the fixtures page to avoid Cloudflare issues
"""

import sys
import os
import json
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrape_fbref_comprehensive import extract_comprehensive_match_data, setup_driver
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def main():
    # Liverpool vs Bournemouth match report URL
    match_url = "https://fbref.com/en/matches/a071faa8/Liverpool-Bournemouth-August-15-2025-Premier-League"
    home_team = "Liverpool"
    away_team = "Bournemouth"
    
    logger.info("=" * 80)
    logger.info("Testing Single Match Scrape")
    logger.info("=" * 80)
    logger.info(f"Match: {home_team} vs {away_team}")
    logger.info(f"URL: {match_url}")
    logger.info("=" * 80)
    
    # Setup driver
    driver = setup_driver(headless=False)
    
    try:
        # Extract match data
        logger.info("Extracting comprehensive match data...")
        match_data = extract_comprehensive_match_data(
            driver=driver,
            match_url=match_url,
            home_team=home_team,
            away_team=away_team,
            delay=2.0,
            headless=False
        )
        
        if not match_data:
            logger.error("Failed to extract match data")
            return
        
        # Save to JSON
        output_dir = "backend/data/2025-2026/matches"
        os.makedirs(output_dir, exist_ok=True)
        
        filename = f"match_2025_08_15_Liverpool_vs_Bournemouth.json"
        output_path = os.path.join(output_dir, filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(match_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ Saved match data to: {output_path}")
        
        # Print team stats for verification
        logger.info("\n" + "=" * 80)
        logger.info("TEAM STATS VERIFICATION")
        logger.info("=" * 80)
        if 'team_stats' in match_data:
            home_stats = match_data['team_stats'].get('home', {})
            away_stats = match_data['team_stats'].get('away', {})
            
            logger.info(f"\n{home_team} (Home):")
            logger.info(f"  Fouls: {home_stats.get('fouls')}")
            logger.info(f"  Corners: {home_stats.get('corners')}")
            logger.info(f"  Crosses: {home_stats.get('crosses')}")
            logger.info(f"  Touches: {home_stats.get('touches')}")
            logger.info(f"  Tackles: {home_stats.get('tackles')}")
            logger.info(f"  Interceptions: {home_stats.get('interceptions')}")
            logger.info(f"  Aerials Won: {home_stats.get('aerials_won')}")
            logger.info(f"  Clearances: {home_stats.get('clearances')}")
            logger.info(f"  Offsides: {home_stats.get('offsides')}")
            logger.info(f"  Goal Kicks: {home_stats.get('goal_kicks')}")
            logger.info(f"  Throw Ins: {home_stats.get('throw_ins')}")
            logger.info(f"  Long Balls: {home_stats.get('long_balls')}")
            logger.info(f"  Yellow Cards: {home_stats.get('yellow_cards')}")
            logger.info(f"  Red Cards: {home_stats.get('red_cards')}")
            
            logger.info(f"\n{away_team} (Away):")
            logger.info(f"  Fouls: {away_stats.get('fouls')}")
            logger.info(f"  Corners: {away_stats.get('corners')}")
            logger.info(f"  Crosses: {away_stats.get('crosses')}")
            logger.info(f"  Touches: {away_stats.get('touches')}")
            logger.info(f"  Tackles: {away_stats.get('tackles')}")
            logger.info(f"  Interceptions: {away_stats.get('interceptions')}")
            logger.info(f"  Aerials Won: {away_stats.get('aerials_won')}")
            logger.info(f"  Clearances: {away_stats.get('clearances')}")
            logger.info(f"  Offsides: {away_stats.get('offsides')}")
            logger.info(f"  Goal Kicks: {away_stats.get('goal_kicks')}")
            logger.info(f"  Throw Ins: {away_stats.get('throw_ins')}")
            logger.info(f"  Long Balls: {away_stats.get('long_balls')}")
            logger.info(f"  Yellow Cards: {away_stats.get('yellow_cards')}")
            logger.info(f"  Red Cards: {away_stats.get('red_cards')}")
        
        logger.info("\n" + "=" * 80)
        logger.info("Expected values (from HTML):")
        logger.info("=" * 80)
        logger.info(f"{home_team} (Home): Fouls 7, Corners 6, Crosses 17, Touches 679, Tackles 16, Interceptions 4, Aerials Won 29, Clearances 40, Offsides 2, Goal Kicks 4, Throw Ins 27, Long Balls 65, Yellow 1, Red 0")
        logger.info(f"{away_team} (Away): Fouls 10, Corners 7, Crosses 20, Touches 491, Tackles 20, Interceptions 11, Aerials Won 18, Clearances 44, Offsides 2, Goal Kicks 11, Throw Ins 17, Long Balls 86, Yellow 2, Red 0")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
    finally:
        logger.info("Closing browser...")
        driver.quit()

if __name__ == "__main__":
    main()


