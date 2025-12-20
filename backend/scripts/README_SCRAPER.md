# FBRef.com Premier League Results Scraper

This script scrapes historical Premier League match results from fbref.com and saves them to a CSV file.

## Installation

Install required dependencies:

```bash
cd backend
pip install requests beautifulsoup4 lxml
```

Or install from requirements.txt (which includes these dependencies):

```bash
pip install -r requirements.txt
```

## Usage

### Scrape a single season:

```bash
python scripts/scrape_fbref_results.py --season 2023-2024 --output pl_results_2023_2024.csv
```

### Scrape multiple seasons:

```bash
python scripts/scrape_fbref_results.py --start-season 2020 --end-season 2023 --output pl_results_2020_2023.csv
```

### Scrape current season (default):

```bash
python scripts/scrape_fbref_results.py --output pl_results_current.csv
```

## Options

- `--season SEASON`: Single season to scrape (e.g., "2023-2024")
- `--start-season YEAR`: Start year for multi-season scrape (e.g., 2020)
- `--end-season YEAR`: End year for multi-season scrape (e.g., 2023)
- `--output FILE`: Output CSV file path (default: `pl_results.csv`)
- `--delay SECONDS`: Delay between requests in seconds (default: 1.0)

## Output Format

The CSV file will contain the following columns:

- `season`: Season (e.g., "2023-2024")
- `week`: Gameweek number
- `date`: Match date
- `home_team`: Home team name
- `away_team`: Away team name
- `home_score`: Home team score
- `away_score`: Away team score
- `attendance`: Match attendance (if available)
- `referee`: Referee name (if available)
- `result`: Result code (W/L/D for postponed/cancelled matches)

## Notes

- The script includes a delay between requests to be respectful to fbref.com
- If the page structure changes, the script may need to be updated
- The script saves debug HTML to `debug_fbref.html` if it can't find the results table

## Example

```bash
# Scrape 2023-2024 season
python scripts/scrape_fbref_results.py --season 2023-2024 --output data/pl_2023_2024.csv

# Scrape last 5 seasons
python scripts/scrape_fbref_results.py --start-season 2019 --end-season 2023 --output data/pl_2019_2023.csv
```

