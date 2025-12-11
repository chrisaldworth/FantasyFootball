"""
Admin utilities for database management and migrations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
from app.core.database import get_session, engine
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/fix-schema")
async def fix_schema(
    session: Session = Depends(get_session),
    # Allow unauthenticated access for initial setup - remove in production if needed
    # current_user: User = Depends(get_current_user)
):
    """
    Fix database schema by adding missing columns.
    WARNING: For initial setup, this is unauthenticated. 
    Consider adding authentication in production.
    """
    try:
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        
        # Expected columns
        expected_columns = {
            "id": "INTEGER PRIMARY KEY",
            "email": "VARCHAR UNIQUE",
            "hashed_password": "VARCHAR",
            "username": "VARCHAR UNIQUE",
            "fpl_team_id": "INTEGER",
            "fpl_email": "VARCHAR",
            "fpl_password_encrypted": "VARCHAR",
            "favorite_team_id": "INTEGER",
            "is_active": "BOOLEAN DEFAULT TRUE",
            "is_premium": "BOOLEAN DEFAULT FALSE",
            "created_at": "TIMESTAMP",
            "updated_at": "TIMESTAMP"
        }
        
        missing_columns = set(expected_columns.keys()) - set(column_names)
        
        if not missing_columns:
            return {
                "status": "ok",
                "message": "Schema is up to date - no missing columns",
                "existing_columns": column_names
            }
        
        # Add missing columns (PostgreSQL)
        changes_made = []
        for col_name in missing_columns:
            col_type = expected_columns[col_name]
            try:
                # PostgreSQL ALTER TABLE syntax
                if "INTEGER" in col_type:
                    default = "DEFAULT NULL" if "PRIMARY KEY" not in col_type else ""
                    alter_sql = f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} INTEGER {default}'
                elif "VARCHAR" in col_type:
                    alter_sql = f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} VARCHAR'
                elif "BOOLEAN" in col_type:
                    default = "DEFAULT FALSE" if "premium" in col_name else "DEFAULT TRUE"
                    alter_sql = f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} BOOLEAN {default}'
                elif "TIMESTAMP" in col_type:
                    default = "DEFAULT CURRENT_TIMESTAMP"
                    alter_sql = f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} TIMESTAMP {default}'
                else:
                    alter_sql = f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}'
                
                session.exec(text(alter_sql))
                session.commit()
                changes_made.append(col_name)
                print(f"[Admin] Added column: {col_name}")
            except Exception as e:
                print(f"[Admin] Error adding column {col_name}: {str(e)}")
                session.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to add column {col_name}: {str(e)}"
                )
        
        return {
            "status": "ok",
            "message": f"Schema updated - added {len(changes_made)} column(s)",
            "columns_added": changes_made,
            "all_columns": list(set(column_names) | set(changes_made))
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Schema fix failed: {str(e)}"
        )


@router.get("/schema-check")
async def schema_check(
    session: Session = Depends(get_session)
):
    """
    Check database schema and compare with expected model.
    No authentication required - useful for debugging.
    """
    try:
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if "users" not in tables:
            return {
                "status": "error",
                "message": "users table does not exist",
                "tables": tables
            }
        
        columns = inspector.get_columns("users")
        column_info = {col["name"]: str(col["type"]) for col in columns}
        column_names = list(column_info.keys())
        
        # Expected columns from User model
        expected_columns = [
            "id", "email", "hashed_password", "username",
            "fpl_team_id", "fpl_email", "fpl_password_encrypted",
            "favorite_team_id", "is_active", "is_premium",
            "created_at", "updated_at"
        ]
        
        missing_columns = set(expected_columns) - set(column_names)
        extra_columns = set(column_names) - set(expected_columns)
        
        return {
            "status": "ok" if not missing_columns else "needs_update",
            "tables": tables,
            "columns": column_info,
            "expected_columns": expected_columns,
            "missing_columns": list(missing_columns) if missing_columns else None,
            "extra_columns": list(extra_columns) if extra_columns else None,
            "schema_match": len(missing_columns) == 0
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }

