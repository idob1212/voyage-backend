// User Types
export enum UserType {
  TRAVEL_AGENT = "travel_agent",
  DMC_AGENT = "dmc_agent"
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Agent Types
export interface TravelAgent {
  id: string;
  user_id: string;
  company_name: string;
  phone: string;
  website?: string;
  countries_of_operation: string[];
  languages_spoken: string[];
  years_of_experience: number;
  specializations: string[];
  is_verified: boolean;
  verification_documents?: string[];
  created_at: string;
  updated_at: string;
}

export interface DMCAgent {
  id: string;
  user_id: string;
  company_name: string;
  phone: string;
  website?: string;
  regions_covered: string[];
  languages_spoken: string[];
  years_of_experience: number;
  specializations: string[];
  is_verified: boolean;
  verification_documents?: string[];
  created_at: string;
  updated_at: string;
}

// Hotel Types
export interface Hotel {
  id: string;
  dmc_agent_id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  amenities: string[];
  images: string[];
  room_types: RoomType[];
  policies: {
    check_in_time: string;
    check_out_time: string;
    cancellation_policy: string;
    payment_terms: string;
  };
  contact_info: {
    phone: string;
    email: string;
    website?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  max_occupancy: number;
  amenities: string[];
  images: string[];
  base_price: number;
}

// Offer Types
export enum OfferStatus {
  PENDING = "pending",
  QUOTED = "quoted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export interface Offer {
  id: string;
  travel_agent_id: string;
  hotel_id: string;
  dmc_agent_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: GuestDetails;
  room_requirements: RoomRequirement[];
  special_requests?: string;
  budget_range?: {
    min_budget: number;
    max_budget: number;
  };
  status: OfferStatus;
  quote?: OfferQuote;
  notes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestDetails {
  adults: number;
  children: number;
  infants: number;
}

export interface RoomRequirement {
  room_type: string;
  quantity: number;
  guests_per_room: GuestDetails;
}

export interface OfferQuote {
  room_breakdown: RoomBreakdown[];
  total_cost: number;
  currency: string;
  inclusions: string[];
  exclusions: string[];
  payment_terms: string;
  cancellation_policy: string;
  valid_until: string;
  additional_notes?: string;
}

export interface RoomBreakdown {
  room_type: string;
  quantity: number;
  nights: number;
  rate_per_night: number;
  total_cost: number;
}

// Booking Types
export enum BookingStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

export interface Booking {
  id: string;
  offer_id: string;
  travel_agent_id: string;
  dmc_agent_id: string;
  hotel_id: string;
  guest_details: {
    primary_guest: {
      name: string;
      email: string;
      phone: string;
    };
    additional_guests: Array<{
      name: string;
      age?: number;
    }>;
  };
  status: BookingStatus;
  confirmation_number: string;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded"
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Form Types
export interface HotelSearchFilters {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: GuestDetails;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[];
  amenities?: string[];
}

export interface AgentSearchFilters {
  region?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
}