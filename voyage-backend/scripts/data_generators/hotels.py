"""
Hotel data generator
"""
import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId

# Import models and enums
from models.hotel import Hotel, HotelLocation, RoomRate, HotelAmenity, RoomType

class HotelGenerator:
    def __init__(self, db, faker):
        self.db = db
        self.fake = faker
        
        # Load sample data
        script_dir = Path(__file__).parent.parent
        with open(script_dir / "sample_data" / "hotel_names.json") as f:
            self.hotel_names = json.load(f)
        with open(script_dir / "sample_data" / "destinations.json") as f:
            self.destinations = json.load(f)
    
    def generate_room_rates(self, star_rating: int, destination: Dict) -> List[Dict]:
        """Generate room rates based on hotel star rating and destination"""
        
        # Base rates by star rating (USD per night)
        base_rates = {
            2: {"min": 50, "max": 120},
            3: {"min": 80, "max": 200},
            4: {"min": 150, "max": 400},
            5: {"min": 300, "max": 1200}
        }
        
        # Premium destinations multiplier
        premium_destinations = ["Dubai", "Paris", "London", "Tokyo", "New York", "Singapore"]
        multiplier = 1.5 if destination["city"] in premium_destinations else 1.0
        
        rate_range = base_rates[star_rating]
        
        room_types = [
            {
                "room_type": RoomType.SINGLE.value,
                "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * 0.7 * multiplier, 2),
                "currency": "USD",
                "max_occupancy": 1,
                "description": "Comfortable single occupancy room with modern amenities"
            },
            {
                "room_type": RoomType.DOUBLE.value,
                "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * multiplier, 2),
                "currency": "USD",
                "max_occupancy": 2,
                "description": "Spacious double room with queen-size bed"
            },
            {
                "room_type": RoomType.TWIN.value,
                "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * 0.95 * multiplier, 2),
                "currency": "USD",
                "max_occupancy": 2,
                "description": "Twin bed room perfect for friends or colleagues"
            }
        ]
        
        # Add premium room types for 4-5 star hotels
        if star_rating >= 4:
            room_types.extend([
                {
                    "room_type": RoomType.SUITE.value,
                    "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * 1.8 * multiplier, 2),
                    "currency": "USD",
                    "max_occupancy": 4,
                    "description": "Luxurious suite with separate living area"
                },
                {
                    "room_type": RoomType.DELUXE.value,
                    "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * 1.4 * multiplier, 2),
                    "currency": "USD",
                    "max_occupancy": 3,
                    "description": "Deluxe room with premium amenities and city view"
                }
            ])
        
        # Add family room for all hotels
        room_types.append({
            "room_type": RoomType.FAMILY.value,
            "base_rate": round(random.uniform(rate_range["min"], rate_range["max"]) * 1.6 * multiplier, 2),
            "currency": "USD",
            "max_occupancy": 6,
            "description": "Family room with multiple beds, perfect for groups"
        })
        
        # Randomly include 3-5 room types
        return random.sample(room_types, random.randint(3, min(5, len(room_types))))
    
    def generate_amenities(self, star_rating: int) -> List[str]:
        """Generate amenities based on star rating"""
        
        # Basic amenities for all hotels
        basic_amenities = [HotelAmenity.WIFI.value]
        
        # Additional amenities by star rating
        amenity_pools = {
            2: [HotelAmenity.PARKING.value, HotelAmenity.RESTAURANT.value],
            3: [HotelAmenity.PARKING.value, HotelAmenity.RESTAURANT.value, HotelAmenity.ROOM_SERVICE.value],
            4: [HotelAmenity.POOL.value, HotelAmenity.GYM.value, HotelAmenity.RESTAURANT.value, 
                HotelAmenity.ROOM_SERVICE.value, HotelAmenity.PARKING.value, HotelAmenity.BAR.value],
            5: [HotelAmenity.POOL.value, HotelAmenity.SPA.value, HotelAmenity.GYM.value,
                HotelAmenity.RESTAURANT.value, HotelAmenity.ROOM_SERVICE.value, HotelAmenity.BAR.value,
                HotelAmenity.PARKING.value, HotelAmenity.BUSINESS_CENTER.value]
        }
        
        available_amenities = basic_amenities + amenity_pools.get(star_rating, [])
        
        # Randomly select 60-90% of available amenities
        num_amenities = random.randint(
            int(len(available_amenities) * 0.6),
            int(len(available_amenities) * 0.9)
        )
        
        return random.sample(available_amenities, num_amenities)
    
    def generate_hotel_images(self, num_images: int = 8) -> List[str]:
        """Generate hotel image URLs"""
        image_types = ["exterior", "lobby", "room", "restaurant", "pool", "spa", "gym", "view"]
        images = []
        
        for i in range(num_images):
            image_type = random.choice(image_types)
            images.append(f"https://images.voyage.com/hotels/{ObjectId()}/{image_type}_{i+1}.jpg")
        
        return images
    
    def generate_policies_and_contact(self) -> tuple:
        """Generate hotel policies and contact information"""
        
        policies = {
            "check_in": "ID required at check-in",
            "cancellation": "Free cancellation up to 24 hours before arrival",
            "pets": random.choice(["Pets allowed with additional fee", "No pets allowed", "Service animals only"]),
            "smoking": "Non-smoking property",
            "children": "Children welcome, extra beds available for additional charge"
        }
        
        contact_info = {
            "phone": self.fake.phone_number()[:20],
            "email": f"reservations@{self.fake.domain_name()}",
            "fax": self.fake.phone_number()[:20] if random.random() > 0.7 else None
        }
        
        return policies, contact_info
    
    async def generate_hotels(self, dmc_agents: List[Dict], num_hotels: int = 75) -> List[Dict]:
        """Generate hotels for DMC agents"""
        
        hotels = []
        hotel_names = self.hotel_names.copy()
        random.shuffle(hotel_names)
        
        # Distribute hotels among DMC agents (each gets 3-10 hotels)
        hotels_per_dmc = []
        remaining_hotels = num_hotels
        
        for i, dmc in enumerate(dmc_agents):
            if i == len(dmc_agents) - 1:  # Last DMC gets remaining hotels
                hotels_per_dmc.append(remaining_hotels)
            else:
                count = random.randint(3, min(10, remaining_hotels - (len(dmc_agents) - i - 1) * 3))
                hotels_per_dmc.append(count)
                remaining_hotels -= count
        
        hotel_name_index = 0
        
        for dmc_index, dmc in enumerate(dmc_agents):
            num_dmc_hotels = hotels_per_dmc[dmc_index]
            
            for hotel_index in range(num_dmc_hotels):
                # Select destination from DMC's regions
                destination_data = random.choice(dmc["regions"])
                
                # Find full destination info
                destination = next(
                    (d for d in self.destinations if d["country"] == destination_data["country"] and d["city"] == destination_data["city"]),
                    destination_data
                )
                
                # Generate hotel name
                hotel_name = hotel_names[hotel_name_index % len(hotel_names)]
                if hotel_name_index >= len(hotel_names):
                    # Generate more creative names if we run out
                    hotel_name = f"{self.fake.word().title()} {random.choice(['Hotel', 'Resort', 'Suites', 'Inn'])}"
                hotel_name_index += 1
                
                # Generate star rating (weighted towards higher ratings)
                star_rating = random.choices([2, 3, 4, 5], weights=[10, 25, 40, 25])[0]
                
                # Generate location
                popular_area = random.choice(destination.get("popular_areas", [destination["city"]]))
                location = {
                    "country": destination["country"],
                    "city": destination["city"],
                    "address": f"{random.randint(1, 999)} {popular_area} Street",
                    "postal_code": self.fake.postcode(),
                    "latitude": float(destination_data.get("latitude", round(self.fake.latitude(), 6))),
                    "longitude": float(destination_data.get("longitude", round(self.fake.longitude(), 6))),
                    "district": popular_area
                }
                
                # Generate room types and rates
                room_types = self.generate_room_rates(star_rating, destination)
                
                # Generate amenities
                amenities = self.generate_amenities(star_rating)
                
                # Generate policies and contact info
                policies, contact_info = self.generate_policies_and_contact()
                
                # Create hotel document
                hotel = {
                    "_id": ObjectId(),
                    "dmc_agent_id": dmc["_id"],
                    "name": hotel_name,
                    "location": location,
                    "star_rating": star_rating,
                    "amenities": amenities,
                    "room_types": room_types,
                    "images": self.generate_hotel_images(),
                    "description": self.fake.text(max_nb_chars=800),
                    "policies": policies,
                    "contact_info": contact_info,
                    "is_active": random.choice([True, True, True, True, False]),  # 80% active
                    "minimum_stay": random.choice([1, 1, 1, 2, 3]),  # Mostly 1 night minimum
                    "maximum_stay": random.choice([None, None, 14, 30]) if random.random() > 0.7 else None,
                    "check_in_time": random.choice(["14:00", "15:00", "16:00"]),
                    "check_out_time": random.choice(["10:00", "11:00", "12:00"]),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 730)),
                    "updated_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
                }
                
                hotels.append(hotel)
        
        # Insert hotels into database
        if hotels:
            await self.db.hotels.insert_many(hotels)
        
        return hotels