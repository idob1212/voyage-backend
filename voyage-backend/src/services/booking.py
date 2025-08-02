from datetime import datetime
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from bson import ObjectId

from models.booking import Booking
from schemas.booking import BookingCreate, BookingUpdate, BookingCancellation, BookingSearchFilters
from schemas.base import PaginationParams
from utils.helpers import prepare_document_for_response, generate_confirmation_number
from utils.pagination import paginate_collection
from core.constants import UserType, OfferStatus, BookingStatus, PaymentStatus


class BookingService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.bookings_collection = db.bookings
        self.offers_collection = db.offers
        self.travel_agents_collection = db.travel_agents
        self.dmc_agents_collection = db.dmc_agents

    async def create_booking(self, travel_agent_id: str, booking_data: BookingCreate) -> dict:
        """Create a new booking from accepted offer"""
        # Verify offer exists and is accepted
        offer = await self.offers_collection.find_one({
            "_id": ObjectId(booking_data.offer_id),
            "travel_agent_id": ObjectId(travel_agent_id),
            "status": OfferStatus.ACCEPTED
        })
        
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Accepted offer not found"
            )

        # Check if booking already exists for this offer
        existing_booking = await self.bookings_collection.find_one({"offer_id": ObjectId(booking_data.offer_id)})
        if existing_booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking already exists for this offer"
            )

        # Generate unique confirmation number
        confirmation_number = generate_confirmation_number()
        
        # Ensure uniqueness
        tries = 0
        while tries < 5:
            existing = await self.bookings_collection.find_one({"confirmation_number": confirmation_number})
            if not existing:
                break
            confirmation_number = generate_confirmation_number()
            tries += 1
        
        if tries >= 5:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate unique confirmation number"
            )

        # Create booking document
        booking_dict = booking_data.dict()
        booking_dict.update({
            "offer_id": ObjectId(booking_data.offer_id),
            "travel_agent_id": ObjectId(travel_agent_id),
            "dmc_agent_id": offer["dmc_agent_id"],
            "hotel_id": offer["hotel_id"],
            "confirmation_number": confirmation_number
        })
        
        booking = Booking(**booking_dict)
        booking_doc = booking.dict(by_alias=True)
        
        # Insert booking
        result = await self.bookings_collection.insert_one(booking_doc)
        
        # Get created booking
        created_booking = await self.bookings_collection.find_one({"_id": result.inserted_id})
        return prepare_document_for_response(created_booking)

    async def get_booking(self, booking_id: str) -> Optional[dict]:
        """Get booking by ID"""
        booking = await self.bookings_collection.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return None
        return prepare_document_for_response(booking)

    async def get_booking_by_confirmation(self, confirmation_number: str) -> Optional[dict]:
        """Get booking by confirmation number"""
        booking = await self.bookings_collection.find_one({"confirmation_number": confirmation_number})
        if not booking:
            return None
        return prepare_document_for_response(booking)

    async def update_booking(self, booking_id: str, travel_agent_id: str, update_data: BookingUpdate) -> dict:
        """Update booking (only by travel agent)"""
        # Verify booking exists and belongs to travel agent
        booking = await self.bookings_collection.find_one({
            "_id": ObjectId(booking_id),
            "travel_agent_id": ObjectId(travel_agent_id),
            "status": {"$in": [BookingStatus.CONFIRMED]}
        })
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or cannot be updated"
            )

        # Update booking
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        await self.bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_dict}
        )
        
        # Get updated booking
        updated_booking = await self.bookings_collection.find_one({"_id": ObjectId(booking_id)})
        return prepare_document_for_response(updated_booking)

    async def cancel_booking(
        self, 
        booking_id: str, 
        user_id: str, 
        user_type: str, 
        cancellation_data: BookingCancellation
    ) -> dict:
        """Cancel booking"""
        # Build query based on user type
        query = {"_id": ObjectId(booking_id)}
        
        if user_type == UserType.TRAVEL_AGENT:
            travel_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not travel_agent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Travel agent profile not found"
                )
            query["travel_agent_id"] = travel_agent["_id"]
        
        elif user_type == UserType.DMC_AGENT:
            dmc_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not dmc_agent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="DMC agent profile not found"
                )
            query["dmc_agent_id"] = dmc_agent["_id"]
        
        # Verify booking exists and can be cancelled
        booking = await self.bookings_collection.find_one({
            **query,
            "status": {"$in": [BookingStatus.CONFIRMED]}
        })
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or cannot be cancelled"
            )

        # Calculate cancellation fee (simplified logic)
        cancellation_fee = 0.0
        if booking.get("payment_info", {}).get("amount"):
            # Simple cancellation policy: 10% fee
            cancellation_fee = booking["payment_info"]["amount"] * 0.1

        # Update booking with cancellation info
        update_data = {
            "status": BookingStatus.CANCELLED,
            "cancelled_at": datetime.utcnow(),
            "cancellation_reason": cancellation_data.cancellation_reason,
            "cancellation_fee": cancellation_fee,
            "updated_at": datetime.utcnow()
        }

        await self.bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        # Get updated booking
        updated_booking = await self.bookings_collection.find_one({"_id": ObjectId(booking_id)})
        return prepare_document_for_response(updated_booking)

    async def search_bookings(
        self, 
        user_id: str, 
        user_type: str, 
        filters: BookingSearchFilters, 
        pagination: PaginationParams
    ) -> dict:
        """Search bookings based on user type and filters"""
        query = {}
        
        # Filter by user type
        if user_type == UserType.TRAVEL_AGENT:
            travel_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if travel_agent:
                query["travel_agent_id"] = travel_agent["_id"]
            else:
                return {
                    "items": [],
                    "total": 0,
                    "page": pagination.page,
                    "size": pagination.size,
                    "pages": 0
                }
        
        elif user_type == UserType.DMC_AGENT:
            dmc_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if dmc_agent:
                query["dmc_agent_id"] = dmc_agent["_id"]
            else:
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
        
        if filters.payment_status:
            query["payment_status"] = filters.payment_status
        
        if filters.hotel_id:
            query["hotel_id"] = ObjectId(filters.hotel_id)
        
        if filters.confirmation_number:
            query["confirmation_number"] = {"$regex": filters.confirmation_number, "$options": "i"}
        
        if filters.booking_from or filters.booking_to:
            booking_query = {}
            if filters.booking_from:
                booking_query["$gte"] = filters.booking_from
            if filters.booking_to:
                booking_query["$lte"] = filters.booking_to
            query["booking_date"] = booking_query

        # Paginate results
        result = await paginate_collection(
            self.bookings_collection,
            query,
            pagination,
            sort_field="booking_date",
            sort_direction=-1
        )

        # Convert documents for response
        result["items"] = [prepare_document_for_response(item) for item in result["items"]]
        
        return result

    async def get_booking_statistics(self, user_id: str, user_type: str) -> dict:
        """Get booking statistics for user"""
        query = {}
        
        if user_type == UserType.TRAVEL_AGENT:
            travel_agent = await self.travel_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not travel_agent:
                return {"total": 0, "confirmed": 0, "cancelled": 0, "completed": 0}
            query["travel_agent_id"] = travel_agent["_id"]
        
        elif user_type == UserType.DMC_AGENT:
            dmc_agent = await self.dmc_agents_collection.find_one({"user_id": ObjectId(user_id)})
            if not dmc_agent:
                return {"total": 0, "confirmed": 0, "cancelled": 0, "completed": 0}
            query["dmc_agent_id"] = dmc_agent["_id"]

        # Aggregate statistics
        pipeline = [
            {"$match": query},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]
        
        results = await self.bookings_collection.aggregate(pipeline).to_list(length=None)
        
        stats = {"total": 0, "confirmed": 0, "cancelled": 0, "completed": 0}
        
        for result in results:
            status = result["_id"]
            count = result["count"]
            stats["total"] += count
            stats[status] = count
        
        return stats

    async def update_payment_status(
        self, 
        booking_id: str, 
        payment_status: PaymentStatus, 
        payment_info: Optional[dict] = None
    ) -> dict:
        """Update payment status (internal use)"""
        update_data = {
            "payment_status": payment_status,
            "updated_at": datetime.utcnow()
        }
        
        if payment_info:
            update_data["payment_info"] = payment_info

        await self.bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": update_data}
        )
        
        # Get updated booking
        updated_booking = await self.bookings_collection.find_one({"_id": ObjectId(booking_id)})
        return prepare_document_for_response(updated_booking)