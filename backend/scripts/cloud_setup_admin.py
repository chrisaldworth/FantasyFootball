#!/usr/bin/env python3
"""
Cloud deployment setup script for Admin Portal
This script can be run as a one-time setup task in cloud environments

Usage:
    python3 scripts/cloud_setup_admin.py [--email EMAIL] [--password PASSWORD] [--role ROLE]
"""
import sys
import os
import argparse
from typing import Optional

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.core.database import get_session, engine
from app.models.user import User
from app.core.security import get_password_hash
from sqlmodel import Session, select, text
from sqlalchemy import inspect


def check_role_column_exists(session: Session) -> bool:
    """Check if role column exists in users table"""
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        return "role" in column_names
    except Exception as e:
        print(f"Error checking columns: {e}")
        return False


def add_role_column(session: Session) -> bool:
    """Add role column to users table"""
    try:
        if check_role_column_exists(session):
            print("✓ Role column already exists")
            return True
        
        # PostgreSQL/SQLite compatible
        try:
            alter_sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user'"
            session.exec(text(alter_sql))
        except Exception:
            # Fallback for databases that don't support IF NOT EXISTS
            try:
                alter_sql = "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"
                session.exec(text(alter_sql))
            except Exception as e:
                if "duplicate column" not in str(e).lower() and "already exists" not in str(e).lower():
                    raise
        
        session.commit()
        print("✓ Added role column to users table")
        return True
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            print("✓ Role column already exists")
            return True
        print(f"✗ Error adding role column: {e}")
        session.rollback()
        return False


def create_or_update_admin_user(
    session: Session, 
    email: str, 
    password: Optional[str] = None, 
    role: str = "admin"
) -> bool:
    """Create or update an admin user"""
    try:
        user = session.exec(select(User).where(User.email == email)).first()
        
        if user:
            user.role = role
            if password:
                user.hashed_password = get_password_hash(password)
            session.add(user)
            session.commit()
            print(f"✓ Updated user '{email}' to role '{role}'")
            return True
        else:
            if not password:
                print(f"✗ Cannot create new user '{email}' without password")
                return False
            
            new_user = User(
                email=email,
                username=email.split('@')[0],
                hashed_password=get_password_hash(password),
                role=role,
                is_active=True
            )
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            print(f"✓ Created admin user '{email}' with role '{role}'")
            return True
    except Exception as e:
        print(f"✗ Error creating/updating admin user: {e}")
        session.rollback()
        return False


def main():
    parser = argparse.ArgumentParser(description='Cloud setup for Admin Portal')
    parser.add_argument('--email', type=str, help='Admin user email')
    parser.add_argument('--password', type=str, help='Admin user password')
    parser.add_argument('--role', type=str, default='admin', choices=['admin', 'super_admin'], 
                       help='Admin role (default: admin)')
    parser.add_argument('--skip-user', action='store_true', 
                       help='Skip user creation, only add role column')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Admin Portal Cloud Setup")
    print("=" * 60)
    print()
    
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Step 1: Add role column
        print("Step 1: Checking database schema...")
        if not add_role_column(session):
            print("✗ Failed to add role column")
            return 1
        print()
        
        # Step 2: Create admin user (if requested)
        if not args.skip_user:
            if args.email and args.password:
                print(f"Step 2: Creating/updating admin user '{args.email}'...")
                if create_or_update_admin_user(session, args.email, args.password, args.role):
                    print("✓ Admin user setup complete")
                else:
                    print("✗ Failed to create admin user")
                    return 1
            else:
                print("Step 2: Skipping user creation (use --email and --password to create)")
        else:
            print("Step 2: Skipping user creation (--skip-user flag set)")
        
        print()
        print("=" * 60)
        print("✓ Admin Portal setup complete!")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        print(f"✗ Error during setup: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        try:
            next(session_gen, None)
        except (StopIteration, UnboundLocalError, NameError):
            pass


if __name__ == "__main__":
    sys.exit(main())

