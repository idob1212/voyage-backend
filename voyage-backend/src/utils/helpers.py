import uuid
from datetime import datetime, date
from typing import Any, Dict, Optional
from bson import ObjectId


def generate_confirmation_number() -> str:
    """Generate unique booking confirmation number"""
    year = datetime.now().year
    unique_id = str(uuid.uuid4().int)[:6]
    return f"VYG-{year}-{unique_id}"


def convert_objectid_to_str(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ObjectId fields to strings in a dictionary"""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, ObjectId):
                obj[key] = str(value)
            elif isinstance(value, dict):
                obj[key] = convert_objectid_to_str(value)
            elif isinstance(value, list):
                obj[key] = [convert_objectid_to_str(item) if isinstance(item, dict) else item for item in value]
    return obj


def convert_datetime_to_str(obj: Dict[str, Any]) -> Dict[str, Any]:
    """Convert datetime fields to ISO strings in a dictionary"""
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, datetime):
                obj[key] = value.isoformat()
            elif isinstance(value, date):
                obj[key] = value.isoformat()
            elif isinstance(value, dict):
                obj[key] = convert_datetime_to_str(value)
            elif isinstance(value, list):
                obj[key] = [convert_datetime_to_str(item) if isinstance(item, dict) else item for item in value]
    return obj


def prepare_document_for_response(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Prepare MongoDB document for API response"""
    if not doc:
        return doc
    
    # Convert _id to id
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    
    # Convert ObjectId fields to strings
    doc = convert_objectid_to_str(doc)
    
    # Convert datetime fields to strings
    doc = convert_datetime_to_str(doc)
    
    return doc


def calculate_nights(check_in: date, check_out: date) -> int:
    """Calculate number of nights between check-in and check-out dates"""
    return (check_out - check_in).days


def calculate_commission(total_price: float, commission_rate: float) -> float:
    """Calculate commission amount"""
    if commission_rate <= 0 or commission_rate > 1:
        return 0.0
    return round(total_price * commission_rate, 2)


def mask_sensitive_data(data: str, show_chars: int = 4) -> str:
    """Mask sensitive data showing only specified number of characters"""
    if not data or len(data) <= show_chars:
        return data
    
    visible_chars = show_chars // 2
    return data[:visible_chars] + "*" * (len(data) - show_chars) + data[-visible_chars:]


def validate_date_range(start_date: date, end_date: date, max_days: int = 365) -> bool:
    """Validate date range"""
    if start_date >= end_date:
        return False
    
    days_diff = (end_date - start_date).days
    return days_diff <= max_days


def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency amount"""
    return f"{amount:.2f} {currency}"