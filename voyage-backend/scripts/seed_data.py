#!/usr/bin/env python3
"""
Data seeding script for Voyage Backend
Generates realistic demo data for all entities in the system
"""
import asyncio
import argparse
import sys
import os
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from motor.motor_asyncio import AsyncIOMotorClient
from faker import Faker
from datetime import datetime, timedelta
from typing import List, Dict, Any

from data_generators.users import UserGenerator
from data_generators.hotels import HotelGenerator
from data_generators.offers import OfferGenerator
from data_generators.bookings import BookingGenerator
from core.config import settings

fake = Faker()

class DataSeeder:
    def __init__(self, mongodb_url: str = None, database_name: str = None):
        self.mongodb_url = mongodb_url or settings.MONGODB_URL
        self.database_name = database_name or settings.DATABASE_NAME
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        print(f"Connecting to MongoDB: {self.mongodb_url}")
        self.client = AsyncIOMotorClient(self.mongodb_url)
        self.db = self.client[self.database_name]
        
        # Test connection
        await self.client.admin.command('ping')
        print("✓ Successfully connected to MongoDB")
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")
    
    async def clear_data(self):
        """Clear all existing data"""
        print("Clearing existing data...")
        collections = ['users', 'travel_agents', 'dmc_agents', 'hotels', 'offers', 'bookings']
        
        for collection_name in collections:
            result = await self.db[collection_name].delete_many({})
            print(f"  - Cleared {result.deleted_count} documents from {collection_name}")
        
        print("✓ All data cleared")
    
    async def seed_data(self, num_agents: int = 25, num_hotels: int = 75, 
                       num_offers: int = 125, clear_existing: bool = True):
        """Generate and insert seed data"""
        if clear_existing:
            await self.clear_data()
        
        print(f"\nGenerating seed data:")
        print(f"  - {num_agents} agents (travel + DMC)")
        print(f"  - {num_hotels} hotels")
        print(f"  - {num_offers} offers")
        print(f"  - Bookings (auto-generated from accepted offers)")
        print()
        
        # Initialize generators
        user_gen = UserGenerator(self.db, fake)
        hotel_gen = HotelGenerator(self.db, fake)
        offer_gen = OfferGenerator(self.db, fake)
        booking_gen = BookingGenerator(self.db, fake)
        
        # Step 1: Generate users and agents
        print("1. Generating users and agents...")
        users_data = await user_gen.generate_users_and_agents(num_agents)
        print(f"   ✓ Created {len(users_data['users'])} users")
        print(f"   ✓ Created {len(users_data['travel_agents'])} travel agents")
        print(f"   ✓ Created {len(users_data['dmc_agents'])} DMC agents")
        
        # Step 2: Generate hotels
        print("\n2. Generating hotels...")
        hotels = await hotel_gen.generate_hotels(users_data['dmc_agents'], num_hotels)
        print(f"   ✓ Created {len(hotels)} hotels")
        
        # Step 3: Generate offers
        print("\n3. Generating offers...")
        offers = await offer_gen.generate_offers(
            users_data['travel_agents'], 
            users_data['dmc_agents'], 
            hotels, 
            num_offers
        )
        print(f"   ✓ Created {len(offers)} offers")
        
        # Step 4: Generate bookings
        print("\n4. Generating bookings...")
        bookings = await booking_gen.generate_bookings(offers)
        print(f"   ✓ Created {len(bookings)} bookings")
        
        # Summary
        print(f"\n🎉 Data seeding completed successfully!")
        print(f"Database: {self.database_name}")
        print(f"Total records created:")
        print(f"  - Users: {len(users_data['users'])}")
        print(f"  - Travel Agents: {len(users_data['travel_agents'])}")
        print(f"  - DMC Agents: {len(users_data['dmc_agents'])}")
        print(f"  - Hotels: {len(hotels)}")
        print(f"  - Offers: {len(offers)}")
        print(f"  - Bookings: {len(bookings)}")

async def main():
    parser = argparse.ArgumentParser(description='Seed Voyage database with demo data')
    parser.add_argument('--agents', type=int, default=25, 
                       help='Number of agents to create (default: 25)')
    parser.add_argument('--hotels', type=int, default=75,
                       help='Number of hotels to create (default: 75)')
    parser.add_argument('--offers', type=int, default=125,
                       help='Number of offers to create (default: 125)')
    parser.add_argument('--no-clear', action='store_true',
                       help='Do not clear existing data before seeding')
    parser.add_argument('--mongodb-url', type=str,
                       help='MongoDB connection URL (default: from settings)')
    parser.add_argument('--database', type=str,
                       help='Database name (default: from settings)')
    
    args = parser.parse_args()
    
    seeder = DataSeeder(args.mongodb_url, args.database)
    
    try:
        await seeder.connect()
        await seeder.seed_data(
            num_agents=args.agents,
            num_hotels=args.hotels,
            num_offers=args.offers,
            clear_existing=not args.no_clear
        )
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        return 1
    finally:
        await seeder.disconnect()
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)