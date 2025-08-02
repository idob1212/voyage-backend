from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl
from core.constants import Specialization


class LocationCreate(BaseModel):
    country: str
    city: str
    region: Optional[str] = None


class LocationResponse(BaseModel):
    id: str
    country: str
    city: str
    region: Optional[str] = None
    
    class Config:
        from_attributes = True


class TravelAgentCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    license_number: str
    country: str
    city: str
    address: Optional[str] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = Field(None, max_length=1000)


class TravelAgentUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=200)
    address: Optional[str] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = Field(None, max_length=1000)


class TravelAgentResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    license_number: str
    country: str
    city: str
    address: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool
    rating: Optional[float] = None
    total_bookings: int
    created_at: str
    
    class Config:
        from_attributes = True


class DMCAgentCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    license_number: str
    regions: List[LocationCreate] = Field(..., min_items=1)
    specializations: List[Specialization] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    website: Optional[HttpUrl] = None
    description: Optional[str] = Field(None, max_length=1000)
    response_time_hours: Optional[int] = Field(24, ge=1, le=168)
    commission_rate: Optional[float] = Field(None, ge=0, le=1)


class DMCAgentUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=200)
    regions: Optional[List[LocationCreate]] = None
    specializations: Optional[List[Specialization]] = None
    languages: Optional[List[str]] = None
    website: Optional[HttpUrl] = None
    description: Optional[str] = Field(None, max_length=1000)
    response_time_hours: Optional[int] = Field(None, ge=1, le=168)
    commission_rate: Optional[float] = Field(None, ge=0, le=1)


class DMCAgentResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    license_number: str
    regions: List[LocationResponse]
    specializations: List[Specialization]
    languages: List[str]
    website: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool
    rating: Optional[float] = None
    total_deals: int
    response_time_hours: int
    commission_rate: Optional[float] = None
    created_at: str
    
    class Config:
        from_attributes = True


class AgentSearchFilters(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    specializations: Optional[List[Specialization]] = None
    languages: Optional[List[str]] = None
    verified_only: bool = False
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_response_time: Optional[int] = Field(None, ge=1, le=168)