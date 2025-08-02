"""
Booking data generator
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId

# Import models and enums
from models.booking import GuestInfo, PaymentInfo, BookingStatus, PaymentStatus

class BookingGenerator:
    def __init__(self, db, faker):
        self.db = db
        self.fake = faker
        
        # Common nationalities for guest info
        self.nationalities = [
            "USA", "GBR", "DEU", "FRA", "ITA", "ESP", "CAN", "AUS", "JPN", "CHN", 
            "IND", "BRA", "RUS", "NLD", "SWE", "NOR", "DNK", "BEL", "CHE", "AUT"
        ]
        
        # Payment methods
        self.payment_methods = [
            "Credit Card", "Debit Card", "Bank Transfer", "PayPal", "Apple Pay", "Google Pay"
        ]
    
    def generate_guest_info(self, is_lead_guest: bool = True) -> Dict:
        """Generate realistic guest information"""
        
        first_name = self.fake.first_name()
        last_name = self.fake.last_name()
        
        guest = {
            "first_name": first_name,
            "last_name": last_name
        }
        
        # Lead guest gets more complete information
        if is_lead_guest:
            guest.update({
                "email": f"{first_name.lower()}.{last_name.lower()}@{self.fake.domain_name()}",
                "phone": self.fake.phone_number()[:20],
                "nationality": random.choice(self.nationalities),
                "passport_number": f"{random.choice(self.nationalities)}{random.randint(100000000, 999999999)}",
                "date_of_birth": datetime.combine(self.fake.date_of_birth(minimum_age=18, maximum_age=80), datetime.min.time())
            })
        else:
            # Additional guests may have some optional info
            if random.random() > 0.7:
                guest["nationality"] = random.choice(self.nationalities)
            if random.random() > 0.8:
                guest["passport_number"] = f"{random.choice(self.nationalities)}{random.randint(100000000, 999999999)}"
            if random.random() > 0.6:
                guest["date_of_birth"] = datetime.combine(self.fake.date_of_birth(minimum_age=1, maximum_age=80), datetime.min.time())
        
        return guest
    
    def generate_additional_guests(self, room_requests: List[Dict]) -> List[Dict]:
        """Generate additional guests based on room requests"""
        
        additional_guests = []
        total_guests = sum(room["adults"] + room["children"] for room in room_requests) - 1  # Subtract lead guest
        
        for _ in range(max(0, total_guests)):
            guest = self.generate_guest_info(is_lead_guest=False)
            additional_guests.append(guest)
        
        return additional_guests
    
    def generate_payment_info(self, total_amount: float, booking_date: datetime, 
                            check_in_date: datetime, booking_status: str) -> Dict:
        """Generate payment information"""
        
        payment_method = random.choice(self.payment_methods)
        transaction_id = f"TXN{random.randint(100000000, 999999999)}"
        
        # Determine payment status based on booking status and dates
        if booking_status == BookingStatus.CANCELLED.value:
            payment_status = random.choice([PaymentStatus.REFUNDED.value, PaymentStatus.PAID.value])
        elif check_in_date < datetime.now().date():  # Past bookings
            payment_status = PaymentStatus.PAID.value
        else:  # Future bookings
            payment_status = random.choices(
                [PaymentStatus.PAID.value, PaymentStatus.PENDING.value, PaymentStatus.FAILED.value],
                weights=[75, 20, 5]
            )[0]
        
        payment_info = {
            "amount": total_amount,
            "currency": "USD",
            "payment_method": payment_method,
            "transaction_id": transaction_id
        }
        
        # Set payment date
        if payment_status == PaymentStatus.PAID.value:
            # Payment made between booking and check-in (or shortly after booking)
            max_payment_delay = min(7, (check_in_date - booking_date.date()).days)
            payment_delay = random.randint(0, max(1, max_payment_delay))
            payment_info["payment_date"] = booking_date + timedelta(days=payment_delay)
        
        # Handle refunds for cancelled bookings
        if payment_status == PaymentStatus.REFUNDED.value:
            # Refund is usually partial due to cancellation fees
            refund_percentage = random.uniform(0.5, 0.9)  # 50-90% refund
            payment_info["refund_amount"] = round(total_amount * refund_percentage, 2)
            payment_info["refund_date"] = booking_date + timedelta(days=random.randint(1, 30))
        
        return payment_info, payment_status
    
    def generate_confirmation_number(self) -> str:
        """Generate unique confirmation number"""
        return f"VYG{random.randint(100000, 999999)}"
    
    def determine_booking_status(self, check_in_date, check_out_date) -> str:
        """Determine booking status based on dates"""
        
        today = datetime.now().date()
        
        # Convert datetime to date for comparison
        check_in = check_in_date.date() if isinstance(check_in_date, datetime) else check_in_date
        check_out = check_out_date.date() if isinstance(check_out_date, datetime) else check_out_date
        
        if check_out < today:
            # Past bookings are mostly completed, some cancelled
            return random.choices(
                [BookingStatus.COMPLETED.value, BookingStatus.CANCELLED.value],
                weights=[85, 15]
            )[0]
        elif check_in <= today <= check_out:
            # Current bookings are confirmed (guest is there)
            return BookingStatus.CONFIRMED.value
        else:
            # Future bookings are mostly confirmed, some cancelled
            return random.choices(
                [BookingStatus.CONFIRMED.value, BookingStatus.CANCELLED.value],
                weights=[90, 10]
            )[0]
    
    async def generate_bookings(self, offers: List[Dict]) -> List[Dict]:
        """Generate bookings from accepted offers"""
        
        # Filter for accepted offers only
        accepted_offers = [offer for offer in offers if offer["status"] == "accepted"]
        
        bookings = []
        
        for offer in accepted_offers:
            # Determine booking status
            booking_status = self.determine_booking_status(offer["check_in_date"], offer["check_out_date"])
            
            # Generate booking date (shortly after offer was accepted)
            booking_date = offer.get("responded_at", offer["updated_at"]) + timedelta(hours=random.randint(1, 48))
            
            # Generate lead guest
            lead_guest = self.generate_guest_info(is_lead_guest=True)
            
            # Generate additional guests
            additional_guests = self.generate_additional_guests(offer["rooms"]) if random.random() > 0.3 else []
            
            # Generate payment information
            total_amount = offer.get("total_price", 0)
            check_in_date = offer["check_in_date"].date() if isinstance(offer["check_in_date"], datetime) else offer["check_in_date"]
            payment_info, payment_status = self.generate_payment_info(
                total_amount, booking_date, check_in_date, booking_status
            )
            
            # Generate cancellation info for cancelled bookings
            cancelled_at = None
            cancellation_reason = None
            cancellation_fee = None
            
            if booking_status == BookingStatus.CANCELLED.value:
                # Cancellation happened between booking and check-in
                check_in_dt = offer["check_in_date"] if isinstance(offer["check_in_date"], datetime) else datetime.combine(offer["check_in_date"], datetime.min.time())
                max_cancel_date = min(datetime.now(), check_in_dt)
                cancel_days = (max_cancel_date.date() - booking_date.date()).days
                
                if cancel_days > 0:
                    cancelled_at = booking_date + timedelta(days=random.randint(1, cancel_days))
                else:
                    cancelled_at = booking_date + timedelta(hours=random.randint(1, 24))
                
                cancellation_reason = random.choice([
                    "Guest requested cancellation",
                    "Travel plans changed",
                    "Medical emergency",
                    "Flight cancelled",
                    "Work commitment",
                    "Family emergency"
                ])
                
                # Cancellation fee (0-50% of booking value)
                cancellation_fee = round(total_amount * random.uniform(0, 0.5), 2)
            
            # Create booking document
            booking = {
                "_id": ObjectId(),
                "offer_id": offer["_id"],
                "travel_agent_id": offer["travel_agent_id"],
                "dmc_agent_id": offer["dmc_agent_id"],
                "hotel_id": offer["hotel_id"],
                "confirmation_number": self.generate_confirmation_number(),
                "lead_guest": lead_guest,
                "additional_guests": additional_guests,
                "status": booking_status,
                "booking_date": booking_date,
                "payment_status": payment_status,
                "payment_info": payment_info,
                "cancelled_at": cancelled_at,
                "cancellation_reason": cancellation_reason,
                "cancellation_fee": cancellation_fee,
                "special_requests": offer.get("special_requirements") if random.random() > 0.5 else None,
                "internal_notes": self.fake.text(max_nb_chars=200) if random.random() > 0.8 else None,
                "guest_notes": self.fake.text(max_nb_chars=300) if random.random() > 0.7 else None,
                "created_at": booking_date,
                "updated_at": cancelled_at or booking_date
            }
            
            bookings.append(booking)
        
        # Insert bookings into database
        if bookings:
            await self.db.bookings.insert_many(bookings)
        
        return bookings