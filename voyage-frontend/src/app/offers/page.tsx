"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OfferCard } from "@/components/features/offers/OfferCard";
import { useOfferStore } from "@/stores/offerStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Offer, OfferStatus } from "@/types";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner";

// Mock offers data
const mockOffers: (Offer & {
  hotel: { name: string; city: string; country: string };
  dmc_agent: { company_name: string; user: { full_name: string } };
})[] = [
  {
    id: "offer1",
    travel_agent_id: "ta1",
    hotel_id: "h1",
    dmc_agent_id: "dmc1",
    check_in_date: "2024-12-20",
    check_out_date: "2024-12-25",
    guests: { adults: 2, children: 1, infants: 0 },
    room_requirements: [
      { room_type: "Standard Room", quantity: 1, guests_per_room: { adults: 2, children: 1, infants: 0 } }
    ],
    special_requests: "Late check-out if possible",
    budget_range: { min_budget: 150, max_budget: 250 },
    status: OfferStatus.PENDING,
    expires_at: "2024-08-10T10:00:00Z",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-01T10:00:00Z",
    hotel: { name: "Hilton Prague", city: "Prague", country: "Czech Republic" },
    dmc_agent: { company_name: "TravelWays Prague", user: { full_name: "Aaron Becker" } }
  },
  {
    id: "offer2",
    travel_agent_id: "ta1",
    hotel_id: "h2",
    dmc_agent_id: "dmc2",
    check_in_date: "2024-11-15",
    check_out_date: "2024-11-20",
    guests: { adults: 4, children: 0, infants: 0 },
    room_requirements: [
      { room_type: "Executive Suite", quantity: 2, guests_per_room: { adults: 2, children: 0, infants: 0 } }
    ],
    status: OfferStatus.QUOTED,
    quote: {
      room_breakdown: [
        { room_type: "Executive Suite", quantity: 2, nights: 5, rate_per_night: 320, total_cost: 3200 }
      ],
      total_cost: 3200,
      currency: "EUR",
      inclusions: ["Breakfast", "WiFi", "Airport transfer"],
      exclusions: ["City tax", "Personal expenses"],
      payment_terms: "50% deposit, balance on arrival",
      cancellation_policy: "Free cancellation up to 48 hours",
      valid_until: "2024-08-15T23:59:59Z",
      additional_notes: "Upgrade to ocean view available for €50/night"
    },
    expires_at: "2024-08-15T23:59:59Z",
    created_at: "2024-07-28T14:30:00Z",
    updated_at: "2024-07-29T09:15:00Z",
    hotel: { name: "Grand Hotel Sorrento", city: "Sorrento", country: "Italy" },
    dmc_agent: { company_name: "Mediterranean Dreams", user: { full_name: "Yiannis Mercourou" } }
  },
  {
    id: "offer3",
    travel_agent_id: "ta1",
    hotel_id: "h3",
    dmc_agent_id: "dmc3",
    check_in_date: "2024-10-10",
    check_out_date: "2024-10-15",
    guests: { adults: 2, children: 0, infants: 0 },
    room_requirements: [
      { room_type: "Sea View Room", quantity: 1, guests_per_room: { adults: 2, children: 0, infants: 0 } }
    ],
    status: OfferStatus.ACCEPTED,
    quote: {
      room_breakdown: [
        { room_type: "Sea View Room", quantity: 1, nights: 5, rate_per_night: 280, total_cost: 1400 }
      ],
      total_cost: 1400,
      currency: "EUR",
      inclusions: ["Breakfast", "WiFi", "Welcome drink"],
      exclusions: ["City tax"],
      payment_terms: "Pay at property",
      cancellation_policy: "Free cancellation up to 7 days",
      valid_until: "2024-08-05T23:59:59Z"
    },
    created_at: "2024-07-20T11:20:00Z",
    updated_at: "2024-07-22T16:45:00Z",
    hotel: { name: "Hotel Poseidon", city: "Sorrento", country: "Italy" },
    dmc_agent: { company_name: "Amalfi Coast Experts", user: { full_name: "Marco Rossi" } }
  }
];

export default function OffersPage() {
  const { user } = useAuth();
  const { 
    myOffers, 
    isLoadingMyOffers, 
    offerStats,
    setMyOffers,
    setLoadingMyOffers,
    setOfferStats 
  } = useOfferStore();

  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Load offers
    setLoadingMyOffers(true);
    setTimeout(() => {
      setMyOffers(mockOffers);
      setLoadingMyOffers(false);
    }, 1000);

    // Load stats
    setOfferStats({
      total_offers: mockOffers.length,
      pending_offers: mockOffers.filter(o => o.status === OfferStatus.PENDING).length,
      quoted_offers: mockOffers.filter(o => o.status === OfferStatus.QUOTED).length,
      accepted_offers: mockOffers.filter(o => o.status === OfferStatus.ACCEPTED).length,
      conversion_rate: 75
    });
  }, []);

  const filterOffersByStatus = (status?: OfferStatus) => {
    if (!status) return myOffers;
    return myOffers.filter(offer => offer.status === status);
  };

  const handleAcceptOffer = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Offer accepted!", {
        description: "The booking process will begin shortly.",
      });
      
      // Redirect to bookings
      window.location.href = "/bookings";
    } catch (error) {
      toast.error("Failed to accept offer", {
        description: "Please try again later.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setActionLoading(offerId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Offer rejected", {
        description: "The DMC agent has been notified.",
      });
      
      // Update local state
      const updatedOffers = myOffers.map(offer =>
        offer.id === offerId ? { ...offer, status: OfferStatus.REJECTED } : offer
      );
      setMyOffers(updatedOffers);
    } catch (error) {
      toast.error("Failed to reject offer", {
        description: "Please try again later.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (offerId: string) => {
    window.location.href = `/offers/${offerId}`;
  };

  const handleMessage = (offerId: string) => {
    const offer = myOffers.find(o => o.id === offerId);
    if (offer) {
      window.location.href = `/messages?agent=${offer.dmc_agent_id}&offer=${offerId}`;
    }
  };

  const getTabCount = (status?: OfferStatus) => {
    return filterOffersByStatus(status).length;
  };

  const renderOffersList = (offers: typeof myOffers) => {
    if (isLoadingMyOffers) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title="No offers found"
          description="Your quote requests will appear here once you start searching for hotels."
          action={{
            label: "Search Hotels",
            onClick: () => window.location.href = "/search",
          }}
        />
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            userType="travel_agent"
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            onViewDetails={handleViewDetails}
            onMessage={handleMessage}
            isLoading={actionLoading === offer.id}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <PageHeader
          title="My Quote Requests"
          description="Track your hotel quote requests and manage responses from DMC agents."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard/travel-agent" },
            { label: "Quote Requests" },
          ]}
          action={
            <Button asChild>
              <a href="/search">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </a>
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.total_offers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.pending_offers || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting quotes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quoted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.quoted_offers || 0}</div>
              <p className="text-xs text-muted-foreground">Ready to review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.conversion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">Accepted offers</p>
            </CardContent>
          </Card>
        </div>

        {/* Offers Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {getTabCount()}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Pending
              <Badge variant="secondary" className="ml-1">
                {getTabCount(OfferStatus.PENDING)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quoted" className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Quoted
              <Badge variant="secondary" className="ml-1">
                {getTabCount(OfferStatus.QUOTED)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              Accepted
              <Badge variant="secondary" className="ml-1">
                {getTabCount(OfferStatus.ACCEPTED)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-3 w-3" />
              Rejected
              <Badge variant="secondary" className="ml-1">
                {getTabCount(OfferStatus.REJECTED)}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {renderOffersList(filterOffersByStatus())}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {renderOffersList(filterOffersByStatus(OfferStatus.PENDING))}
          </TabsContent>

          <TabsContent value="quoted" className="space-y-6">
            {renderOffersList(filterOffersByStatus(OfferStatus.QUOTED))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-6">
            {renderOffersList(filterOffersByStatus(OfferStatus.ACCEPTED))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            {renderOffersList(filterOffersByStatus(OfferStatus.REJECTED))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}