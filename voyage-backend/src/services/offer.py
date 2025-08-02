from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from bson import ObjectId

from ..models.offer import Offer
from ..schemas.offer import OfferCreate, OfferQuote, OfferSearchFilters
from ..schemas.base import PaginationParams
from ..utils.helpers import prepare_document_for_response, calculate_nights, calculate_commission
from ..utils.pagination import paginate_collection
from ..core.constants import UserType, OfferStatus


class OfferService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.offers_collection = db.offers
        self.hotels_collection = db.hotels
        self.travel_agents_collection = db.travel_agents
        self.dmc_agents_collection = db.dmc_agents

    async def create_offer_request(self, travel_agent_id: str, offer_data: OfferCreate) -> dict:
        """Create a new offer request (by travel agent)"""
        # Verify hotel exists and is active
        hotel = await self.hotels_collection.find_one({
            "_id": ObjectId(offer_data.hotel_id),
            "is_active": True
        })
        
        if not hotel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hotel not found or inactive"
            )

        # Get DMC agent ID from hotel
        dmc_agent_id = hotel["dmc_agent_id"]

        # Create offer document
        offer_dict = offer_data.dict()
        offer_dict["travel_agent_id"] = ObjectId(travel_agent_id)
        offer_dict["dmc_agent_id"] = ObjectId(dmc_agent_id)
        offer_dict["hotel_id"] = ObjectId(offer_data.hotel_id)
        offer_dict["nights"] = calculate_nights(offer_data.check_in_date, offer_data.check_out_date)
        
        offer = Offer(**offer_dict)
        offer_doc = offer.dict(by_alias=True)
        
        # Insert offer
        result = await self.offers_collection.insert_one(offer_doc)
        
        # Get created offer
        created_offer = await self.offers_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_offer)

    async def get_offer(self, offer_id: str) -> Optional[dict]:
        """Get offer by ID"""
        offer = await self.offers_collection.find_one({"_id": ObjectId(offer_id)})
        if not offer:
            return None
        return prepare_document_for_response(offer)

    async def quote_offer(self, offer_id: str, dmc_agent_id: str, quote_data: OfferQuote) -> dict:
        """Provide quote for offer (by DMC agent)"""
        # Verify offer exists and belongs to DMC agent
        offer = await self.offers_collection.find_one({
            "_id": ObjectId(offer_id),
            "dmc_agent_id": ObjectId(dmc_agent_id),
            "status": OfferStatus.PENDING
        })
        
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found or already processed"
            )

        # Calculate commission if rate provided
        commission_amount = None
        if quote_data.commission_rate:
            commission_amount = calculate_commission(quote_data.total_price, quote_data.commission_rate)

        # Set expiration time
        expires_at = datetime.utcnow() + timedelta(hours=quote_data.expires_in_hours)

        # Update offer with quote
        update_data = {
            "quoted_rooms": [room.dict() for room in quote_data.quoted_rooms],
            "total_price": quote_data.total_price,
            "currency": quote_data.currency,
            "commission_rate": quote_data.commission_rate,
            "commission_amount": commission_amount,
            "cancellation_policy": quote_data.cancellation_policy,
            "payment_terms": quote_data.payment_terms,
            "notes": quote_data.notes,
            "status": OfferStatus.QUOTED,
            "expires_at": expires_at,
            "quoted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await self.offers_collection.update_one(
            {"_id": ObjectId(offer_id)},
            {"$set": update_data}
        )
        
        # Get updated offer
        updated_offer = await self.offers_collection.find_one({"_id": ObjectId(offer_id)})
        return prepare_document_for_response(updated_offer)

    async def accept_offer(self, offer_id: str, travel_agent_id: str) -> dict:
        """Accept offer (by travel agent)"""
        # Verify offer exists and belongs to travel agent
        offer = await self.offers_collection.find_one({
            "_id": ObjectId(offer_id),
            "travel_agent_id": ObjectId(travel_agent_id),
            "status": OfferStatus.QUOTED
        })
        
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found or not available for acceptance"
            )

        # Check if offer has expired
        if offer.get("expires_at") and datetime.utcnow() > offer["expires_at"]:
            # Mark as expired
            await self.offers_collection.update_one(
                {"_id": ObjectId(offer_id)},
                {"$set": {"status": OfferStatus.EXPIRED, "updated_at": datetime.utcnow()}}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer has expired"
            )

        # Update offer status
        await self.offers_collection.update_one(
            {"_id": ObjectId(offer_id)},
            {"$set": {
                "status": OfferStatus.ACCEPTED,
                "responded_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Get updated offer
        updated_offer = await self.offers_collection.find_one({"_id": ObjectId(offer_id)})
        return prepare_document_for_response(updated_offer)

    async def reject_offer(self, offer_id: str, travel_agent_id: str) -> dict:
        """Reject offer (by travel agent)"""
        # Verify offer exists and belongs to travel agent
        offer = await self.offers_collection.find_one({
            "_id": ObjectId(offer_id),
            "travel_agent_id": ObjectId(travel_agent_id),
            "status": OfferStatus.QUOTED
        })
        
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found or not available for rejection"
            )

        # Update offer status
        await self.offers_collection.update_one(
            {"_id": ObjectId(offer_id)},
            {"$set": {
                "status": OfferStatus.REJECTED,
                "responded_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Get updated offer
        updated_offer = await self.offers_collection.find_one({"_id": ObjectId(offer_id)})
        return prepare_document_for_response(updated_offer)

    async def search_offers(
        self, 
        user_id: str, 
        user_type: str, 
        filters: OfferSearchFilters, 
        pagination: PaginationParams
    ) -> dict:
        """Search offers based on user type and filters"""
        query = {}
        
        # Filter by user type
        if user_type == UserType.TRAVEL_AGENT:
            # Get travel agent ID
            travel_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if travel_agent:
                query["travel_agent_id"] = travel_agent["_id"]
            else:
                # Return empty results if no agent profile
                return {
                    "items": [],
                    "total": 0,
                    "page": pagination.page,
                    "size": pagination.size,
                    "pages": 0
                }
        
        elif user_type == UserType.DMC_AGENT:
            # Get DMC agent ID
            dmc_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if dmc_agent:
                query["dmc_agent_id"] = dmc_agent["_id"]
            else:
                # Return empty results if no agent profile
                return {
                    "items": [],
                    "total": 0,
                    "page": pagination.page,
                    "size": pagination.size,
                    "pages": 0
                }

        # Apply additional filters
        if filters.status:
            query["status"] = filters.status
        
        if filters.hotel_id:
            query["hotel_id"] = ObjectId(filters.hotel_id)
        
        if filters.dmc_agent_id and user_type == UserType.TRAVEL_AGENT:
            query["dmc_agent_id"] = ObjectId(filters.dmc_agent_id)
        
        if filters.travel_agent_id and user_type == UserType.DMC_AGENT:
            query["travel_agent_id"] = ObjectId(filters.travel_agent_id)
        
        if filters.check_in_from or filters.check_in_to:
            check_in_query = {}
            if filters.check_in_from:
                check_in_query["$gte"] = filters.check_in_from
            if filters.check_in_to:
                check_in_query["$lte"] = filters.check_in_to
            query["check_in_date"] = check_in_query
        
        if filters.created_from or filters.created_to:
            created_query = {}
            if filters.created_from:
                created_query["$gte"] = filters.created_from
            if filters.created_to:
                created_query["$lte"] = filters.created_to
            query["created_at"] = created_query
        
        if filters.min_price or filters.max_price:
            price_query = {}
            if filters.min_price:
                price_query["$gte"] = filters.min_price
            if filters.max_price:
                price_query["$lte"] = filters.max_price
            query["total_price"] = price_query

        # Paginate results
        result = await paginate_collection(
            self.offers_collection,
            query,
            pagination,
            sort_field="created_at",
            sort_direction=-1
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def get_offer_statistics(self, user_id: str, user_type: str) -> dict:
        """Get offer statistics for user"""
        query = {}
        
        if user_type == UserType.TRAVEL_AGENT:
            travel_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not travel_agent:
                return {"total": 0, "pending": 0, "quoted": 0, "accepted": 0, "rejected": 0, "expired": 0}
            query["travel_agent_id"] = travel_agent["_id"]
        
        elif user_type == UserType.DMC_AGENT:
            dmc_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not dmc_agent:
                return {"total": 0, "pending": 0, "quoted": 0, "accepted": 0, "rejected": 0, "expired": 0}
            query["dmc_agent_id"] = dmc_agent["_id"]

        # Aggregate statistics
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        results = await self.offers_collection.aggregate(pipeline).to_list(length=None)
        
        stats = {"total": 0, "pending": 0, "quoted": 0, "accepted": 0, "rejected": 0, "expired": 0}
        
        for result in results:
            status = result["_id"]
            count = result["count"]
            stats["total"] += count
            stats[status] = count
        
        return stats

    async def expire_old_offers(self):
        """Mark expired offers (background task)"""
        now = datetime.utcnow()
        
        await self.offers_collection.update_many(
            {
                "status": OfferStatus.QUOTED,
                "expires_at": {"$lte": now}
            },
            {"$set": {"status": OfferStatus.EXPIRED, "updated_at": now}}
        )