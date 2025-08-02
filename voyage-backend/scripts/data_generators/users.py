"""
User and Agent data generators
"""
import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId
from passlib.context import CryptContext

# Import models and enums
from models.user import User, UserType
from models.agent import TravelAgent, DMCAgent, Location, Specialization

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserGenerator:
    def __init__(self, db, faker):
        self.db = db
        self.fake = faker
        
        # Load sample data
        script_dir = Path(__file__).parent.parent
        with open(script_dir / "sample_data" / "company_names.json") as f:
            self.company_names = json.load(f)
        with open(script_dir / "sample_data" / "destinations.json") as f:
            self.destinations = json.load(f)
    
    def generate_password_hash(self, password: str = "Password123!") -> str:
        """Generate password hash for demo users"""
        return pwd_context.hash(password)
    
    async def generate_users_and_agents(self, num_agents: int = 25) -> Dict[str, List[Dict]]:
        """Generate users and their corresponding agent profiles"""
        
        # Split roughly 60% travel agents, 40% DMC agents
        num_travel = int(num_agents * 0.6)
        num_dmc = num_agents - num_travel
        
        users = []
        travel_agents = []
        dmc_agents = []
        
        # Generate Travel Agents
        travel_company_names = self.company_names["travel_agents"].copy()
        random.shuffle(travel_company_names)
        
        for i in range(num_travel):
            user_id = ObjectId()
            
            # Create user
            user = {
                "_id": user_id,
                "email": self.fake.email(),
                "password_hash": self.generate_password_hash(),
                "user_type": UserType.TRAVEL_AGENT.value,
                "is_active": True,
                "is_verified": random.choice([True, True, True, False]),  # 75% verified
                "first_name": self.fake.first_name(),
                "last_name": self.fake.last_name(),
                "phone": self.fake.phone_number()[:20],  # Limit length
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 365)),
                "updated_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
            }
            users.append(user)
            
            # Create travel agent profile
            destination = random.choice(self.destinations)
            agent = {
                "_id": ObjectId(),
                "user_id": user_id,
                "company_name": travel_company_names[i % len(travel_company_names)],
                "license_number": f"TA{random.randint(100000, 999999)}",
                "country": destination["country"],
                "city": destination["city"],
                "address": self.fake.address()[:200],  # Limit length
                "website": f"https://www.{self.fake.domain_name()}",
                "description": self.fake.text(max_nb_chars=500),
                "is_verified": user["is_verified"],
                "verification_documents": [f"license_{user_id}.pdf", f"registration_{user_id}.pdf"] if user["is_verified"] else [],
                "rating": round(random.uniform(3.5, 5.0), 1) if random.random() > 0.3 else None,
                "total_bookings": random.randint(0, 250),
                "created_at": user["created_at"],
                "updated_at": user["updated_at"]
            }
            travel_agents.append(agent)
        
        # Generate DMC Agents
        dmc_company_names = self.company_names["dmc_agents"].copy()
        random.shuffle(dmc_company_names)
        
        for i in range(num_dmc):
            user_id = ObjectId()
            
            # Create user
            user = {
                "_id": user_id,
                "email": self.fake.email(),
                "password_hash": self.generate_password_hash(),
                "user_type": UserType.DMC_AGENT.value,
                "is_active": True,
                "is_verified": random.choice([True, True, False]),  # 67% verified
                "first_name": self.fake.first_name(),
                "last_name": self.fake.last_name(),
                "phone": self.fake.phone_number()[:20],  # Limit length
                "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 365)),
                "updated_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
            }
            users.append(user)
            
            # Select 1-3 regions for this DMC
            selected_destinations = random.sample(self.destinations, random.randint(1, 3))
            regions = []
            for dest in selected_destinations:
                region = {
                    "country": dest["country"],
                    "city": dest["city"],
                    "region": dest.get("region"),
                    "latitude": float(round(self.fake.latitude(), 6)),
                    "longitude": float(round(self.fake.longitude(), 6))
                }
                regions.append(region)
            
            # Select specializations
            all_specializations = [spec.value for spec in Specialization]
            num_specializations = random.randint(2, 5)
            specializations = random.sample(all_specializations, num_specializations)
            
            # Languages (based on regions)
            languages = ["English"]  # Everyone speaks English
            for region in regions:
                if region["country"] == "France":
                    languages.append("French")
                elif region["country"] == "Spain":
                    languages.append("Spanish")
                elif region["country"] == "Germany":
                    languages.append("German")
                elif region["country"] == "Italy":
                    languages.append("Italian")
                elif region["country"] == "Japan":
                    languages.append("Japanese")
                elif region["country"] == "Turkey":
                    languages.append("Turkish")
                elif region["country"] == "Thailand":
                    languages.append("Thai")
                elif region["country"] == "Greece":
                    languages.append("Greek")
                elif region["country"] == "Egypt":
                    languages.append("Arabic")
                elif region["country"] == "India":
                    languages.append("Hindi")
            languages = list(set(languages))  # Remove duplicates
            
            # Create DMC agent profile
            agent = {
                "_id": ObjectId(),
                "user_id": user_id,
                "company_name": dmc_company_names[i % len(dmc_company_names)],
                "license_number": f"DMC{random.randint(100000, 999999)}",
                "regions": regions,
                "specializations": specializations,
                "languages": languages,
                "website": f"https://www.{self.fake.domain_name()}",
                "description": self.fake.text(max_nb_chars=800),
                "is_verified": user["is_verified"],
                "verification_documents": [f"license_{user_id}.pdf", f"registration_{user_id}.pdf"] if user["is_verified"] else [],
                "rating": round(random.uniform(3.8, 5.0), 1) if random.random() > 0.2 else None,
                "total_deals": random.randint(0, 500),
                "response_time_hours": random.choice([2, 4, 8, 12, 24]),
                "commission_rate": round(random.uniform(0.08, 0.25), 3),  # 8-25%
                "created_at": user["created_at"],
                "updated_at": user["updated_at"]
            }
            dmc_agents.append(agent)
        
        # Insert all data
        if users:
            await self.db.users.insert_many(users)
        if travel_agents:
            await self.db.travel_agents.insert_many(travel_agents)
        if dmc_agents:
            await self.db.dmc_agents.insert_many(dmc_agents)
        
        return {
            "users": users,
            "travel_agents": travel_agents,
            "dmc_agents": dmc_agents
        }