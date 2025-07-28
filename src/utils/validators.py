import re
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status


def validate_object_id(obj_id: str, field_name: str = "id") -> str:
    """Validate MongoDB ObjectId format"""
    if not ObjectId.is_valid(obj_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )
    return obj_id


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    pattern = r'^\+?[1-9]\d{1,14}$'
    return re.match(pattern, phone) is not None


def validate_password_strength(password: str) -> Optional[str]:
    """Validate password strength and return error message if invalid"""
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return "Password must contain at least one special character"
    
    return None


def validate_confirmation_number(confirmation_number: str) -> bool:
    """Validate booking confirmation number format"""
    pattern = r'^VYG-\d{4}-\d{6}$'
    return re.match(pattern, confirmation_number) is not None


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """Sanitize and truncate string input"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    text = re.sub(r'[<>"\']', '', text)
    
    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length]
    
    return text.strip()