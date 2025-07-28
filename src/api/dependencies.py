from fastapi import HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..services.auth import get_current_active_user
from ..services.agent import AgentService
from ..core.constants import UserType
from ..db.session import get_db


async def get_current_travel_agent(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Dependency to get current travel agent profile"""
    if current_user["user_type"] != UserType.TRAVEL_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Travel agent access required"
        )
    
    agent_service = AgentService(db)
    travel_agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    
    if not travel_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel agent profile not found. Please create your profile first."
        )
    
    return travel_agent


async def get_current_dmc_agent(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Dependency to get current DMC agent profile"""
    if current_user["user_type"] != UserType.DMC_AGENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="DMC agent access required"
        )
    
    agent_service = AgentService(db)
    dmc_agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    
    if not dmc_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DMC agent profile not found. Please create your profile first."
        )
    
    return dmc_agent


async def require_verified_agent(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Dependency to require verified agent status"""
    agent_service = AgentService(db)
    
    if current_user["user_type"] == UserType.TRAVEL_AGENT:
        agent = await agent_service.get_travel_agent_by_user_id(current_user["id"])
    elif current_user["user_type"] == UserType.DMC_AGENT:
        agent = await agent_service.get_dmc_agent_by_user_id(current_user["id"])
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent access required"
        )
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent profile not found"
        )
    
    if not agent.get("is_verified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verified agent status required"
        )
    
    return agent