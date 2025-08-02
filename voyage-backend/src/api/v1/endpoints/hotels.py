from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from services.auth import get_current_active_user
from services.hotel import HotelService
from services.agent import AgentService
from schemas.hotel import (
    HotelCreate, HotelUpdate, HotelResponse, HotelSearchFilters
)
from schemas.base import ResponseModel, PaginationParams, PaginatedResponse
from db.session import get_db
from core.constants import UserType, HotelAmenity, RoomType
from utils.validators import validate_object_id

router = APIRouter()


@router.post("", response_model=ResponseModel[HotelResponse])
async def create_hotel(
    hotel_data: HotelCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new hotel (DMC agents only)"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can create hotels"
        )
    
    # Get DMC agent profile
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found. Please create your profile first."
        )
    
    hotel_service = HotelService(db)
    hotel = await hotel_service.create_hotel(dmc_agent["id"], hotel_data)
    
    return ResponseModel(
        data=HotelResponse(**hotel),
        message="Hotel created successfully"
    )


@router.get("/search", response_model=ResponseModel[PaginatedResponse[HotelResponse]])
async def search_hotels(
    country: str = Query(None),
    city: str = Query(None),
    district: str = Query(None),
    min_star_rating: int = Query(None),
    max_star_rating: int = Query(None),
    amenities: List[HotelAmenity] = Query(None),
    room_types: List[RoomType] = Query(None),
    min_rate: float = Query(None),
    max_rate: float = Query(None),
    pagination: PaginationParams = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Search hotels with filters"""
    filters = HotelSearchFilters(
        country=country,
        city=city,
        district=district,
        min_star_rating=min_star_rating,
        max_star_rating=max_star_rating,
        amenities=amenities,
        room_types=room_types,
        min_rate=min_rate,
        max_rate=max_rate
    )
    
    hotel_service = HotelService(db)
    result = await hotel_service.search_hotels(filters, pagination)
    
    hotels = [HotelResponse(**hotel) for hotel in result["items"]]
    paginated_response = PaginatedResponse.create(hotels, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Hotels retrieved successfully"
    )


@router.get("/my-hotels", response_model=ResponseModel[PaginatedResponse[HotelResponse]])
async def get_my_hotels(
    pagination: PaginationParams = Depends(),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current DMC agent's hotels"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can access this endpoint"
        )
    
    # Get DMC agent profile
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    hotel_service = HotelService(db)
    result = await hotel_service.get_hotels_by_dmc(dmc_agent["id"], pagination)
    
    hotels = [HotelResponse(**hotel) for hotel in result["items"]]
    paginated_response = PaginatedResponse.create(hotels, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Hotels retrieved successfully"
    )


@router.get("/{hotel_id}", response_model=ResponseModel[HotelResponse])
async def get_hotel(
    hotel_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get hotel by ID"""
    validate_object_id(hotel_id, "hotel_id")
    
    hotel_service = HotelService(db)
    hotel = await hotel_service.get_hotel(hotel_id)
    
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    return ResponseModel(
        data=HotelResponse(**hotel),
        message="Hotel retrieved successfully"
    )


@router.put("/{hotel_id}", response_model=ResponseModel[HotelResponse])
async def update_hotel(
    hotel_id: str,
    update_data: HotelUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update hotel (only by owning DMC agent)"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can update hotels"
        )
    
    validate_object_id(hotel_id, "hotel_id")
    
    # Get DMC agent profile
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    hotel_service = HotelService(db)
    hotel = await hotel_service.update_hotel(hotel_id, dmc_agent["id"], update_data)
    
    return ResponseModel(
        data=HotelResponse(**hotel),
        message="Hotel updated successfully"
    )


@router.delete("/{hotel_id}", response_model=ResponseModel[dict])
async def delete_hotel(
    hotel_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete hotel (only by owning DMC agent)"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can delete hotels"
        )
    
    validate_object_id(hotel_id, "hotel_id")
    
    # Get DMC agent profile
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    hotel_service = HotelService(db)
    success = await hotel_service.delete_hotel(hotel_id, dmc_agent["id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete hotel"
        )
    
    return ResponseModel(
        data={"deleted": True},
        message="Hotel deleted successfully"
    )


@router.get("/availability/search", response_model=ResponseModel[PaginatedResponse[HotelResponse]])
async def search_available_hotels(
    check_in_date: str = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out_date: str = Query(..., description="Check-out date (YYYY-MM-DD)"),
    rooms: int = Query(1, ge=1, le=10, description="Number of rooms"),
    country: str = Query(None),
    city: str = Query(None),
    amenities: List[HotelAmenity] = Query(None),
    room_types: List[RoomType] = Query(None),
    pagination: PaginationParams = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Search available hotels for specific dates"""
    filters = HotelSearchFilters(
        country=country,
        city=city,
        amenities=amenities,
        room_types=room_types
    )
    
    hotel_service = HotelService(db)
    result = await hotel_service.get_available_hotels(
        check_in_date, check_out_date, rooms, filters, pagination
    )
    
    hotels = [HotelResponse(**hotel) for hotel in result["items"]]
    paginated_response = PaginatedResponse.create(hotels, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Available hotels retrieved successfully"
    )