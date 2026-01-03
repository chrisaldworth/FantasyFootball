#!/usr/bin/env python3
"""
Migration script to add the 'role' column to the users table.
This fixes the schema mismatch error during login.
"""
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import engine, get_session
from sqlalchemy import inspect, text
from sqlmodel import Session

def add_role_column():
    """Add the role column to users table if it doesn't exist"""
    try:
        inspector = inspect(engine)
        
        # Check if users table exists
        if "users" not in inspector.get_table_names():
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
            # SQLite uses different syntax than PostgreSQL
            if "sqlite" in str(engine.url):
                session.exec(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
            else:
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
    print("=" * 50)
    print("Migration: Adding 'role' column to users table")
    print("=" * 50)
    success = add_role_column()
    sys.exit(0 if success else 1)
