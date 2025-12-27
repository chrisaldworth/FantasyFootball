#!/usr/bin/env python3
"""
Helper script to inspect HTML structure for event extraction
Opens a saved HTML file and searches for event-related elements
"""

import sys
import os
from bs4 import BeautifulSoup
import re

def inspect_events_html(html_file):
    """Inspect HTML file for event structures"""
    if not os.path.exists(html_file):
        print(f"Error: File not found: {html_file}")
        return
    
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    print("=" * 80)
    print(f"Inspecting: {html_file}")
    print("=" * 80)
    
    # Look for elements with minute markers
    print("\n1. Elements containing minute markers (9', 90+3', etc.):")
    minute_elements = soup.find_all(string=re.compile(r'\d+[\'′]|\d+\+\d+[\'′]'))
    print(f"   Found {len(minute_elements)} text nodes with minutes")
    for i, elem in enumerate(minute_elements[:10]):
        parent = elem.parent
        print(f"   {i+1}. '{elem.strip()}' in <{parent.name}> with classes: {parent.get('class', [])}")
        print(f"      Text: {parent.get_text()[:100]}")
    
    # Look for player links near minutes
    print("\n2. Player links with nearby minute markers:")
    player_links = soup.find_all('a', href=re.compile(r'/players/'))
    print(f"   Found {len(player_links)} player links")
    
    for i, link in enumerate(player_links[:20]):
        player_name = link.get_text().strip()
        if not player_name:
            continue
        
        # Check parent and siblings for minutes
        parent = link.parent
        parent_text = parent.get_text() if parent else ""
        
        minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′]', parent_text)
        if minute_match:
            minute = minute_match.group(0)
            print(f"   {i+1}. {player_name} - Minute: {minute}")
            print(f"      Parent: <{parent.name}> classes: {parent.get('class', [])}")
            print(f"      Context: {parent_text[:150]}")
            print()
    
    # Look for event sections
    print("\n3. Sections with 'event', 'summary', 'goal', 'assist' in class/id:")
    event_sections = soup.find_all(['div', 'section', 'ul', 'ol'], 
                                   class_=re.compile(r'event|summary|goal|assist|card|sub', re.I))
    event_sections += soup.find_all(['div', 'section'], id=re.compile(r'event|summary|goal|assist', re.I))
    
    print(f"   Found {len(event_sections)} potential event sections")
    for i, section in enumerate(event_sections[:5]):
        print(f"   {i+1}. <{section.name}> id='{section.get('id', '')}' class='{section.get('class', [])}'")
        print(f"      Text preview: {section.get_text()[:200]}")
        print()
    
    # Look for goal scorer sections
    print("\n4. Elements containing 'Goal' or goal icons:")
    goal_elements = soup.find_all(string=re.compile(r'[Gg]oal|⚽', re.I))
    print(f"   Found {len(goal_elements)} text nodes mentioning goals")
    for i, elem in enumerate(goal_elements[:10]):
        parent = elem.parent
        print(f"   {i+1}. In <{parent.name}>: {parent.get_text()[:150]}")
        print()
    
    # Save a simplified HTML with just event-related elements
    print("\n5. Saving simplified HTML with event-related elements...")
    simplified = soup.new_tag('html')
    simplified.append(soup.new_tag('body'))
    
    for section in event_sections[:10]:
        simplified.body.append(section)
    
    output_file = html_file.replace('.html', '_events_only.html')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(str(simplified))
    print(f"   Saved to: {output_file}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python inspect_events_html.py <html_file>")
        print("Example: python inspect_events_html.py debug_html/match_report_Liverpool_Bournemouth.html")
        sys.exit(1)
    
    inspect_events_html(sys.argv[1])



