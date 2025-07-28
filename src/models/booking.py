from datetime import datetime
from typing import Optional, Dict, List
from pydantic import Field
from .base import BaseDocument, PyObjectId
from ..core.constants import BookingStatus, PaymentStatus


class GuestInfo(BaseDocument):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class PaymentInfo(BaseDocument):
    amount: float
    currency: str = "USD"
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_date: Optional[datetime] = None
    refund_amount: Optional[float] = None
    refund_date: Optional[datetime] = None


class Booking(BaseDocument):
    offer_id: PyObjectId
    travel_agent_id: PyObjectId
    dmc_agent_id: PyObjectId
    hotel_id: PyObjectId
    
    confirmation_number: str = Field(..., unique=True)
    
    # Guest information
    lead_guest: GuestInfo
    additional_guests: List[GuestInfo] = Field(default_factory=list)
    
    # Booking details
    status: BookingStatus = BookingStatus.CONFIRMED
    booking_date: datetime = Field(default_factory=datetime.utcnow)
    
    # Payment information
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_info: Optional[PaymentInfo] = None
    
    # Cancellation
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancellation_fee: Optional[float] = None
    
    # Additional information
    special_requests: Optional[str] = None
    internal_notes: Optional[str] = None
    guest_notes: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "confirmation_number": "VYG-2024-001234",
                "lead_guest": {
                    "first_name": "John",
                    "last_name": "Smith",
                    "email": "john.smith@email.com",
                    "phone": "+1234567890",
                    "nationality": "American"
                },
                "special_requests": "Honeymoon decoration requested"
            }
        }