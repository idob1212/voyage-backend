from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from services.auth import get_current_active_user
from services.booking import BookingService
from services.agent import AgentService
from schemas.booking import (
    BookingCreate, BookingUpdate, BookingResponse, BookingCancellation, BookingSearchFilters
)
from schemas.base import ResponseModel, PaginationParams, PaginatedResponse
from db.session import get_db
from core.constants import UserType, BookingStatus, PaymentStatus
from utils.validators import validate_object_id

router = APIRouter()


@router.post("", response_model=ResponseModel[BookingResponse])
async def create_booking(
    booking_data: BookingCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new booking from accepted offer (travel agents only)"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can create bookings"
        )
    
    # Get travel agent profile
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found. Please create your profile first."
        )
    
    booking_service = BookingService(db)
    booking = await booking_service.create_booking(travel_agent["id"], booking_data)
    
    return ResponseModel(
        data=BookingResponse(**booking),
        message="Booking created successfully"
    )


@router.get("", response_model=ResponseModel[PaginatedResponse[BookingResponse]])
async def list_bookings(
    status: BookingStatus = Query(None),
    payment_status: PaymentStatus = Query(None),
    hotel_id: str = Query(None),
    confirmation_number: str = Query(None),
    booking_from: datetime = Query(None),
    booking_to: datetime = Query(None),
    pagination: PaginationParams = Depends(),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List bookings with filters (filtered by user type)"""
    filters = BookingSearchFilters(
        status=status,
        payment_status=payment_status,
        hotel_id=hotel_id,
        confirmation_number=confirmation_number,
        booking_from=booking_from,
        booking_to=booking_to
    )
    
    booking_service = BookingService(db)
    result = await booking_service.search_bookings(
        current_user["id"], 
        current_user["user_type"], 
        filters, 
        pagination
    )
    
    bookings = [BookingResponse(**booking) for booking in result["items"]]
    paginated_response = PaginatedResponse.create(bookings, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Bookings retrieved successfully"
    )


@router.get("/statistics", response_model=ResponseModel[dict])
async def get_booking_statistics(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get booking statistics for current user"""
    booking_service = BookingService(db)
    stats = await booking_service.get_booking_statistics(
        current_user["id"], 
        current_user["user_type"]
    )
    
    return ResponseModel(
        data=stats,
        message="Booking statistics retrieved successfully"
    )


@router.get("/confirmation/{confirmation_number}", response_model=ResponseModel[BookingResponse])
async def get_booking_by_confirmation(
    confirmation_number: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get booking by confirmation number"""
    booking_service = BookingService(db)
    booking = await booking_service.get_booking_by_confirmation(confirmation_number)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user has access to this booking
    if current_user["user_type"] == UserType.TRAVEL_AGENT:
        agent_service = AgentService(db)
        travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
        if not travel_agent or booking["travel_agent_id"] != travel_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user["user_type"] == UserType.DMC_AGENT:
        agent_service = AgentService(db)
        dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
        if not dmc_agent or booking["dmc_agent_id"] != dmc_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return ResponseModel(
        data=BookingResponse(**booking),
        message="Booking retrieved successfully"
    )


@router.get("/{booking_id}", response_model=ResponseModel[BookingResponse])
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get booking by ID"""
    validate_object_id(booking_id, "booking_id")
    
    booking_service = BookingService(db)
    booking = await booking_service.get_booking(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user has access to this booking
    if current_user["user_type"] == UserType.TRAVEL_AGENT:
        agent_service = AgentService(db)
        travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
        if not travel_agent or booking["travel_agent_id"] != travel_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user["user_type"] == UserType.DMC_AGENT:
        agent_service = AgentService(db)
        dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
        if not dmc_agent or booking["dmc_agent_id"] != dmc_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return ResponseModel(
        data=BookingResponse(**booking),
        message="Booking retrieved successfully"
    )


@router.put("/{booking_id}", response_model=ResponseModel[BookingResponse])
async def update_booking(
    booking_id: str,
    update_data: BookingUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update booking (travel agents only)"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can update bookings"
        )
    
    validate_object_id(booking_id, "booking_id")
    
    # Get travel agent profile
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found"
        )
    
    booking_service = BookingService(db)
    booking = await booking_service.update_booking(booking_id, travel_agent["id"], update_data)
    
    return ResponseModel(
        data=BookingResponse(**booking),
        message="Booking updated successfully"
    )


@router.put("/{booking_id}/cancel", response_model=ResponseModel[BookingResponse])
async def cancel_booking(
    booking_id: str,
    cancellation_data: BookingCancellation,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Cancel booking (travel agents and DMC agents)"""
    validate_object_id(booking_id, "booking_id")
    
    booking_service = BookingService(db)
    booking = await booking_service.cancel_booking(
        booking_id, 
        current_user["id"], 
        current_user["user_type"], 
        cancellation_data
    )
    
    return ResponseModel(
        data=BookingResponse(**booking),
        message="Booking cancelled successfully"
    )