from typing import List, Optional, Dict
from pydantic import Field
from .base import BaseDocument, PyObjectId
from ..core.constants import HotelAmenity, RoomType


class HotelLocation(BaseDocument):
    country: str
    city: str
    address: str
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None


class RoomRate(BaseDocument):
    room_type: RoomType
    base_rate: float
    currency: str = "USD"
    max_occupancy: int = 2
    description: Optional[str] = None


class Hotel(BaseDocument):
    dmc_agent_id: PyObjectId
    name: str
    location: HotelLocation
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    amenities: List[HotelAmenity] = Field(default_factory=list)
    room_types: List[RoomRate] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    policies: Optional[Dict[str, str]] = Field(default_factory=dict)
    contact_info: Optional[Dict[str, str]] = Field(default_factory=dict)
    is_active: bool = True
    minimum_stay: int = 1
    maximum_stay: Optional[int] = None
    check_in_time: str = "15:00"
    check_out_time: str = "11:00"
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Grand Hotel Roma",
                "location": {
                    "country": "Italy",
                    "city": "Rome",
                    "address": "Via del Corso 126",
                    "postal_code": "00186"
                },
                "star_rating": 5,
                "amenities": ["wifi", "pool", "spa", "restaurant"],
                "room_types": [
                    {
                        "room_type": "double",
                        "base_rate": 250.0,
                        "currency": "EUR",
                        "max_occupancy": 2
                    }
                ],
                "description": "Luxury hotel in the heart of Rome"
            }
        }