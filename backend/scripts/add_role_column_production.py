#!/usr/bin/env python3
"""
Migration script to add the 'role' column to the users table in production database.
This fixes the schema mismatch error during login.
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, inspect, text
from sqlmodel import Session

def add_role_column(database_url: str):
    """Add the role column to users table if it doesn't exist"""
    try:
        # Create engine with the provided database URL
        # For PostgreSQL, ensure SSL is required
        if database_url.startswith("postgresql://"):
            # Add SSL parameters if not present
            if "sslmode" not in database_url:
                database_url += "&sslmode=require" if "?" in database_url else "?sslmode=require"
        
        engine = create_engine(
            database_url,
            echo=True,  # Show SQL queries
            pool_pre_ping=True,  # Verify connections before using
        )
        
        inspector = inspect(engine)
        
        # Check if users table exists
        tables = inspector.get_table_names()
        if "users" not in tables:
            print("❌ Users table does not exist!")
            return False
        
        # Check current columns
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        print(f"Current columns: {column_names}")
        
        # Check if role column already exists
        if "role" in column_names:
            print("✅ Role column already exists. No migration needed.")
            return True
        
        # Add the role column
        print("Adding 'role' column to users table...")
        with Session(engine) as session:
            # PostgreSQL syntax
            session.exec(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user'"))
            session.commit()
        
        # Verify the column was added
        inspector = inspect(engine)
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        
        if "role" in column_names:
            print("✅ Successfully added 'role' column to users table!")
            print(f"Updated columns: {column_names}")
            return True
        else:
            print("❌ Failed to add role column")
            return False
            
    except Exception as e:
        print(f"❌ Error adding role column: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Get database URL from command line argument or environment variable
    if len(sys.argv) > 1:
        database_url = sys.argv[1]
    elif os.environ.get("DATABASE_URL"):
        database_url = os.environ.get("DATABASE_URL")
    else:
        print("❌ Error: Please provide DATABASE_URL as argument or environment variable")
        print("Usage: python3 add_role_column_production.py <DATABASE_URL>")
        sys.exit(1)
    
    print("=" * 50)
    print("Migration: Adding 'role' column to users table (PRODUCTION)")
    print("=" * 50)
    print(f"Database: {database_url.split('@')[1] if '@' in database_url else 'hidden'}")
    print("=" * 50)
    
    success = add_role_column(database_url)
    sys.exit(0 if success else 1)
