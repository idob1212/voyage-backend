from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from services.auth import get_current_active_user
from services.agent import AgentService
from schemas.agent import (
    TravelAgentCreate, TravelAgentUpdate, TravelAgentResponse,
    DMCAgentCreate, DMCAgentUpdate, DMCAgentResponse,
    AgentSearchFilters
)
from schemas.base import ResponseModel, PaginationParams, PaginatedResponse
from db.session import get_db
from core.constants import UserType

router = APIRouter()


@router.post("/travel", response_model=ResponseModel[TravelAgentResponse])
async def create_travel_agent_profile(
    agent_data: TravelAgentCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create travel agent profile"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can create travel agent profiles"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.create_travel_agent(current_user["id"], agent_data)
    
    return ResponseModel(
        data=TravelAgentResponse(**agent),
        message="Travel agent profile created successfully"
    )


@router.get("/travel/me", response_model=ResponseModel[TravelAgentResponse])
async def get_my_travel_agent_profile(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's travel agent profile"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can access this endpoint"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found"
        )
    
    return ResponseModel(
        data=TravelAgentResponse(**agent),
        message="Travel agent profile retrieved successfully"
    )


@router.put("/travel/me", response_model=ResponseModel[TravelAgentResponse])
async def update_my_travel_agent_profile(
    update_data: TravelAgentUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update current user's travel agent profile"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only travel agents can update travel agent profiles"
        )
    
    agent_service = AgentService(db)
    
    # Get current agent to verify it exists
    current_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    if not current_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found"
        )
    
    agent = await agent_service.update_travel_agent(current_agent["id"], current_user["id"], update_data)
    
    return ResponseModel(
        data=TravelAgentResponse(**agent),
        message="Travel agent profile updated successfully"
    )


@router.get("/travel", response_model=ResponseModel[PaginatedResponse[TravelAgentResponse]])
async def list_travel_agents(
    pagination: PaginationParams = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all travel agents with pagination"""
    agent_service = AgentService(db)
    result = await agent_service.get_travel_agents(pagination)
    
    agents = [TravelAgentResponse(**agent) for agent in result["items"]]
    paginated_response = PaginatedResponse.create(agents, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="Travel agents retrieved successfully"
    )


@router.post("/dmc", response_model=ResponseModel[DMCAgentResponse])
async def create_dmc_agent_profile(
    agent_data: DMCAgentCreate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create DMC agent profile"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can create DMC agent profiles"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.create_dmc_agent(current_user["id"], agent_data)
    
    return ResponseModel(
        data=DMCAgentResponse(**agent),
        message="DMC agent profile created successfully"
    )


@router.get("/dmc/me", response_model=ResponseModel[DMCAgentResponse])
async def get_my_dmc_agent_profile(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user's DMC agent profile"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can access this endpoint"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    return ResponseModel(
        data=DMCAgentResponse(**agent),
        message="DMC agent profile retrieved successfully"
    )


@router.put("/dmc/me", response_model=ResponseModel[DMCAgentResponse])
async def update_my_dmc_agent_profile(
    update_data: DMCAgentUpdate,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update current user's DMC agent profile"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DMC agents can update DMC agent profiles"
        )
    
    agent_service = AgentService(db)
    
    # Get current agent to verify it exists
    current_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    if not current_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found"
        )
    
    agent = await agent_service.update_dmc_agent(current_agent["id"], current_user["id"], update_data)
    
    return ResponseModel(
        data=DMCAgentResponse(**agent),
        message="DMC agent profile updated successfully"
    )


@router.get("/dmc/search", response_model=ResponseModel[PaginatedResponse[DMCAgentResponse]])
async def search_dmc_agents(
    country: str = Query(None),
    city: str = Query(None),
    specializations: List[str] = Query(None),
    languages: List[str] = Query(None),
    verified_only: bool = Query(False),
    min_rating: float = Query(None),
    max_response_time: int = Query(None),
    pagination: PaginationParams = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Search DMC agents with filters"""
    filters = AgentSearchFilters(
        country=country,
        city=city,
        specializations=specializations,
        languages=languages,
        verified_only=verified_only,
        min_rating=min_rating,
        max_response_time=max_response_time
    )
    
    agent_service = AgentService(db)
    result = await agent_service.search_dmc_agents(filters, pagination)
    
    agents = [DMCAgentResponse(**agent) for agent in result["items"]]
    paginated_response = PaginatedResponse.create(agents, result["total"], pagination)
    
    return ResponseModel(
        data=paginated_response,
        message="DMC agents retrieved successfully"
    )


@router.get("/dmc/{agent_id}", response_model=ResponseModel[DMCAgentResponse])
async def get_dmc_agent(
    agent_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get DMC agent by ID"""
    agent_service = AgentService(db)
    agent = await agent_service.get_dmc_agent(agent_id)
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent not found"
        )
    
    return ResponseModel(
        data=DMCAgentResponse(**agent),
        message="DMC agent retrieved successfully"
    )