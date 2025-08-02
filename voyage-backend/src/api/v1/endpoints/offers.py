from datetime import date, datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from services.auth import get_current_active_user
from services.offer import OfferService
from services.agent import AgentService
from schemas.offer import (
    OfferCreate, OfferQuote, OfferResponse, OfferSearchFilters
)
from schemas.base import ResponseModel, PaginationParams, PaginatedResponse
from db.session import get_db
from core.constants import UserType, OfferStatus
from utils.validators import validate_object_id

router = APIRouter()


@router.post("/request", response_model=ResponseModel[OfferResponse])
async def create_offer_request(
    offer_data: OfferCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new offer request (travel agents only)"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can create offer requests"
        )
    
    # Get travel agent profile
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found. Please create your profile first."
        )
    
    offer_service = OfferService(db)
    offer = await offer_service.create_offer_request(travel_agent["id"], offer_data)
    
    return ResponseModel(
        data=OfferResponse(**offer),
        message="Offer request created successfully"
    )


@router.get("", response_model=ResponseModel[PaginatedResponse[OfferResponse]])
async def list_offers(
    status: OfferStatus = Query(None),
    hotel_id: str = Query(None),
    dmc_agent_id: str = Query(None),
    travel_agent_id: str = Query(None),
    check_in_from: date = Query(None),
    check_in_to: date = Query(None),
    created_from: datetime = Query(None),
    created_to: datetime = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    pagination: PaginationParams = Depends(),
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List offers with filters (filtered by user type)"""
    filters = OfferSearchFilters(
        status=status,
        hotel_id=hotel_id,
        dmc_agent_id=dmc_agent_id,
        travel_agent_id=travel_agent_id,
        check_in_from=check_in_from,
        check_in_to=check_in_to,
        created_from=created_from,
        created_to=created_to,
        min_price=min_price,
        max_price=max_price
    )
    
    offer_service = OfferService(db)
    result = await offer_service.search_offers(
        current_user["id"], 
        current_user["user_type"], 
        filters, 
        pagination
    )
    
    offers = [OfferResponse(**offer) for offer in result["items"]]
    paginated_response = PaginatedResponse.create(offers, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Offers retrieved successfully"
    )


@router.get("/statistics", response_model=ResponseModel[dict])
async def get_offer_statistics(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get offer statistics for current user"""
    offer_service = OfferService(db)
    stats = await offer_service.get_offer_statistics(
        current_user["id"], 
        current_user["user_type"]
    )
    
    return ResponseModel(
        data=stats,
        message="Offer statistics retrieved successfully"
    )


@router.get("/{offer_id}", response_model=ResponseModel[OfferResponse])
async def get_offer(
    offer_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get offer by ID"""
    validate_object_id(offer_id, "offer_id")
    
    offer_service = OfferService(db)
    offer = await offer_service.get_offer(offer_id)
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Check if user has access to this offer
    if current_user["user_type"] == UserType.TRAVEL_AGENT:
        agent_service = AgentService(db)
        travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
        if not travel_agent or offer["travel_agent_id"] != travel_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user["user_type"] == UserType.DMC_AGENT:
        agent_service = AgentService(db)
        dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
        if not dmc_agent or offer["dmc_agent_id"] != dmc_agent["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return ResponseModel(
        data=OfferResponse(**offer),
        message="Offer retrieved successfully"
    )


@router.put("/{offer_id}/quote", response_model=ResponseModel[OfferResponse])
async def quote_offer(
    offer_id: str,
    quote_data: OfferQuote,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Provide quote for offer (DMC agents only)"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can provide quotes"
        )
    
    validate_object_id(offer_id, "offer_id")
    
    # Get DMC agent profile
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    offer_service = OfferService(db)
    offer = await offer_service.quote_offer(offer_id, dmc_agent["id"], quote_data)
    
    return ResponseModel(
        data=OfferResponse(**offer),
        message="Quote provided successfully"
    )


@router.put("/{offer_id}/accept", response_model=ResponseModel[OfferResponse])
async def accept_offer(
    offer_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Accept offer (travel agents only)"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can accept offers"
        )
    
    validate_object_id(offer_id, "offer_id")
    
    # Get travel agent profile
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found"
        )
    
    offer_service = OfferService(db)
    offer = await offer_service.accept_offer(offer_id, travel_agent["id"])
    
    return ResponseModel(
        data=OfferResponse(**offer),
        message="Offer accepted successfully"
    )


@router.put("/{offer_id}/reject", response_model=ResponseModel[OfferResponse])
async def reject_offer(
    offer_id: str,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reject offer (travel agents only)"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can reject offers"
        )
    
    validate_object_id(offer_id, "offer_id")
    
    # Get travel agent profile
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found"
        )
    
    offer_service = OfferService(db)
    offer = await offer_service.reject_offer(offer_id, travel_agent["id"])
    
    return ResponseModel(
        data=OfferResponse(**offer),
        message="Offer rejected successfully"
    )