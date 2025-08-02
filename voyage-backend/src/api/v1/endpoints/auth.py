from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ....services.auth import AuthService, get_current_active_user
from ....schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse, PasswordChange
from ....schemas.base import ResponseModel
from ....db.session import get_db

router = APIRouter()


@router.post("/register", response_model=ResponseModel[UserResponse])
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user"""
    auth_service = AuthService(db)
    user = await auth_service.create_user(user_data)
    
    return ResponseModel(
        data=UserResponse(**user),
        message="User registered successfully"
    )


@router.post("/login", response_model=ResponseModel[TokenResponse])
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Login user and return access token"""
    auth_service = AuthService(db)
    tokens = await auth_service.login(credentials)
    
    return ResponseModel(
        data=tokens,
        message="Login successful"
    )


@router.post("/refresh", response_model=ResponseModel[TokenResponse])
async def refresh_token(
    refresh_token: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Refresh access token"""
    auth_service = AuthService(db)
    tokens = await auth_service.refresh_token(refresh_token)
    
    return ResponseModel(
        data=tokens,
        message="Token refreshed successfully"
    )


@router.get("/me", response_model=ResponseModel[UserResponse])
async def get_current_user_info(
    current_user: dict = Depends(get_current_active_user)
):
    """Get current user information"""
    return ResponseModel(
        data=UserResponse(**current_user),
        message="User information retrieved successfully"
    )


@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    return ResponseModel(
        message="Logout successful"
    )