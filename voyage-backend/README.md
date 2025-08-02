# Voyage Backend API

A comprehensive backend API for connecting travel agents with local DMC (Destination Management Company) agents worldwide. The platform enables travel agents to find qualified DMC agents who can provide competitive hotel offers through their local networks.

## Features

### Core Functionality
- **User Management**: Separate registration and profiles for Travel Agents and DMC Agents
- **Agent Profiles**: Comprehensive profiles with verification, ratings, and specializations
- **Hotel Management**: DMC agents can manage their hotel inventory with detailed information
- **Offer System**: Travel agents can request quotes and DMC agents can provide detailed offers
- **Booking Management**: Complete booking lifecycle from quote acceptance to completion
- **Real-time Communication**: WebSocket support for instant notifications

### Technical Features
- **FastAPI Framework**: Modern, fast, and async Python web framework
- **MongoDB**: Flexible document database with efficient indexing
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access**: Different permissions for Travel Agents and DMC Agents
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Data Validation**: Comprehensive input validation using Pydantic
- **Error Handling**: Structured error responses with proper HTTP status codes
- **CORS Support**: Configurable Cross-Origin Resource Sharing
- **Health Checks**: Built-in health monitoring endpoints

## Project Structure

```
voyage-backend/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/          # API endpoint handlers
│   │   │   │   ├── auth.py         # Authentication endpoints
│   │   │   │   ├── agents.py       # Agent management endpoints
│   │   │   │   ├── hotels.py       # Hotel management endpoints
│   │   │   │   ├── offers.py       # Offer/quote endpoints
│   │   │   │   └── bookings.py     # Booking management endpoints
│   │   │   └── api.py              # API router configuration
│   │   └── dependencies.py         # Shared dependencies
│   ├── core/
│   │   ├── config.py              # Application configuration
│   │   ├── security.py            # Security utilities (JWT, hashing)
│   │   └── constants.py           # Application constants and enums
│   ├── models/
│   │   ├── base.py               # Base document model
│   │   ├── user.py               # User model
│   │   ├── agent.py              # Agent models (Travel & DMC)
│   │   ├── hotel.py              # Hotel model
│   │   ├── offer.py              # Offer/quote model
│   │   └── booking.py            # Booking model
│   ├── schemas/
│   │   ├── base.py               # Base schemas and response models
│   │   ├── user.py               # User schemas
│   │   ├── agent.py              # Agent schemas
│   │   ├── hotel.py              # Hotel schemas
│   │   ├── offer.py              # Offer schemas
│   │   └── booking.py            # Booking schemas
│   ├── services/
│   │   ├── auth.py               # Authentication service
│   │   ├── agent.py              # Agent management service
│   │   ├── hotel.py              # Hotel management service
│   │   ├── offer.py              # Offer management service
│   │   └── booking.py            # Booking management service
│   ├── db/
│   │   ├── mongodb.py            # MongoDB connection setup
│   │   └── session.py            # Database session management
│   ├── utils/
│   │   ├── validators.py         # Input validation utilities
│   │   ├── pagination.py         # Pagination helpers
│   │   └── helpers.py            # General utility functions
│   └── main.py                   # FastAPI application entry point
├── tests/                        # Test files
├── scripts/
│   └── init-mongo.js            # MongoDB initialization script
├── docker-compose.yml           # Docker services configuration
├── Dockerfile                   # Docker image configuration
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - User logout

### Agents
- `POST /api/v1/agents/travel` - Create travel agent profile
- `GET /api/v1/agents/travel/me` - Get my travel agent profile
- `PUT /api/v1/agents/travel/me` - Update my travel agent profile
- `GET /api/v1/agents/travel` - List travel agents
- `POST /api/v1/agents/dmc` - Create DMC agent profile
- `GET /api/v1/agents/dmc/me` - Get my DMC agent profile
- `PUT /api/v1/agents/dmc/me` - Update my DMC agent profile
- `GET /api/v1/agents/dmc/search` - Search DMC agents
- `GET /api/v1/agents/dmc/{agent_id}` - Get DMC agent by ID

### Hotels
- `POST /api/v1/hotels` - Create hotel (DMC agents only)
- `GET /api/v1/hotels/search` - Search hotels
- `GET /api/v1/hotels/my-hotels` - Get my hotels (DMC agents)
- `GET /api/v1/hotels/{hotel_id}` - Get hotel by ID
- `PUT /api/v1/hotels/{hotel_id}` - Update hotel
- `DELETE /api/v1/hotels/{hotel_id}` - Delete hotel
- `GET /api/v1/hotels/availability/search` - Search available hotels

### Offers
- `POST /api/v1/offers/request` - Create offer request (Travel agents)
- `GET /api/v1/offers` - List offers (filtered by user type)
- `GET /api/v1/offers/statistics` - Get offer statistics
- `GET /api/v1/offers/{offer_id}` - Get offer by ID
- `PUT /api/v1/offers/{offer_id}/quote` - Provide quote (DMC agents)
- `PUT /api/v1/offers/{offer_id}/accept` - Accept offer (Travel agents)
- `PUT /api/v1/offers/{offer_id}/reject` - Reject offer (Travel agents)

### Bookings
- `POST /api/v1/bookings` - Create booking (Travel agents)
- `GET /api/v1/bookings` - List bookings (filtered by user type)
- `GET /api/v1/bookings/statistics` - Get booking statistics
- `GET /api/v1/bookings/confirmation/{confirmation_number}` - Get booking by confirmation
- `GET /api/v1/bookings/{booking_id}` - Get booking by ID
- `PUT /api/v1/bookings/{booking_id}` - Update booking
- `PUT /api/v1/bookings/{booking_id}/cancel` - Cancel booking

## Quick Start

### Prerequisites
- Python 3.11+
- MongoDB 7.0+
- Redis 7.2+ (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voyage-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start services with Docker**
   ```bash
   docker-compose up -d mongodb redis
   ```

6. **Run the application**
   ```bash
   python -m uvicorn src.main:app --reload
   ```

### Using Docker

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Configuration

Key environment variables:

```env
# Database
MONGODB_URL=mongodb://voyage_user:voyage_pass@localhost:27017/voyage_db?authSource=admin
DATABASE_NAME=voyage_db

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Environment
ENVIRONMENT=development
DEBUG=true
API_V1_STR=/api/v1

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Usage Examples

### 1. Register a Travel Agent
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@travel.com",
    "password": "SecurePass123!",
    "user_type": "travel_agent",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### 2. Create Travel Agent Profile
```bash
curl -X POST "http://localhost:8000/api/v1/agents/travel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company_name": "Global Travel Solutions",
    "license_number": "GTS-2023-001",
    "country": "United States",
    "city": "New York"
  }'
```

### 3. Search DMC Agents
```bash
curl "http://localhost:8000/api/v1/agents/dmc/search?country=Italy&city=Rome&verified_only=true"
```

### 4. Request Hotel Quote
```bash
curl -X POST "http://localhost:8000/api/v1/offers/request" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "hotel_id": "648f1234567890abcdef1234",
    "check_in_date": "2024-06-15",
    "check_out_date": "2024-06-18",
    "rooms": [
      {
        "room_type": "double",
        "quantity": 2,
        "adults": 4,
        "children": 0
      }
    ]
  }'
```

## Database Schema

### Collections
- **users**: Base user information
- **travel_agents**: Travel agent profiles
- **dmc_agents**: DMC agent profiles with regions and specializations
- **hotels**: Hotel inventory managed by DMC agents
- **offers**: Quote requests and responses
- **bookings**: Confirmed reservations

### Indexes
- Email uniqueness on users
- Geographic indexes on agent regions
- Compound indexes on offers for efficient querying
- Confirmation number uniqueness on bookings

## Security

- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added with middleware)
- Trusted host middleware for production

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_auth.py
```

## Development

### Adding New Features

1. **Create models** in `src/models/`
2. **Define schemas** in `src/schemas/`
3. **Implement services** in `src/services/`
4. **Create endpoints** in `src/api/v1/endpoints/`
5. **Add to router** in `src/api/v1/api.py`
6. **Write tests** in `tests/`

### Code Style

- Follow PEP 8 guidelines
- Use type hints
- Document functions with docstrings
- Keep functions focused and small
- Use async/await for I/O operations

## Monitoring and Logging

- Structured logging with configurable levels
- Health check endpoints for monitoring
- Request/Response logging in development
- Error tracking and reporting

## Production Deployment

1. **Set environment variables**
   - Set `ENVIRONMENT=production`
   - Configure secure `SECRET_KEY`
   - Set appropriate CORS origins
   - Configure production database URLs

2. **Security considerations**
   - Use HTTPS in production
   - Configure firewall rules
   - Regular security updates
   - Monitor access logs

3. **Performance optimization**
   - Enable database connection pooling
   - Use Redis for caching
   - Configure proper indexes
   - Monitor performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.