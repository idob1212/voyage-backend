import { create } from 'zustand';
import { Booking, BookingStatus, PaymentStatus } from '@/types';

interface BookingState {
  // My bookings (Travel Agent)
  myBookings: Booking[];
  isLoadingMyBookings: boolean;
  myBookingsError: string | null;

  // Hotel bookings (DMC Agent)
  hotelBookings: Booking[];
  isLoadingHotelBookings: boolean;
  hotelBookingsError: string | null;

  // Current booking details
  currentBooking: (Booking & { hotel?: any; offer?: any; travel_agent?: any; dmc_agent?: any }) | null;
  isLoadingCurrentBooking: boolean;
  currentBookingError: string | null;

  // Booking statistics
  bookingStats: {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    total_revenue: number;
    monthly_revenue: number;
  } | null;

  // Actions for my bookings
  setMyBookings: (bookings: Booking[]) => void;
  setLoadingMyBookings: (loading: boolean) => void;
  setMyBookingsError: (error: string | null) => void;
  addMyBooking: (booking: Booking) => void;
  updateMyBooking: (bookingId: string, updates: Partial<Booking>) => void;

  // Actions for hotel bookings
  setHotelBookings: (bookings: Booking[]) => void;
  setLoadingHotelBookings: (loading: boolean) => void;
  setHotelBookingsError: (error: string | null) => void;
  updateHotelBooking: (bookingId: string, updates: Partial<Booking>) => void;

  // Actions for current booking
  setCurrentBooking: (booking: (Booking & { hotel?: any; offer?: any; travel_agent?: any; dmc_agent?: any }) | null) => void;
  setLoadingCurrentBooking: (loading: boolean) => void;
  setCurrentBookingError: (error: string | null) => void;

  // Actions for booking stats
  setBookingStats: (stats: any) => void;

  // Utility actions
  clearBookings: () => void;
  getBookingById: (bookingId: string) => Booking | null;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // My bookings state
  myBookings: [],
  isLoadingMyBookings: false,
  myBookingsError: null,

  // Hotel bookings state
  hotelBookings: [],
  isLoadingHotelBookings: false,
  hotelBookingsError: null,

  // Current booking state
  currentBooking: null,
  isLoadingCurrentBooking: false,
  currentBookingError: null,

  // Statistics
  bookingStats: null,

  // My bookings actions
  setMyBookings: (bookings) => {
    set({ myBookings: bookings, myBookingsError: null });
  },

  setLoadingMyBookings: (loading) => {
    set({ isLoadingMyBookings: loading });
  },

  setMyBookingsError: (error) => {
    set({ myBookingsError: error });
  },

  addMyBooking: (booking) => {
    const { myBookings } = get();
    set({ myBookings: [booking, ...myBookings] });
  },

  updateMyBooking: (bookingId, updates) => {
    const { myBookings, currentBooking } = get();
    
    const updatedBookings = myBookings.map(booking =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    );
    
    set({ myBookings: updatedBookings });

    // Also update current booking if it matches
    if (currentBooking && currentBooking.id === bookingId) {
      set({ currentBooking: { ...currentBooking, ...updates } });
    }
  },

  // Hotel bookings actions
  setHotelBookings: (bookings) => {
    set({ hotelBookings: bookings, hotelBookingsError: null });
  },

  setLoadingHotelBookings: (loading) => {
    set({ isLoadingHotelBookings: loading });
  },

  setHotelBookingsError: (error) => {
    set({ hotelBookingsError: error });
  },

  updateHotelBooking: (bookingId, updates) => {
    const { hotelBookings, currentBooking } = get();
    
    const updatedBookings = hotelBookings.map(booking =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    );
    
    set({ hotelBookings: updatedBookings });

    // Also update current booking if it matches
    if (currentBooking && currentBooking.id === bookingId) {
      set({ currentBooking: { ...currentBooking, ...updates } });
    }
  },

  // Current booking actions
  setCurrentBooking: (booking) => {
    set({ currentBooking: booking, currentBookingError: null });
  },

  setLoadingCurrentBooking: (loading) => {
    set({ isLoadingCurrentBooking: loading });
  },

  setCurrentBookingError: (error) => {
    set({ currentBookingError: error });
  },

  // Statistics actions
  setBookingStats: (stats) => {
    set({ bookingStats: stats });
  },

  // Utility actions
  clearBookings: () => {
    set({
      myBookings: [],
      hotelBookings: [],
      currentBooking: null,
      myBookingsError: null,
      hotelBookingsError: null,
      currentBookingError: null,
      bookingStats: null,
    });
  },

  getBookingById: (bookingId) => {
    const { myBookings, hotelBookings } = get();
    return [...myBookings, ...hotelBookings].find(booking => booking.id === bookingId) || null;
  },
}));