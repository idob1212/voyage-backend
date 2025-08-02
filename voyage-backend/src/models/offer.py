from datetime import datetime, date
from typing import List, Optional, Dict
from pydantic import Field
from .base import BaseDocument, PyObjectId
from ..core.constants import OfferStatus, RoomType


class RoomRequest(BaseDocument):
    room_type: RoomType
    quantity: int = 1
    adults: int = 2
    children: int = 0
    special_requests: Optional[str] = None


class QuotedRoom(BaseDocument):
    room_type: RoomType
    quantity: int
    rate_per_night: float
    total_rate: float
    currency: str = "USD"
    includes: List[str] = Field(default_factory=list)
    conditions: Optional[str] = None


class Offer(BaseDocument):
    travel_agent_id: PyObjectId
    dmc_agent_id: Optional[PyObjectId] = None
    hotel_id: PyObjectId
    
    # Request details
    check_in_date: date
    check_out_date: date
    nights: int
    rooms: List[RoomRequest]
    guest_nationality: Optional[str] = None
    special_requirements: Optional[str] = None
    
    # Quote details (filled by DMC)
    quoted_rooms: List[QuotedRoom] = Field(default_factory=list)
    total_price: Optional[float] = None
    currency: str = "USD"
    commission_rate: Optional[float] = None
    commission_amount: Optional[float] = None
    
    # Offer management
    status: OfferStatus = OfferStatus.PENDING
    expires_at: Optional[datetime] = None
    quoted_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    # Additional terms
    cancellation_policy: Optional[str] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "hotel_id": "648f1234567890abcdef1234",
                "check_in_date": "2024-06-15",
                "check_out_date": "2024-06-18",
                "nights": 3,
                "rooms": [
                    {
                        "room_type": "double",
                        "quantity": 2,
                        "adults": 4,
                        "children": 0
                    }
                ],
                "guest_nationality": "American",
                "special_requirements": "Late check-out requested"
            }
        }