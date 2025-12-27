"""
Import scraped match data from JSON files into database
Usage: python scripts/import_match_data.py --season 2025-2026 --data-dir data
"""
import argparse
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import directly to avoid importing other services that may have dependencies
from app.services.match_import_service import MatchImportService


def main():
    """Main function to run the import"""
    parser = argparse.ArgumentParser(description="Import scraped match data into database")
    parser.add_argument("--season", required=True, help="Season (e.g., 2025-2026)")
    parser.add_argument("--data-dir", default="data", help="Data directory path (relative to backend/)")
    args = parser.parse_args()
    
    # Resolve data directory path
    script_dir = Path(__file__).parent.parent
    if Path(args.data_dir).is_absolute():
        data_dir = Path(args.data_dir)
    else:
        data_dir = script_dir / args.data_dir
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)
    
    print(f"\n{'='*60}")
    print(f"Importing Match Data for Season: {args.season}")
    print(f"{'='*60}\n")
    print(f"Data directory: {data_dir}")
    
    # Create import service
    import_service = MatchImportService(season=args.season, data_dir=data_dir)
    
    # Run import
    result = import_service.run()
    
    # Print summary
    print(f"\n{'='*60}")
    print("Import Summary")
    print(f"{'='*60}")
    print(f"Total matches processed: {result['total']}")
    print(f"Successfully imported: {result['imported']}")
    print(f"Errors: {len(result['errors'])}")
    
    if result['errors']:
        print("\nErrors encountered:")
        for error in result['errors'][:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(result['errors']) > 10:
            print(f"  ... and {len(result['errors']) - 10} more errors")
    
    print(f"\n{'='*60}\n")
    
    # Exit with error code if there were errors
    if result['errors']:
        sys.exit(1)


if __name__ == "__main__":
    main()
