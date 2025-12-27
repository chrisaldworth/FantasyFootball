#!/usr/bin/env python3
"""
Setup script for Admin Portal
1. Adds role column to users table
2. Optionally creates or updates an admin user

Usage:
    cd backend
    python3 scripts/setup_admin_portal.py
"""
import sys
import os
from typing import Optional

# Add backend directory to path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Change to backend directory
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
        # Check if column already exists
        if check_role_column_exists(session):
            print("✓ Role column already exists")
            return True
        
        # Add the column
        alter_sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user'"
        session.exec(text(alter_sql))
        session.commit()
        print("✓ Added role column to users table")
        return True
    except Exception as e:
        print(f"✗ Error adding role column: {e}")
        session.rollback()
        return False


def create_or_update_admin_user(session: Session, email: str, password: Optional[str] = None, role: str = "admin") -> bool:
    """Create or update an admin user"""
    try:
        # Check if user exists
        user = session.exec(select(User).where(User.email == email)).first()
        
        if user:
            # Update existing user
            user.role = role
            if password:
                user.hashed_password = get_password_hash(password)
            session.add(user)
            session.commit()
            print(f"✓ Updated user '{email}' to role '{role}'")
            return True
        else:
            # Create new user
            if not password:
                print(f"✗ Cannot create new user '{email}' without password")
                return False
            
            new_user = User(
                email=email,
                username=email.split('@')[0],  # Use email prefix as username
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
    print("=" * 60)
    print("Admin Portal Setup")
    print("=" * 60)
    print()
    
    # Get database session
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Step 1: Add role column
        print("Step 1: Checking database schema...")
        if not add_role_column(session):
            print("✗ Failed to add role column")
            return 1
        print()
        
        # Step 2: Ask about admin user
        print("Step 2: Admin User Setup")
        create_admin = input("Do you want to create/update an admin user? (y/n): ").strip().lower()
        
        if create_admin == 'y':
            email = input("Enter admin email: ").strip()
            if not email:
                print("✗ Email is required")
                return 1
            
            # Check if user exists
            existing_user = session.exec(select(User).where(User.email == email)).first()
            
            if existing_user:
                print(f"User '{email}' already exists. Updating to admin role...")
                password = input("Enter new password (or press Enter to keep existing): ").strip()
                role = input("Enter role (admin/super_admin) [default: admin]: ").strip() or "admin"
                
                if role not in ["admin", "super_admin"]:
                    print("✗ Invalid role. Must be 'admin' or 'super_admin'")
                    return 1
                
                create_or_update_admin_user(session, email, password if password else None, role)
            else:
                password = input("Enter password for new admin user: ").strip()
                if not password:
                    print("✗ Password is required for new users")
                    return 1
                
                role = input("Enter role (admin/super_admin) [default: admin]: ").strip() or "admin"
                if role not in ["admin", "super_admin"]:
                    print("✗ Invalid role. Must be 'admin' or 'super_admin'")
                    return 1
                
                create_or_update_admin_user(session, email, password, role)
        
        print()
        print("=" * 60)
        print("✓ Admin Portal setup complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Start your backend server: uvicorn app.main:app --reload")
        print("2. Log in with your admin account")
        print("3. Navigate to /admin in your frontend")
        print()
        
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

