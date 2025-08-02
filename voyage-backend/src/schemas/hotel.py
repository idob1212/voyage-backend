from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from core.constants import HotelAmenity, RoomType


class HotelLocationCreate(BaseModel):
    country: str
    city: str
    address: str
    postal_code: Optional[str] = None
    district: Optional[str] = None


class HotelLocationResponse(BaseModel):
    country: str
    city: str
    address: str
    postal_code: Optional[str] = None
    district: Optional[str] = None
    
    class Config:
        from_attributes = True


class RoomRateCreate(BaseModel):
    room_type: RoomType
    base_rate: float = Field(..., gt=0)
    currency: str = "USD"
    max_occupancy: int = Field(2, ge=1, le=10)
    description: Optional[str] = None


class RoomRateResponse(BaseModel):
    room_type: RoomType
    base_rate: float
    currency: str
    max_occupancy: int
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


class HotelCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    location: HotelLocationCreate
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    amenities: List[HotelAmenity] = Field(default_factory=list)
    room_types: List[RoomRateCreate] = Field(..., min_items=1)
    description: Optional[str] = Field(None, max_length=2000)
    policies: Optional[Dict[str, str]] = Field(default_factory=dict)
    contact_info: Optional[Dict[str, str]] = Field(default_factory=dict)
    minimum_stay: int = Field(1, ge=1, le=30)
    maximum_stay: Optional[int] = Field(None, ge=1, le=365)
    check_in_time: str = "15:00"
    check_out_time: str = "11:00"


class HotelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    location: Optional[HotelLocationCreate] = None
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    amenities: Optional[List[HotelAmenity]] = None
    room_types: Optional[List[RoomRateCreate]] = None
    description: Optional[str] = Field(None, max_length=2000)
    policies: Optional[Dict[str, str]] = None
    contact_info: Optional[Dict[str, str]] = None
    minimum_stay: Optional[int] = Field(None, ge=1, le=30)
    maximum_stay: Optional[int] = Field(None, ge=1, le=365)
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    is_active: Optional[bool] = None


class HotelResponse(BaseModel):
    id: str
    dmc_agent_id: str
    name: str
    location: HotelLocationResponse
    star_rating: Optional[int] = None
    amenities: List[HotelAmenity]
    room_types: List[RoomRateResponse]
    images: List[str]
    description: Optional[str] = None
    policies: Dict[str, str]
    contact_info: Dict[str, str]
    is_active: bool
    minimum_stay: int
    maximum_stay: Optional[int] = None
    check_in_time: str
    check_out_time: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class HotelSearchFilters(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    min_star_rating: Optional[int] = Field(None, ge=1, le=5)
    max_star_rating: Optional[int] = Field(None, ge=1, le=5)
    amenities: Optional[List[HotelAmenity]] = None
    room_types: Optional[List[RoomType]] = None
    min_rate: Optional[float] = Field(None, gt=0)
    max_rate: Optional[float] = Field(None, gt=0)
    dmc_agent_id: Optional[str] = None