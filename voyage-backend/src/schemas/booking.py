from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from core.constants import BookingStatus, PaymentStatus


class GuestInfoCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class GuestInfoResponse(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    
    class Config:
        from_attributes = True


class PaymentInfoCreate(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    payment_method: Optional[str] = None


class PaymentInfoResponse(BaseModel):
    amount: float
    currency: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_date: Optional[str] = None
    refund_amount: Optional[float] = None
    refund_date: Optional[str] = None
    
    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    offer_id: str
    lead_guest: GuestInfoCreate
    additional_guests: List[GuestInfoCreate] = Field(default_factory=list)
    special_requests: Optional[str] = Field(None, max_length=1000)
    guest_notes: Optional[str] = Field(None, max_length=500)


class BookingUpdate(BaseModel):
    lead_guest: Optional[GuestInfoCreate] = None
    additional_guests: Optional[List[GuestInfoCreate]] = None
    special_requests: Optional[str] = Field(None, max_length=1000)
    guest_notes: Optional[str] = Field(None, max_length=500)


class BookingResponse(BaseModel):
    id: str
    offer_id: str
    travel_agent_id: str
    dmc_agent_id: str
    hotel_id: str
    
    confirmation_number: str
    
    lead_guest: GuestInfoResponse
    additional_guests: List[GuestInfoResponse]
    
    status: BookingStatus
    booking_date: str
    
    payment_status: PaymentStatus
    payment_info: Optional[PaymentInfoResponse] = None
    
    cancelled_at: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancellation_fee: Optional[float] = None
    
    special_requests: Optional[str] = None
    internal_notes: Optional[str] = None
    guest_notes: Optional[str] = None
    
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class BookingCancellation(BaseModel):
    cancellation_reason: str = Field(..., min_length=10, max_length=500)


class BookingSearchFilters(BaseModel):
    status: Optional[BookingStatus] = None
    payment_status: Optional[PaymentStatus] = None
    travel_agent_id: Optional[str] = None
    dmc_agent_id: Optional[str] = None
    hotel_id: Optional[str] = None
    confirmation_number: Optional[str] = None
    booking_from: Optional[datetime] = None
    booking_to: Optional[datetime] = None