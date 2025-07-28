from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from ..core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_refresh_token
)
from ..models.user import User
from ..schemas.user import UserCreate, UserLogin, TokenResponse
from ..utils.helpers import prepare_document_for_response
from ..db.session import get_db

security = HTTPBearer()


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.users

    async def create_user(self, user_data: UserCreate) -> dict:
        """Create a new user"""
        # Check if user already exists
        existing_user = await self.users_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Create user document
        user_dict = user_data.dict()
        user_dict["password_hash"] = get_password_hash(user_data.password)
        del user_dict["password"]
        
        user = User(**user_dict)
        user_doc = user.dict(by_alias=True)
        
        # Insert user
        result = await self.users_collection.insert_one(user_doc)
        
        # Get created user
        created_user = await self.users_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_user)

    async def authenticate_user(self, credentials: UserLogin) -> Optional[dict]:
        """Authenticate user with email and password"""
        user = await self.users_collection.find_one({"email": credentials.email})
        
        if not user:
            return None
            
        if not verify_password(credentials.password, user["password_hash"]):
            return None
            
        if not user.get("is_active", True):
            return None
            
        return prepare_document_for_response(user)

    async def login(self, credentials: UserLogin) -> TokenResponse:
        """Login user and return tokens"""
        user = await self.authenticate_user(credentials)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        access_token = create_access_token(subject=user["id"])
        refresh_token = create_refresh_token(subject=user["id"])

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=1800  # 30 minutes
        )

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token"""
        user_id = verify_refresh_token(refresh_token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Verify user still exists and is active
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        if not user or not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        access_token = create_access_token(subject=user_id)
        new_refresh_token = create_refresh_token(subject=user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=1800
        )

    async def get_current_user(self, token: str) -> dict:
        """Get current user from token"""
        user_id = verify_token(token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled"
            )

        return prepare_document_for_response(user)

    async def update_user_activity(self, user_id: str):
        """Update user last activity timestamp"""
        await self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_activity": datetime.utcnow()}}
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Dependency to get current authenticated user"""
    auth_service = AuthService(db)
    token = credentials.credentials
    user = await auth_service.get_current_user(token)
    
    # Update user activity
    await auth_service.update_user_activity(user["id"])
    
    return user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Dependency to get current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user