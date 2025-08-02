"""
Offer data generator
"""
import random
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from bson import ObjectId

# Import models and enums
from models.offer import RoomRequest, QuotedRoom, OfferStatus, RoomType

class OfferGenerator:
    def __init__(self, db, faker):
        self.db = db
        self.fake = faker
        
        # Common guest nationalities for travel requests
        self.nationalities = [
            "American", "British", "German", "French", "Italian", "Spanish", "Canadian", 
            "Australian", "Japanese", "Chinese", "Indian", "Brazilian", "Russian", 
            "Dutch", "Swedish", "Norwegian", "Danish", "Belgian", "Swiss", "Austrian"
        ]
    
    def generate_room_requests(self) -> List[Dict]:
        """Generate realistic room requests"""
        
        # Weighted room type preferences
        room_type_weights = {
            RoomType.DOUBLE.value: 40,
            RoomType.SINGLE.value: 20,
            RoomType.TWIN.value: 15,
            RoomType.SUITE.value: 10,
            RoomType.DELUXE.value: 8,
            RoomType.FAMILY.value: 5,
            RoomType.PRESIDENTIAL.value: 2
        }
        
        # Number of rooms (weighted towards 1-2 rooms)
        num_rooms = random.choices([1, 2, 3, 4, 5], weights=[60, 25, 10, 3, 2])[0]
        
        requests = []
        for _ in range(num_rooms):
            room_type = random.choices(
                list(room_type_weights.keys()),
                weights=list(room_type_weights.values())
            )[0]
            
            # Adults and children based on room type
            if room_type == RoomType.SINGLE.value:
                adults = 1
                children = 0
            elif room_type == RoomType.FAMILY.value:
                adults = random.randint(2, 3)
                children = random.randint(1, 3)
            elif room_type in [RoomType.SUITE.value, RoomType.PRESIDENTIAL.value]:
                adults = random.randint(2, 4)
                children = random.randint(0, 2)
            else:
                adults = random.randint(1, 2)
                children = random.randint(0, 1) if random.random() > 0.7 else 0
            
            request = {
                "room_type": room_type,
                "quantity": 1,
                "adults": adults,
                "children": children,
                "special_requests": self.fake.text(max_nb_chars=200) if random.random() > 0.7 else None
            }
            requests.append(request)
        
        return requests
    
    def generate_date_range(self) -> tuple:
        """Generate realistic check-in and check-out dates"""
        
        # Mix of past, current, and future bookings
        date_type = random.choices(
            ["past", "current", "future"], 
            weights=[20, 10, 70]  # Mostly future bookings
        )[0]
        
        if date_type == "past":
            # Past bookings (up to 1 year ago)
            check_in = datetime.now().date() - timedelta(days=random.randint(1, 365))
        elif date_type == "current":
            # Current bookings (next 7 days)
            check_in = datetime.now().date() + timedelta(days=random.randint(0, 7))
        else:
            # Future bookings (8 days to 1 year ahead)
            check_in = datetime.now().date() + timedelta(days=random.randint(8, 365))
        
        # Stay duration (weighted towards shorter stays)
        nights = random.choices(
            [1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30],
            weights=[5, 15, 20, 18, 15, 10, 8, 4, 3, 1, 1]
        )[0]
        
        check_out = check_in + timedelta(days=nights)
        
        return check_in, check_out, nights
    
    def generate_quoted_rooms(self, room_requests: List[Dict], hotel: Dict, nights: int) -> List[Dict]:
        """Generate quoted rooms with pricing"""
        
        quoted_rooms = []
        
        for request in room_requests:
            # Find matching room type in hotel
            hotel_room_types = {rt["room_type"]: rt for rt in hotel["room_types"]}
            
            if request["room_type"] not in hotel_room_types:
                # Skip if hotel doesn't have this room type
                continue
            
            hotel_room = hotel_room_types[request["room_type"]]
            
            # Base rate with some variation (+/- 20%)
            base_rate = hotel_room["base_rate"]
            rate_variation = random.uniform(0.8, 1.2)
            rate_per_night = round(base_rate * rate_variation, 2)
            
            # Seasonal pricing adjustments
            today = datetime.now().date()
            if 6 <= today.month <= 8:  # Summer season
                rate_per_night *= 1.2
            elif today.month in [12, 1]:  # Winter holidays
                rate_per_night *= 1.4
            elif today.month in [3, 4]:  # Spring
                rate_per_night *= 1.1
            
            total_rate = round(rate_per_night * nights * request["quantity"], 2)
            
            # Generate included services
            includes = ["Daily housekeeping", "WiFi access"]
            if random.random() > 0.5:
                includes.append("Continental breakfast")
            if hotel["star_rating"] >= 4 and random.random() > 0.6:
                includes.extend(["Welcome drink", "Late checkout (subject to availability)"])
            
            quoted_room = {
                "room_type": request["room_type"],
                "quantity": request["quantity"],
                "rate_per_night": rate_per_night,
                "total_rate": total_rate,
                "currency": "USD",
                "includes": includes,
                "conditions": "Rates subject to availability and may change without notice" if random.random() > 0.8 else None
            }
            
            quoted_rooms.append(quoted_room)
        
        return quoted_rooms
    
    def calculate_offer_totals(self, quoted_rooms: List[Dict], dmc_agent: Dict) -> tuple:
        """Calculate total price and commission"""
        
        total_price = sum(room["total_rate"] for room in quoted_rooms)
        commission_rate = dmc_agent.get("commission_rate", 0.15)  # Default 15%
        commission_amount = round(total_price * commission_rate, 2)
        
        return total_price, commission_rate, commission_amount
    
    async def generate_offers(self, travel_agents: List[Dict], dmc_agents: List[Dict], 
                            hotels: List[Dict], num_offers: int = 125) -> List[Dict]:
        """Generate offers with various statuses"""
        
        offers = []
        
        # Create hotel lookup by DMC agent
        hotels_by_dmc = {}
        for hotel in hotels:
            dmc_id = hotel["dmc_agent_id"]
            if dmc_id not in hotels_by_dmc:
                hotels_by_dmc[dmc_id] = []
            hotels_by_dmc[dmc_id].append(hotel)
        
        for _ in range(num_offers):
            # Select random travel agent
            travel_agent = random.choice(travel_agents)
            
            # Select random DMC agent and one of their hotels
            dmc_agent = random.choice(dmc_agents)
            dmc_hotels = hotels_by_dmc.get(dmc_agent["_id"], [])
            
            if not dmc_hotels:
                continue  # Skip if DMC has no hotels
            
            hotel = random.choice(dmc_hotels)
            
            # Generate dates
            check_in, check_out, nights = self.generate_date_range()
            
            # Generate room requests
            room_requests = self.generate_room_requests()
            
            # Determine offer status based on creation date
            created_at = datetime.utcnow() - timedelta(days=random.randint(0, 90))
            
            # Status probabilities based on age
            days_old = (datetime.utcnow() - created_at).days
            
            if days_old < 1:
                # New offers are mostly pending
                status_weights = {"pending": 70, "quoted": 20, "accepted": 5, "rejected": 5}
            elif days_old < 7:
                # Week-old offers have more responses
                status_weights = {"pending": 20, "quoted": 40, "accepted": 25, "rejected": 10, "expired": 5}
            else:
                # Older offers are mostly resolved
                status_weights = {"pending": 5, "quoted": 10, "accepted": 35, "rejected": 25, "expired": 25}
            
            status = random.choices(
                list(status_weights.keys()),
                weights=list(status_weights.values())
            )[0]
            
            # Generate basic offer data
            offer = {
                "_id": ObjectId(),
                "travel_agent_id": travel_agent["_id"],
                "dmc_agent_id": dmc_agent["_id"] if status != "pending" else None,
                "hotel_id": hotel["_id"],
                "check_in_date": datetime.combine(check_in, datetime.min.time()),
                "check_out_date": datetime.combine(check_out, datetime.min.time()),
                "nights": nights,
                "rooms": room_requests,
                "guest_nationality": random.choice(self.nationalities),
                "special_requirements": self.fake.text(max_nb_chars=300) if random.random() > 0.7 else None,
                "status": status,
                "created_at": created_at,
                "updated_at": created_at
            }
            
            # Add quote data for non-pending offers
            if status != "pending":
                quoted_rooms = self.generate_quoted_rooms(room_requests, hotel, nights)
                total_price, commission_rate, commission_amount = self.calculate_offer_totals(quoted_rooms, dmc_agent)
                
                offer.update({
                    "quoted_rooms": quoted_rooms,
                    "total_price": total_price,
                    "currency": "USD",
                    "commission_rate": commission_rate,
                    "commission_amount": commission_amount,
                    "quoted_at": created_at + timedelta(hours=random.randint(1, 48)),
                    "cancellation_policy": "Free cancellation up to 48 hours before check-in. 50% charge for cancellations within 48 hours.",
                    "payment_terms": "Full payment required within 24 hours of booking confirmation.",
                    "notes": self.fake.text(max_nb_chars=200) if random.random() > 0.8 else None
                })
                
                # Set expiry date for quotes (typically 7-14 days from quote date)
                if status in ["quoted", "expired"]:
                    offer["expires_at"] = offer["quoted_at"] + timedelta(days=random.randint(7, 14))
                
                # Set response date for accepted/rejected offers
                if status in ["accepted", "rejected"]:
                    offer["responded_at"] = offer["quoted_at"] + timedelta(hours=random.randint(1, 168))  # 1 hour to 1 week
                    offer["updated_at"] = offer["responded_at"]
            
            offers.append(offer)
        
        # Insert offers into database
        if offers:
            await self.db.offers.insert_many(offers)
        
        return offers