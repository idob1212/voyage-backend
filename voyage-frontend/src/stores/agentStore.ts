import { create } from 'zustand';
import { TravelAgent, DMCAgent } from '@/types';

interface AgentState {
  travelAgentProfile: TravelAgent | null;
  dmcAgentProfile: DMCAgent | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  
  setTravelAgentProfile: (profile: TravelAgent | null) => void;
  setDMCAgentProfile: (profile: DMCAgent | null) => void;
  setLoadingProfile: (loading: boolean) => void;
  setProfileError: (error: string | null) => void;
  updateTravelAgentProfile: (updates: Partial<TravelAgent>) => void;
  updateDMCAgentProfile: (updates: Partial<DMCAgent>) => void;
  clearProfiles: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  travelAgentProfile: null,
  dmcAgentProfile: null,
  isLoadingProfile: false,
  profileError: null,

  setTravelAgentProfile: (profile) => {
    set({ travelAgentProfile: profile, profileError: null });
  },

  setDMCAgentProfile: (profile) => {
    set({ dmcAgentProfile: profile, profileError: null });
  },

  setLoadingProfile: (loading) => {
    set({ isLoadingProfile: loading });
  },

  setProfileError: (error) => {
    set({ profileError: error });
  },

  updateTravelAgentProfile: (updates) => {
    const { travelAgentProfile } = get();
    if (travelAgentProfile) {
      set({
        travelAgentProfile: { ...travelAgentProfile, ...updates }
      });
    }
  },

  updateDMCAgentProfile: (updates) => {
    const { dmcAgentProfile } = get();
    if (dmcAgentProfile) {
      set({
        dmcAgentProfile: { ...dmcAgentProfile, ...updates }
      });
    }
  },

  clearProfiles: () => {
    set({
      travelAgentProfile: null,
      dmcAgentProfile: null,
      profileError: null,
      isLoadingProfile: false,
    });
  },
}));