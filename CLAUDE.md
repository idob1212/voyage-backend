# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application
```bash
# Start all services (recommended for development)
docker-compose up -d

# Start only database services, run API locally
docker-compose up -d mongodb redis
python -m uvicorn src.main:app --reload

# View API logs when running in Docker
docker-compose logs -f api

# Stop all services
docker-compose down
```

### Testing
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_auth.py

# Run specific test function
pytest tests/test_auth.py::test_user_registration
```

### Database Management
```bash
# Access MongoDB shell
docker exec -it voyage_mongodb mongosh -u voyage_user -p voyage_pass --authenticationDatabase admin voyage_db

# View MongoDB logs
docker-compose logs mongodb

# Reset database (remove all containers and volumes)
docker-compose down -v
```

## Architecture Overview

### Core Business Model
The system connects two types of users:
- **Travel Agents**: Request hotel quotes from DMC agents
- **DMC Agents**: Manage hotel inventory and provide quotes to travel agents

### Business Flow
1. **Registration**: Users register as either Travel or DMC agents
2. **Profile Creation**: Complete agent profiles with verification, regions, specializations
3. **Hotel Management**: DMC agents add hotels to their inventory
4. **Quote Request**: Travel agents request quotes for specific hotels/dates
5. **Quote Response**: DMC agents provide detailed quotes with pricing
6. **Booking**: Travel agents accept quotes and create bookings

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) using `UserType` enum
- Users must have agent profiles to perform business operations
- DMC agents can only manage their own hotels and respond to offers for their hotels
- Travel agents can only create offers and bookings

### Data Layer Architecture
- **Models** (`src/models/`): Pydantic models for MongoDB documents
- **Schemas** (`src/schemas/`): Request/response validation and serialization
- **Services** (`src/services/`): Business logic layer with database operations
- **Utils** (`src/utils/`): Shared utilities for validation, pagination, helpers

### API Layer Architecture
- **FastAPI** with async/await throughout
- **Dependency Injection** for database sessions and authentication
- **Structured Responses** using `ResponseModel[T]` wrapper
- **Pagination** handled via `PaginationParams` dependency
- **Error Handling** with custom HTTP exception handler

### Database Design
- **MongoDB** with Motor async driver
- **Document Relationships**: Uses ObjectId references between collections
- **Indexes**: Configured in `scripts/init-mongo.js` for performance
- **Collections**: users, travel_agents, dmc_agents, hotels, offers, bookings

### Key Design Patterns

#### Service Layer Pattern
Each business domain has a dedicated service class:
- `AuthService`: User authentication and token management
- `AgentService`: Travel/DMC agent profile management
- `HotelService`: Hotel inventory management
- `OfferService`: Quote request/response lifecycle
- `BookingService`: Reservation management

#### Repository Pattern (via Services)
Services encapsulate all database operations for their domain, providing a clean interface for controllers.

#### Dependency Injection
Key dependencies are injected via FastAPI's dependency system:
- `get_db()`: Database session
- `get_current_active_user()`: Authenticated user
- `get_current_travel_agent()`: Travel agent profile
- `get_current_dmc_agent()`: DMC agent profile

#### State Machine Pattern
Business entities follow state transitions:
- **Offers**: PENDING → QUOTED → ACCEPTED/REJECTED/EXPIRED
- **Bookings**: CONFIRMED → CANCELLED/COMPLETED
- **Payments**: PENDING → PAID/FAILED → REFUNDED

## Key Configuration

### Environment Variables
Critical settings in `.env`:
- `MONGODB_URL`: Database connection string
- `SECRET_KEY`: JWT signing key (must be secure in production)
- `ENVIRONMENT`: Controls debug mode and API documentation exposure
- `BACKEND_CORS_ORIGINS`: Allowed frontend origins

### User Types and Permissions
Defined in `src/core/constants.py`:
- `UserType.TRAVEL_AGENT`: Can create offers, bookings
- `UserType.DMC_AGENT`: Can manage hotels, provide quotes

### Database Relationships
- Users → Agent Profiles (1:1)
- DMC Agents → Hotels (1:many)
- Hotels → Offers (1:many via DMC Agent)
- Travel Agents → Offers (1:many)
- Offers → Bookings (1:1)

## Development Patterns

### Adding New Endpoints
1. Define request/response schemas in `src/schemas/`
2. Add business logic to appropriate service in `src/services/`
3. Create endpoint in `src/api/v1/endpoints/`
4. Register route in `src/api/v1/api.py`

### Adding New Business Entities
1. Create Pydantic model in `src/models/`
2. Define schemas in `src/schemas/`
3. Create service class in `src/services/`
4. Add MongoDB collection and indexes in `scripts/init-mongo.js`

### Error Handling
- Use FastAPI's `HTTPException` for business logic errors
- Services should validate business rules and throw appropriate exceptions
- All responses use structured format via `ResponseModel[T]`

### Authentication Flow
- All protected endpoints use `get_current_active_user` dependency
- Role-specific endpoints use `get_current_travel_agent` or `get_current_dmc_agent`
- JWT tokens include user ID in `sub` claim
- Refresh tokens have longer expiration and `type: "refresh"` claim

### Database Operations
- All database operations are async using Motor
- Use `prepare_document_for_response()` to convert MongoDB documents to API responses
- ObjectId fields are converted to strings in responses
- Pagination handled via `paginate_collection()` utility