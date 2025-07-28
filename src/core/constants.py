from enum import Enum


class UserType(str, Enum):
    TRAVEL_AGENT = "travel_agent"
    DMC_AGENT = "dmc_agent"


class OfferStatus(str, Enum):
    PENDING = "pending"
    QUOTED = "quoted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class HotelAmenity(str, Enum):
    WIFI = "wifi"
    POOL = "pool"
    GYM = "gym"
    SPA = "spa"
    RESTAURANT = "restaurant"
    BAR = "bar"
    ROOM_SERVICE = "room_service"
    PARKING = "parking"
    AIRPORT_SHUTTLE = "airport_shuttle"
    BUSINESS_CENTER = "business_center"
    CONFERENCE_ROOM = "conference_room"
    PET_FRIENDLY = "pet_friendly"


class RoomType(str, Enum):
    SINGLE = "single"
    DOUBLE = "double"
    TWIN = "twin"
    SUITE = "suite"
    DELUXE = "deluxe"
    FAMILY = "family"
    PRESIDENTIAL = "presidential"


class Specialization(str, Enum):
    LUXURY = "luxury"
    BUDGET = "budget"
    BUSINESS = "business"
    LEISURE = "leisure"
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    MEDICAL = "medical"
    RELIGIOUS = "religious"
    EVENTS = "events"
    GROUPS = "groups"


# Common constants
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100