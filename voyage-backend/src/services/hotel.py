from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from bson import ObjectId

from models.hotel import Hotel
from schemas.hotel import HotelCreate, HotelUpdate, HotelSearchFilters
from schemas.base import PaginationParams
from utils.helpers import prepare_document_for_response
from utils.pagination import paginate_collection


class HotelService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.hotels_collection = db.hotels
        self.dmc_agents_collection = db.dmc_agents

    async def create_hotel(self, dmc_agent_id: str, hotel_data: HotelCreate) -> dict:
        """Create a new hotel"""
        # Verify DMC agent exists
        dmc_agent = await self.dmc_agents_collection.find_one({"_id": ObjectId(dmc_agent_id)})
        if not dmc_agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DMC agent not found"
            )

        # Create hotel document
        hotel_dict = hotel_data.dict()
        hotel_dict["dmc_agent_id"] = ObjectId(dmc_agent_id)
        
        hotel = Hotel(**hotel_dict)
        hotel_doc = hotel.dict(by_alias=True)
        
        # Insert hotel
        result = await self.hotels_collection.insert_one(hotel_doc)
        
        # Get created hotel
        created_hotel = await self.hotels_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_hotel)

    async def get_hotel(self, hotel_id: str) -> Optional[dict]:
        """Get hotel by ID"""
        hotel = await self.hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        if not hotel:
            return None
        return prepare_document_for_response(hotel)

    async def update_hotel(self, hotel_id: str, dmc_agent_id: str, update_data: HotelUpdate) -> dict:
        """Update hotel (only by owning DMC agent)"""
        # Verify ownership
        hotel = await self.hotels_collection.find_one({
            "_id": ObjectId(hotel_id),
            "dmc_agent_id": ObjectId(dmc_agent_id)
        })
        
        if not hotel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hotel not found or access denied"
            )

        # Update hotel
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = None  # Will be set by the model
        
        await self.hotels_collection.update_one(
            {"_id": ObjectId(hotel_id)},
            {"$set": update_dict}
        )
        
        # Get updated hotel
        updated_hotel = await self.hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        return prepare_document_for_response(updated_hotel)

    async def delete_hotel(self, hotel_id: str, dmc_agent_id: str) -> bool:
        """Delete hotel (only by owning DMC agent)"""
        # Verify ownership
        hotel = await self.hotels_collection.find_one({
            "_id": ObjectId(hotel_id),
            "dmc_agent_id": ObjectId(dmc_agent_id)
        })
        
        if not hotel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hotel not found or access denied"
            )

        # Soft delete by setting is_active to False
        result = await self.hotels_collection.update_one(
            {"_id": ObjectId(hotel_id)},
            {"$set": {"is_active": False, "updated_at": None}}
        )
        
        return result.modified_count > 0

    async def search_hotels(self, filters: HotelSearchFilters, pagination: PaginationParams) -> dict:
        """Search hotels with filters"""
        query = {"is_active": True}  # Only show active hotels
        
        # Build search query
        if filters.country:
            query["location.country"] = {"$regex": filters.country, "$options": "i"}
        
        if filters.city:
            query["location.city"] = {"$regex": filters.city, "$options": "i"}
        
        if filters.district:
            query["location.district"] = {"$regex": filters.district, "$options": "i"}
        
        if filters.min_star_rating:
            query.setdefault("star_rating", {})["$gte"] = filters.min_star_rating
        
        if filters.max_star_rating:
            query.setdefault("star_rating", {})["$lte"] = filters.max_star_rating
        
        if filters.amenities:
            query["amenities"] = {"$in": filters.amenities}
        
        if filters.room_types:
            query["room_types.room_type"] = {"$in": filters.room_types}
        
        if filters.min_rate or filters.max_rate:
            rate_query = {}
            if filters.min_rate:
                rate_query["$gte"] = filters.min_rate
            if filters.max_rate:
                rate_query["$lte"] = filters.max_rate
            query["room_types.base_rate"] = rate_query
        
        if filters.dmc_agent_id:
            query["dmc_agent_id"] = ObjectId(filters.dmc_agent_id)

        # Paginate results
        result = await paginate_collection(
            self.hotels_collection,
            query,
            pagination,
            sort_field="created_at",
            sort_direction=-1
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def get_hotels_by_dmc(self, dmc_agent_id: str, pagination: PaginationParams) -> dict:
        """Get all hotels for a specific DMC agent"""
        query = {
            "dmc_agent_id": ObjectId(dmc_agent_id),
            "is_active": True
        }
        
        result = await paginate_collection(
            self.hotels_collection,
            query,
            pagination
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def get_available_hotels(
        self, 
        check_in_date: str, 
        check_out_date: str, 
        rooms: int,
        filters: HotelSearchFilters,
        pagination: PaginationParams
    ) -> dict:
        """Get available hotels for specific dates (simplified - real implementation would check actual availability)"""
        # This is a simplified version. In a real system, you would:
        # 1. Check existing bookings for the date range
        # 2. Calculate available rooms per hotel
        # 3. Filter based on room availability
        
        query = {"is_active": True}
        
        # Apply search filters
        if filters.country:
            query["location.country"] = {"$regex": filters.country, "$options": "i"}
        
        if filters.city:
            query["location.city"] = {"$regex": filters.city, "$options": "i"}
        
        if filters.amenities:
            query["amenities"] = {"$in": filters.amenities}
        
        if filters.room_types:
            query["room_types.room_type"] = {"$in": filters.room_types}

        result = await paginate_collection(
            self.hotels_collection,
            query,
            pagination,
            sort_field="star_rating",
            sort_direction=-1
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result