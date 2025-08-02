"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HotelSearchForm } from "@/components/features/hotel-search/HotelSearchForm";
import { HotelCard } from "@/components/features/hotel-search/HotelCard";
import { useHotelStore } from "@/stores/hotelStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Hotel, HotelSearchFilters } from "@/types";
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar,
  Users,
  Filter,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Mock data for development
const mockHotels: (Hotel & { dmc_agent: { company_name: string; is_verified: boolean; user: { full_name: string } } })[] = [
  {
    id: "h1",
    dmc_agent_id: "dmc1",
    name: "Hilton Prague",
    description: "Luxury hotel in the heart of Prague with stunning city views and world-class amenities.",
    address: "Pobrezni 1",
    city: "Prague",
    country: "Czech Republic",
    star_rating: 5,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Fitness Center", "Bar", "Room Service"],
    images: [],
    room_types: [
      {
        id: "r1",
        name: "Standard Room",
        description: "Comfortable room with city view",
        max_occupancy: 2,
        amenities: ["WiFi", "Air Conditioning"],
        images: [],
        base_price: 180
      },
      {
        id: "r2", 
        name: "Executive Suite",
        description: "Spacious suite with premium amenities",
        max_occupancy: 4,
        amenities: ["WiFi", "Air Conditioning", "Minibar"],
        images: [],
        base_price: 350
      }
    ],
    policies: {
      check_in_time: "15:00",
      check_out_time: "11:00",
      cancellation_policy: "Free cancellation up to 24 hours before check-in",
      payment_terms: "Payment required at booking"
    },
    contact_info: {
      phone: "+420 224 842 000",
      email: "prague@hilton.com",
      website: "https://hilton.com/prague"
    },
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-08-01T14:30:00Z",
    dmc_agent: {
      company_name: "TravelWays Prague",
      is_verified: true,
      user: { full_name: "Aaron Becker" }
    }
  },
  {
    id: "h2",
    dmc_agent_id: "dmc2",
    name: "Hilton Prague Old Town",
    description: "Historic luxury hotel located in Prague's Old Town with traditional charm and modern comfort.",
    address: "Hybernska 42",
    city: "Prague", 
    country: "Czech Republic",
    star_rating: 4,
    amenities: ["WiFi", "Restaurant", "Bar", "Business Center", "Parking"],
    images: [],
    room_types: [
      {
        id: "r3",
        name: "Classic Room",
        description: "Elegant room with historical features",
        max_occupancy: 2,
        amenities: ["WiFi", "Air Conditioning"],
        images: [],
        base_price: 200
      }
    ],
    policies: {
      check_in_time: "14:00",
      check_out_time: "12:00", 
      cancellation_policy: "Free cancellation up to 48 hours before check-in",
      payment_terms: "Payment at property"
    },
    contact_info: {
      phone: "+420 224 593 000",
      email: "oldtown@hilton.com"
    },
    is_active: true,
    created_at: "2024-02-20T09:00:00Z",
    updated_at: "2024-07-28T16:15:00Z",
    dmc_agent: {
      company_name: "EuroTour Holidays",
      is_verified: true,
      user: { full_name: "Maria Novak" }
    }
  },
  {
    id: "h3",
    dmc_agent_id: "dmc3",
    name: "Grand Hotel Sorrento",
    description: "Magnificent oceanfront resort offering breathtaking views of the Bay of Naples.",
    address: "Via Marina Piccola 15",
    city: "Sorrento",
    country: "Italy",
    star_rating: 5,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Beach Access", "Tennis Court"],
    images: [],
    room_types: [
      {
        id: "r4",
        name: "Sea View Room",
        description: "Beautiful room overlooking the Mediterranean",
        max_occupancy: 2,
        amenities: ["WiFi", "Balcony", "Air Conditioning"],
        images: [],
        base_price: 320
      }
    ],
    policies: {
      check_in_time: "15:00",
      check_out_time: "11:00",
      cancellation_policy: "Free cancellation up to 7 days before arrival",
      payment_terms: "50% deposit required"
    },
    contact_info: {
      phone: "+39 081 878 1024",
      email: "info@grandhotelsorrento.com",
      website: "https://grandhotelsorrento.com"
    },
    is_active: true,
    created_at: "2024-03-10T11:30:00Z",
    updated_at: "2024-08-02T09:45:00Z",
    dmc_agent: {
      company_name: "Mediterranean Dreams",
      is_verified: true,
      user: { full_name: "Yiannis Mercourou" }
    }
  }
];

export default function HotelSearchPage() {
  const { user } = useAuth();
  const { 
    searchResults, 
    searchFilters, 
    isSearching, 
    searchMeta,
    setSearchResults,
    setSearchFilters,
    setSearching
  } = useHotelStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [requestingQuoteFor, setRequestingQuoteFor] = useState<string | null>(null);

  const handleSearch = async (filters: HotelSearchFilters) => {
    setSearching(true);
    setSearchFilters(filters);
    setCurrentPage(1);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Filter mock data based on search criteria
      let filteredHotels = mockHotels;

      if (filters.destination) {
        const searchTerm = filters.destination.toLowerCase();
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.name.toLowerCase().includes(searchTerm) ||
          hotel.city.toLowerCase().includes(searchTerm) ||
          hotel.country.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.starRating && filters.starRating.length > 0) {
        filteredHotels = filteredHotels.filter(hotel =>
          filters.starRating!.includes(hotel.star_rating)
        );
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filteredHotels = filteredHotels.filter(hotel =>
          filters.amenities!.some(amenity => hotel.amenities.includes(amenity))
        );
      }

      if (filters.minPrice || filters.maxPrice) {
        filteredHotels = filteredHotels.filter(hotel => {
          const basePrice = hotel.room_types[0]?.base_price || 0;
          if (filters.minPrice && basePrice < filters.minPrice) return false;
          if (filters.maxPrice && basePrice > filters.maxPrice) return false;
          return true;
        });
      }

      setSearchResults(filteredHotels, {
        total: filteredHotels.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(filteredHotels.length / 10)
      });

      toast.success(`Found ${filteredHotels.length} hotels`, {
        description: filters.destination ? `Searching in ${filters.destination}` : "Based on your criteria",
      });
    } catch (error) {
      toast.error("Search failed", {
        description: "There was an error searching for hotels. Please try again.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleRequestQuote = async (hotelId: string) => {
    setRequestingQuoteFor(hotelId);
    
    try {
      // Simulate quote request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Quote request sent!", {
        description: "The DMC agent will respond with pricing soon.",
      });
      
      // Redirect to offers page
      window.location.href = "/offers";
    } catch (error) {
      toast.error("Failed to request quote", {
        description: "Please try again later.",
      });
    } finally {
      setRequestingQuoteFor(null);
    }
  };

  const handleContactDMC = (agentId: string) => {
    // Redirect to messages with pre-selected agent
    window.location.href = `/messages?agent=${agentId}`;
  };

  const hasActiveFilters = searchFilters.destination || 
    (searchFilters.starRating && searchFilters.starRating.length > 0) ||
    (searchFilters.amenities && searchFilters.amenities.length > 0) ||
    searchFilters.minPrice || searchFilters.maxPrice;

  return (
    <MainLayout>
      <div className="container py-6">
        <PageHeader
          title="Search Hotels"
          description="Find the perfect accommodations for your clients"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard/travel-agent" },
            { label: "Search Hotels" },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Search Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <HotelSearchForm 
                onSearch={handleSearch}
                isLoading={isSearching}
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Summary */}
            {(hasActiveFilters || searchResults.length > 0) && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {searchFilters.destination && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {searchFilters.destination}
                          </div>
                        )}
                        {searchFilters.checkIn && searchFilters.checkOut && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(searchFilters.checkIn, "MMM dd")} - {format(searchFilters.checkOut, "MMM dd")}
                          </div>
                        )}
                        {searchFilters.guests && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {searchFilters.guests.adults} adults
                            {searchFilters.guests.children > 0 && `, ${searchFilters.guests.children} children`}
                          </div>
                        )}
                      </div>
                      
                      {!isSearching && (
                        <p className="font-medium">
                          {searchResults.length} hotels found
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          Filters Active
                        </Badge>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        disabled={isSearching}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-muted-foreground">Searching hotels...</p>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {searchResults.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onRequestQuote={handleRequestQuote}
                    onContactDMC={handleContactDMC}
                    isRequestingQuote={requestingQuoteFor === hotel.id}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isSearching && searchResults.length === 0 && hasActiveFilters && (
              <EmptyState
                icon={Search}
                title="No hotels found"
                description="Try adjusting your search criteria or explore different destinations."
                action={{
                  label: "Clear Filters",
                  onClick: () => window.location.reload(),
                }}
              />
            )}

            {/* Initial State */}
            {!isSearching && searchResults.length === 0 && !hasActiveFilters && (
              <EmptyState
                icon={Search}
                title="Start your hotel search"
                description="Use the search form to find the perfect accommodations for your clients."
              />
            )}

            {/* Pagination */}
            {!isSearching && searchResults.length > 0 && searchMeta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, searchMeta.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  disabled={currentPage === searchMeta.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}