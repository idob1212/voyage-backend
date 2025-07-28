from typing import Optional
from pydantic import EmailStr, Field
from .base import BaseDocument, PyObjectId
from ..core.constants import UserType


class User(BaseDocument):
    email: EmailStr = Field(..., unique=True)
    password_hash: str
    user_type: UserType
    is_active: bool = True
    is_verified: bool = False
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "user_type": "travel_agent",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1234567890"
            }
        }