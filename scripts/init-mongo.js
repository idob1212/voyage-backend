db = db.getSiblingDB('voyage_db');

db.createCollection('users');
db.createCollection('travel_agents');
db.createCollection('dmc_agents');
db.createCollection('hotels');
db.createCollection('offers');
db.createCollection('bookings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.travel_agents.createIndex({ "user_id": 1 }, { unique: true });
db.dmc_agents.createIndex({ "user_id": 1 }, { unique: true });
db.dmc_agents.createIndex({ "regions": 1 });
db.dmc_agents.createIndex({ "specializations": 1 });
db.hotels.createIndex({ "dmc_agent_id": 1 });
db.hotels.createIndex({ "location.country": 1, "location.city": 1 });
db.offers.createIndex({ "travel_agent_id": 1 });
db.offers.createIndex({ "dmc_agent_id": 1 });
db.offers.createIndex({ "status": 1 });
db.offers.createIndex({ "created_at": 1 });
db.bookings.createIndex({ "offer_id": 1 });
db.bookings.createIndex({ "confirmation_number": 1 }, { unique: true });

print('Database initialized successfully');