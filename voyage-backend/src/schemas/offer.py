from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from core.constants import OfferStatus, RoomType


class RoomRequestCreate(BaseModel):
    room_type: RoomType
    quantity: int = Field(1, ge=1, le=10)
    adults: int = Field(2, ge=1, le=8)
    children: int = Field(0, ge=0, le=4)
    special_requests: Optional[str] = Field(None, max_length=500)


class RoomRequestResponse(BaseModel):
    room_type: RoomType
    quantity: int
    adults: int
    children: int
    special_requests: Optional[str] = None
    
    class Config:
        from_attributes = True


class QuotedRoomCreate(BaseModel):
    room_type: RoomType
    quantity: int = Field(..., ge=1, le=10)
    rate_per_night: float = Field(..., gt=0)
    total_rate: float = Field(..., gt=0)
    currency: str = "USD"
    includes: List[str] = Field(default_factory=list)
    conditions: Optional[str] = Field(None, max_length=500)


class QuotedRoomResponse(BaseModel):
    room_type: RoomType
    quantity: int
    rate_per_night: float
    total_rate: float
    currency: str
    includes: List[str]
    conditions: Optional[str] = None
    
    class Config:
        from_attributes = True


class OfferCreate(BaseModel):
    hotel_id: str
    check_in_date: date
    check_out_date: date
    rooms: List[RoomRequestCreate] = Field(..., min_items=1)
    guest_nationality: Optional[str] = None
    special_requirements: Optional[str] = Field(None, max_length=1000)
    
    @validator('check_out_date')
    def validate_dates(cls, v, values):
        if 'check_in_date' in values and v <= values['check_in_date']:
            raise ValueError('Check-out date must be after check-in date')
        return v
    
    @validator('check_in_date')
    def validate_check_in_date(cls, v):
        if v < date.today():
            raise ValueError('Check-in date cannot be in the past')
        return v


class OfferQuote(BaseModel):
    quoted_rooms: List[QuotedRoomCreate] = Field(..., min_items=1)
    total_price: float = Field(..., gt=0)
    currency: str = "USD"
    commission_rate: Optional[float] = Field(None, ge=0, le=1)
    cancellation_policy: Optional[str] = Field(None, max_length=1000)
    payment_terms: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    expires_in_hours: int = Field(48, ge=1, le=168)


class OfferResponse(BaseModel):
    id: str
    travel_agent_id: str
    dmc_agent_id: Optional[str] = None
    hotel_id: str
    
    check_in_date: str
    check_out_date: str
    nights: int
    rooms: List[RoomRequestResponse]
    guest_nationality: Optional[str] = None
    special_requirements: Optional[str] = None
    
    quoted_rooms: List[QuotedRoomResponse]
    total_price: Optional[float] = None
    currency: str
    commission_rate: Optional[float] = None
    commission_amount: Optional[float] = None
    
    status: OfferStatus
    expires_at: Optional[str] = None
    quoted_at: Optional[str] = None
    responded_at: Optional[str] = None
    
    cancellation_policy: Optional[str] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class OfferSearchFilters(BaseModel):
    status: Optional[OfferStatus] = None
    hotel_id: Optional[str] = None
    dmc_agent_id: Optional[str] = None
    travel_agent_id: Optional[str] = None
    check_in_from: Optional[date] = None
    check_in_to: Optional[date] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None
    min_price: Optional[float] = Field(None, gt=0)
    max_price: Optional[float] = Field(None, gt=0)