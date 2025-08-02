import { create } from 'zustand';
import { Offer, OfferStatus, OfferQuote } from '@/types';

interface OfferState {
  // My offers (Travel Agent)
  myOffers: Offer[];
  isLoadingMyOffers: boolean;
  myOffersError: string | null;

  // Incoming offers (DMC Agent)
  incomingOffers: Offer[];
  isLoadingIncomingOffers: boolean;
  incomingOffersError: string | null;

  // Current offer details
  currentOffer: (Offer & { hotel?: any; dmc_agent?: any; travel_agent?: any }) | null;
  isLoadingCurrentOffer: boolean;
  currentOfferError: string | null;

  // Offer statistics
  offerStats: {
    total_offers: number;
    pending_offers: number;
    quoted_offers: number;
    accepted_offers: number;
    conversion_rate: number;
  } | null;

  // Actions for my offers
  setMyOffers: (offers: Offer[]) => void;
  setLoadingMyOffers: (loading: boolean) => void;
  setMyOffersError: (error: string | null) => void;
  addMyOffer: (offer: Offer) => void;
  updateMyOffer: (offerId: string, updates: Partial<Offer>) => void;

  // Actions for incoming offers
  setIncomingOffers: (offers: Offer[]) => void;
  setLoadingIncomingOffers: (loading: boolean) => void;
  setIncomingOffersError: (error: string | null) => void;
  updateIncomingOffer: (offerId: string, updates: Partial<Offer>) => void;

  // Actions for current offer
  setCurrentOffer: (offer: (Offer & { hotel?: any; dmc_agent?: any; travel_agent?: any }) | null) => void;
  setLoadingCurrentOffer: (loading: boolean) => void;
  setCurrentOfferError: (error: string | null) => void;

  // Actions for offer stats
  setOfferStats: (stats: any) => void;

  // Utility actions
  clearOffers: () => void;
  getOfferById: (offerId: string) => Offer | null;
}

export const useOfferStore = create<OfferState>((set, get) => ({
  // My offers state
  myOffers: [],
  isLoadingMyOffers: false,
  myOffersError: null,

  // Incoming offers state
  incomingOffers: [],
  isLoadingIncomingOffers: false,
  incomingOffersError: null,

  // Current offer state
  currentOffer: null,
  isLoadingCurrentOffer: false,
  currentOfferError: null,

  // Statistics
  offerStats: null,

  // My offers actions
  setMyOffers: (offers) => {
    set({ myOffers: offers, myOffersError: null });
  },

  setLoadingMyOffers: (loading) => {
    set({ isLoadingMyOffers: loading });
  },

  setMyOffersError: (error) => {
    set({ myOffersError: error });
  },

  addMyOffer: (offer) => {
    const { myOffers } = get();
    set({ myOffers: [offer, ...myOffers] });
  },

  updateMyOffer: (offerId, updates) => {
    const { myOffers, currentOffer } = get();
    
    const updatedOffers = myOffers.map(offer =>
      offer.id === offerId ? { ...offer, ...updates } : offer
    );
    
    set({ myOffers: updatedOffers });

    // Also update current offer if it matches
    if (currentOffer && currentOffer.id === offerId) {
      set({ currentOffer: { ...currentOffer, ...updates } });
    }
  },

  // Incoming offers actions
  setIncomingOffers: (offers) => {
    set({ incomingOffers: offers, incomingOffersError: null });
  },

  setLoadingIncomingOffers: (loading) => {
    set({ isLoadingIncomingOffers: loading });
  },

  setIncomingOffersError: (error) => {
    set({ incomingOffersError: error });
  },

  updateIncomingOffer: (offerId, updates) => {
    const { incomingOffers, currentOffer } = get();
    
    const updatedOffers = incomingOffers.map(offer =>
      offer.id === offerId ? { ...offer, ...updates } : offer
    );
    
    set({ incomingOffers: updatedOffers });

    // Also update current offer if it matches
    if (currentOffer && currentOffer.id === offerId) {
      set({ currentOffer: { ...currentOffer, ...updates } });
    }
  },

  // Current offer actions
  setCurrentOffer: (offer) => {
    set({ currentOffer: offer, currentOfferError: null });
  },

  setLoadingCurrentOffer: (loading) => {
    set({ isLoadingCurrentOffer: loading });
  },

  setCurrentOfferError: (error) => {
    set({ currentOfferError: error });
  },

  // Statistics actions
  setOfferStats: (stats) => {
    set({ offerStats: stats });
  },

  // Utility actions
  clearOffers: () => {
    set({
      myOffers: [],
      incomingOffers: [],
      currentOffer: null,
      myOffersError: null,
      incomingOffersError: null,
      currentOfferError: null,
      offerStats: null,
    });
  },

  getOfferById: (offerId) => {
    const { myOffers, incomingOffers } = get();
    return [...myOffers, ...incomingOffers].find(offer => offer.id === offerId) || null;
  },
}));