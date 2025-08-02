from typing import List, Optional
from pydantic import Field
from .base import BaseDocument, PyObjectId
from ..core.constants import Specialization


class Location(BaseDocument):
    country: str
    city: str
    region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TravelAgent(BaseDocument):
    user_id: PyObjectId = Field(..., unique=True)
    company_name: str
    license_number: str
    country: str
    city: str
    address: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool = False
    verification_documents: List[str] = Field(default_factory=list)
    rating: Optional[float] = None
    total_bookings: int = 0
    
    class Config:
        schema_extra = {
            "example": {
                "company_name": "Global Travel Solutions",
                "license_number": "GTS-2023-001",
                "country": "United States",
                "city": "New York",
                "website": "https://globaltravelsolutions.com",
                "description": "Premium travel services worldwide"
            }
        }


class DMCAgent(BaseDocument):
    user_id: PyObjectId = Field(..., unique=True)
    company_name: str
    license_number: str
    regions: List[Location] = Field(default_factory=list)
    specializations: List[Specialization] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    website: Optional[str] = None
    description: Optional[str] = None
    is_verified: bool = False
    verification_documents: List[str] = Field(default_factory=list)
    rating: Optional[float] = None
    total_deals: int = 0
    response_time_hours: Optional[int] = 24
    commission_rate: Optional[float] = None
    
    class Config:
        schema_extra = {
            "example": {
                "company_name": "Mediterranean DMC",
                "license_number": "MED-DMC-2023-001",
                "regions": [
                    {
                        "country": "Italy",
                        "city": "Rome"
                    }
                ],
                "specializations": ["luxury", "cultural"],
                "languages": ["English", "Italian", "Spanish"],
                "description": "Luxury travel experiences in Mediterranean"
            }
        }