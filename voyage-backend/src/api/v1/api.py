from fastapi import APIRouter

from api.v1.endpoints import auth, agents, hotels, offers, bookings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(hotels.router, prefix="/hotels", tags=["hotels"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])