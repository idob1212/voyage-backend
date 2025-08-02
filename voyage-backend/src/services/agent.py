from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from bson import ObjectId

from models.agent import TravelAgent, DMCAgent
from schemas.agent import (
    TravelAgentCreate, TravelAgentUpdate, TravelAgentResponse,
    DMCAgentCreate, DMCAgentUpdate, DMCAgentResponse,
    AgentSearchFilters
)
from schemas.base import PaginationParams
from utils.helpers import prepare_document_for_response
from utils.pagination import paginate_collection
from core.constants import UserType


class AgentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.travel_agents_collection = db.travel_agents
        self.dmc_agents_collection = db.dmc_agents
        self.users_collection = db.users

    async def create_travel_agent(self, user_id: str, agent_data: TravelAgentCreate) -> dict:
        """Create a new travel agent profile"""
        # Verify user exists and is travel agent
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user["user_type"] != UserType.TRAVEL_AGENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a travel agent"
            )

        # Check if travel agent profile already exists
        existing_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
        if existing_agent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Travel agent profile already exists"
            )

        # Create travel agent document
        agent_dict = agent_data.dict()
        agent_dict["user_id"] = ObjectId(user_id)
        
        agent = TravelAgent(**agent_dict)
        agent_doc = agent.dict(by_alias=True)
        
        # Insert agent
        result = await self.travel_agents_collection.insert_one(agent_doc)
        
        # Get created agent
        created_agent = await self.travel_agents_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_agent)

    async def get_travel_agent(self, agent_id: str) -> Optional[dict]:
        """Get travel agent by ID"""
        agent = await self.travel_agents_collection.find_one({"_id": ObjectId(agent_id)})
        if not agent:
            return None
        return prepare_document_for_response(agent)

    async def get_travel_agent_by_user_id(self, user_id: str) -> Optional[dict]:
        """Get travel agent by user ID"""
        agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
        if not agent:
            return None
        return prepare_document_for_response(agent)

    async def update_travel_agent(self, agent_id: str, user_id: str, update_data: TravelAgentUpdate) -> dict:
        """Update travel agent profile"""
        # Verify ownership
        agent = await self.travel_agents_collection.find_one({
            "_id": ObjectId(agent_id),
            "user_id": ObjectId(user_id)
        })
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Travel agent not found"
            )

        # Update agent
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = None  # Will be set by the model
        
        await self.travel_agents_collection.update_one(
            {"_id": ObjectId(agent_id)},
            {"$set": update_dict}
        )
        
        # Get updated agent
        updated_agent = await self.travel_agents_collection.find_one({"_id": ObjectId(agent_id)})
        return prepare_document_for_response(updated_agent)

    async def create_dmc_agent(self, user_id: str, agent_data: DMCAgentCreate) -> dict:
        """Create a new DMC agent profile"""
        # Verify user exists and is DMC agent
        user = await self.users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user["user_type"] != UserType.DMC_AGENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a DMC agent"
            )

        # Check if DMC agent profile already exists
        existing_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
        if existing_agent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="DMC agent profile already exists"
            )

        # Create DMC agent document
        agent_dict = agent_data.dict()
        agent_dict["user_id"] = ObjectId(user_id)
        
        agent = DMCAgent(**agent_dict)
        agent_doc = agent.dict(by_alias=True)
        
        # Insert agent
        result = await self.dmc_agents_collection.insert_one(agent_doc)
        
        # Get created agent
        created_agent = await self.dmc_agents_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_agent)

    async def get_dmc_agent(self, agent_id: str) -> Optional[dict]:
        """Get DMC agent by ID"""
        agent = await self.dmc_agents_collection.find_one({"_id": ObjectId(agent_id)})
        if not agent:
            return None
        return prepare_document_for_response(agent)

    async def get_dmc_agent_by_user_id(self, user_id: str) -> Optional[dict]:
        """Get DMC agent by user ID"""
        agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
        if not agent:
            return None
        return prepare_document_for_response(agent)

    async def update_dmc_agent(self, agent_id: str, user_id: str, update_data: DMCAgentUpdate) -> dict:
        """Update DMC agent profile"""
        # Verify ownership
        agent = await self.dmc_agents_collection.find_one({
            "_id": ObjectId(agent_id),
            "user_id": ObjectId(user_id)
        })
        
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DMC agent not found"
            )

        # Update agent
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = None  # Will be set by the model
        
        await self.dmc_agents_collection.update_one(
            {"_id": ObjectId(agent_id)},
            {"$set": update_dict}
        )
        
        # Get updated agent
        updated_agent = await self.dmc_agents_collection.find_one({"_id": ObjectId(agent_id)})
        return prepare_document_for_response(updated_agent)

    async def search_dmc_agents(self, filters: AgentSearchFilters, pagination: PaginationParams) -> dict:
        """Search DMC agents with filters"""
        query = {}
        
        # Build search query
        if filters.country:
            query["regions.country"] = {"$regex": filters.country, "$options": "i"}
        
        if filters.city:
            query["regions.city"] = {"$regex": filters.city, "$options": "i"}
        
        if filters.specializations:
            query["specializations"] = {"$in": filters.specializations}
        
        if filters.languages:
            query["languages"] = {"$in": filters.languages}
        
        if filters.verified_only:
            query["is_verified"] = True
        
        if filters.min_rating:
            query["rating"] = {"$gte": filters.min_rating}
        
        if filters.max_response_time:
            query["response_time_hours"] = {"$lte": filters.max_response_time}

        # Paginate results
        result = await paginate_collection(
            self.dmc_agents_collection,
            query,
            pagination,
            sort_field="rating",
            sort_direction=-1
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def get_travel_agents(self, pagination: PaginationParams) -> dict:
        """Get all travel agents with pagination"""
        result = await paginate_collection(
            self.travel_agents_collection,
            {},
            pagination
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def verify_agent(self, agent_id: str, is_dmc: bool = False) -> dict:
        """Verify agent (admin only)"""
        collection = self.dmc_agents_collection if is_dmc else self.travel_agents_collection
        
        result = await collection.update_one(
            {"_id": ObjectId(agent_id)},
            {"$set": {"is_verified": True, "verified_at": None}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found"
            )
        
        # Get updated agent
        updated_agent = await collection.find_one({"_id": ObjectId(agent_id)})
        return prepare_document_for_response(updated_agent)