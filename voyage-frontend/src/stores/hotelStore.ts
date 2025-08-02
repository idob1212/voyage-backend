import { create } from 'zustand';
import { Hotel, HotelSearchFilters } from '@/types';

interface HotelState {
  // Search state
  searchResults: Hotel[];
  searchFilters: HotelSearchFilters;
  isSearching: boolean;
  searchError: string | null;
  searchMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // My hotels (for DMC agents)
  myHotels: Hotel[];
  isLoadingMyHotels: boolean;
  myHotelsError: string | null;

  // Featured/Popular
  featuredHotels: Hotel[];
  popularDestinations: { destination: string; hotel_count: number; image_url?: string }[];

  // Actions
  setSearchResults: (hotels: Hotel[], meta: any) => void;
  setSearchFilters: (filters: HotelSearchFilters) => void;
  setSearching: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  clearSearch: () => void;

  setMyHotels: (hotels: Hotel[]) => void;
  setLoadingMyHotels: (loading: boolean) => void;
  setMyHotelsError: (error: string | null) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (hotelId: string, updates: Partial<Hotel>) => void;
  removeHotel: (hotelId: string) => void;

  setFeaturedHotels: (hotels: Hotel[]) => void;
  setPopularDestinations: (destinations: { destination: string; hotel_count: number; image_url?: string }[]) => void;
}

export const useHotelStore = create<HotelState>((set, get) => ({
  // Search state
  searchResults: [],
  searchFilters: {},
  isSearching: false,
  searchError: null,
  searchMeta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  // My hotels
  myHotels: [],
  isLoadingMyHotels: false,
  myHotelsError: null,

  // Featured/Popular
  featuredHotels: [],
  popularDestinations: [],

  // Search actions
  setSearchResults: (hotels, meta) => {
    set({
      searchResults: hotels,
      searchMeta: meta,
      searchError: null,
    });
  },

  setSearchFilters: (filters) => {
    set({ searchFilters: filters });
  },

  setSearching: (loading) => {
    set({ isSearching: loading });
  },

  setSearchError: (error) => {
    set({ searchError: error });
  },

  clearSearch: () => {
    set({
      searchResults: [],
      searchFilters: {},
      searchError: null,
      searchMeta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  },

  // My hotels actions
  setMyHotels: (hotels) => {
    set({ myHotels: hotels, myHotelsError: null });
  },

  setLoadingMyHotels: (loading) => {
    set({ isLoadingMyHotels: loading });
  },

  setMyHotelsError: (error) => {
    set({ myHotelsError: error });
  },

  addHotel: (hotel) => {
    const { myHotels } = get();
    set({ myHotels: [hotel, ...myHotels] });
  },

  updateHotel: (hotelId, updates) => {
    const { myHotels, searchResults } = get();
    
    // Update in myHotels
    const updatedMyHotels = myHotels.map(hotel =>
      hotel.id === hotelId ? { ...hotel, ...updates } : hotel
    );
    
    // Update in searchResults
    const updatedSearchResults = searchResults.map(hotel =>
      hotel.id === hotelId ? { ...hotel, ...updates } : hotel
    );

    set({
      myHotels: updatedMyHotels,
      searchResults: updatedSearchResults,
    });
  },

  removeHotel: (hotelId) => {
    const { myHotels, searchResults } = get();
    
    set({
      myHotels: myHotels.filter(hotel => hotel.id !== hotelId),
      searchResults: searchResults.filter(hotel => hotel.id !== hotelId),
    });
  },

  // Featured/Popular actions
  setFeaturedHotels: (hotels) => {
    set({ featuredHotels: hotels });
  },

  setPopularDestinations: (destinations) => {
    set({ popularDestinations: destinations });
  },
}));