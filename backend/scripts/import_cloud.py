"""
Import match data to cloud database via API
Usage: python scripts/import_cloud.py --email admin@example.com --password password
"""
import argparse
import requests
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def import_to_cloud(email: str, password: str, season: str = "2025-2026", base_url: str = "https://fpl-companion-api.onrender.com"):
    """Import match data to cloud database via API"""
    
    print(f"\n{'='*60}")
    print(f"Cloud Database Import")
    print(f"{'='*60}\n")
    print(f"Base URL: {base_url}")
    print(f"Season: {season}\n")
    
    # Step 1: Login to get token
    print("Step 1: Logging in as admin...")
    try:
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            data={
                "username": email,
                "password": password,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
        
        token = login_response.json().get("access_token")
        if not token:
            print("❌ No access token received")
            return False
        
        print("✅ Login successful\n")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Login error: {str(e)}")
        return False
    
    # Step 2: Trigger import
    print("Step 2: Triggering data import...")
    try:
        import_response = requests.post(
            f"{base_url}/api/admin/import-match-data",
            params={"season": season},
            headers={
                "Authorization": f"Bearer {token}",
            },
            timeout=300  # 5 minutes timeout for large imports
        )
        
        if import_response.status_code == 200:
            result = import_response.json()
            print(f"\n✅ Import completed!")
            print(f"Status: {result.get('status', 'unknown')}")
            print(f"Matches imported: {result.get('matches_imported', 0)}")
            if result.get('errors'):
                print(f"Errors: {len(result.get('errors', []))}")
            return True
        elif import_response.status_code == 202:
            result = import_response.json()
            print(f"\n⏳ Import started in background")
            print(f"Status: {result.get('status', 'unknown')}")
            print(f"Match count: {result.get('match_count', 0)}")
            print("\nCheck Render logs for progress...")
            return True
        else:
            print(f"❌ Import failed: {import_response.status_code}")
            print(f"Response: {import_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Import error: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Import match data to cloud database via API")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--season", default="2025-2026", help="Season (e.g., 2025-2026)")
    parser.add_argument("--base-url", default="https://fpl-companion-api.onrender.com", help="API base URL")
    
    args = parser.parse_args()
    
    success = import_to_cloud(
        email=args.email,
        password=args.password,
        season=args.season,
        base_url=args.base_url
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()


