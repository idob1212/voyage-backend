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
  Inbox, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// Mock incoming offers data for DMC agents
const mockIncomingOffers: (Offer & {
  hotel: { name: string };
  travel_agent: { company_name: string; user: { full_name: string } };
})[] = [
  {
    id: "incoming1",
    travel_agent_id: "ta1",
    hotel_id: "h1",
    dmc_agent_id: "dmc1",
    check_in_date: "2024-12-20",
    check_out_date: "2024-12-25",
    guests: { adults: 2, children: 1, infants: 0 },
    room_requirements: [
      { room_type: "Standard Room", quantity: 1, guests_per_room: { adults: 2, children: 1, infants: 0 } }
    ],
    special_requests: "Late check-out if possible, high floor preferred",
    budget_range: { min_budget: 150, max_budget: 250 },
    status: OfferStatus.PENDING,
    expires_at: "2024-08-10T10:00:00Z",
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-08-01T10:00:00Z",
    hotel: { name: "Grand Resort Sorrento" },
    travel_agent: { company_name: "Elite Travel Co.", user: { full_name: "Sarah Johnson" } }
  },
  {
    id: "incoming2",
    travel_agent_id: "ta2",
    hotel_id: "h2",
    dmc_agent_id: "dmc1",
    check_in_date: "2024-11-10",
    check_out_date: "2024-11-15",
    guests: { adults: 4, children: 0, infants: 0 },
    room_requirements: [
      { room_type: "Executive Suite", quantity: 2, guests_per_room: { adults: 2, children: 0, infants: 0 } }
    ],
    special_requests: "Connecting rooms preferred, early check-in requested",
    budget_range: { min_budget: 300, max_budget: 500 },
    status: OfferStatus.PENDING,
    expires_at: "2024-08-08T15:00:00Z",
    created_at: "2024-07-30T15:30:00Z",
    updated_at: "2024-07-30T15:30:00Z",
    hotel: { name: "Hotel Poseidon" },
    travel_agent: { company_name: "Dream Vacations", user: { full_name: "Michael Chen" } }
  },
  {
    id: "incoming3",
    travel_agent_id: "ta3",
    hotel_id: "h1",
    dmc_agent_id: "dmc1",
    check_in_date: "2024-10-05",
    check_out_date: "2024-10-12",
    guests: { adults: 6, children: 2, infants: 0 },
    room_requirements: [
      { room_type: "Family Suite", quantity: 2, guests_per_room: { adults: 3, children: 1, infants: 0 } }
    ],
    status: OfferStatus.QUOTED,
    quote: {
      room_breakdown: [
        { room_type: "Family Suite", quantity: 2, nights: 7, rate_per_night: 420, total_cost: 5880 }
      ],
      total_cost: 5880,
      currency: "EUR",
      inclusions: ["Breakfast", "WiFi", "Kids club", "Airport transfer"],
      exclusions: ["City tax", "Personal expenses"],
      payment_terms: "30% deposit, balance 7 days before arrival",
      cancellation_policy: "Free cancellation up to 14 days",
      valid_until: "2024-08-12T23:59:59Z",
      additional_notes: "Complimentary room upgrade subject to availability"
    },
    expires_at: "2024-08-12T23:59:59Z",
    created_at: "2024-07-25T09:45:00Z",
    updated_at: "2024-07-26T14:20:00Z",
    hotel: { name: "Grand Resort Sorrento" },
    travel_agent: { company_name: "Family Adventures", user: { full_name: "Lisa Rodriguez" } }
  },
  {
    id: "incoming4",
    travel_agent_id: "ta4",
    hotel_id: "h3",
    dmc_agent_id: "dmc1",
    check_in_date: "2024-09-20",
    check_out_date: "2024-09-25",
    guests: { adults: 2, children: 0, infants: 0 },
    room_requirements: [
      { room_type: "Honeymoon Suite", quantity: 1, guests_per_room: { adults: 2, children: 0, infants: 0 } }
    ],
    special_requests: "Champagne and flowers for anniversary celebration",
    status: OfferStatus.ACCEPTED,
    quote: {
      room_breakdown: [
        { room_type: "Honeymoon Suite", quantity: 1, nights: 5, rate_per_night: 380, total_cost: 1900 }
      ],
      total_cost: 1900,
      currency: "EUR",
      inclusions: ["Breakfast", "WiFi", "Spa credit", "Anniversary package"],
      exclusions: ["City tax"],
      payment_terms: "Full payment at booking",
      cancellation_policy: "Free cancellation up to 3 days",
      valid_until: "2024-08-01T23:59:59Z"
    },
    created_at: "2024-07-18T16:30:00Z",
    updated_at: "2024-07-20T11:15:00Z",
    hotel: { name: "Hotel Bellavista" },
    travel_agent: { company_name: "Romantic Getaways", user: { full_name: "Anna Thompson" } }
  }
];

export default function IncomingOffersPage() {
  const { user } = useAuth();
  const { 
    incomingOffers, 
    isLoadingIncomingOffers, 
    offerStats,
    setIncomingOffers,
    setLoadingIncomingOffers,
    setOfferStats 
  } = useOfferStore();

  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Load incoming offers
    setLoadingIncomingOffers(true);
    setTimeout(() => {
      setIncomingOffers(mockIncomingOffers);
      setLoadingIncomingOffers(false);
    }, 1000);

    // Load stats
    setOfferStats({
      total_offers: mockIncomingOffers.length,
      pending_offers: mockIncomingOffers.filter(o => o.status === OfferStatus.PENDING).length,
      quoted_offers: mockIncomingOffers.filter(o => o.status === OfferStatus.QUOTED).length,
      accepted_offers: mockIncomingOffers.filter(o => o.status === OfferStatus.ACCEPTED).length,
      conversion_rate: 85
    });
  }, []);

  const filterOffersByStatus = (status?: OfferStatus) => {
    if (!status) return incomingOffers;
    return incomingOffers.filter(offer => offer.status === status);
  };

  const handleProvideQuote = async (offerId: string) => {
    // For demo, redirect to quote form
    window.location.href = `/incoming-offers/${offerId}/quote`;
  };

  const handleViewDetails = (offerId: string) => {
    window.location.href = `/incoming-offers/${offerId}`;
  };

  const handleMessage = (offerId: string) => {
    const offer = incomingOffers.find(o => o.id === offerId);
    if (offer) {
      window.location.href = `/messages?agent=${offer.travel_agent_id}&offer=${offerId}`;
    }
  };

  const getTabCount = (status?: OfferStatus) => {
    return filterOffersByStatus(status).length;
  };

  const renderOffersList = (offers: typeof incomingOffers) => {
    if (isLoadingIncomingOffers) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (offers.length === 0) {
      return (
        <EmptyState
          icon={Inbox}
          title="No requests found"
          description="Quote requests from travel agents will appear here. Make sure your hotels are active and visible."
          action={{
            label: "Manage Hotels",
            onClick: () => window.location.href = "/hotels",
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
            userType="dmc_agent"
            onProvideQuote={handleProvideQuote}
            onViewDetails={handleViewDetails}
            onMessage={handleMessage}
            isLoading={actionLoading === offer.id}
          />
        ))}
      </div>
    );
  };

  const urgentOffers = incomingOffers.filter(offer => 
    offer.status === OfferStatus.PENDING && 
    offer.expires_at && 
    new Date(offer.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <PageHeader
          title="Incoming Requests"
          description="Manage quote requests from travel agents for your hotels."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard/dmc-agent" },
            { label: "Incoming Requests" },
          ]}
          action={
            <Button asChild>
              <a href="/hotels">
                <Plus className="mr-2 h-4 w-4" />
                Manage Hotels
              </a>
            </Button>
          }
        />

        {/* Urgent Requests Alert */}
        {urgentOffers.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">
                      {urgentOffers.length} urgent request{urgentOffers.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-orange-700">
                      These requests expire within 24 hours
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setActiveTab("pending")}>
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
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
              <p className="text-xs text-muted-foreground">Awaiting your quotes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quoted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.quoted_offers || 0}</div>
              <p className="text-xs text-muted-foreground">Waiting for response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offerStats?.conversion_rate || 0}%</div>
              <p className="text-xs text-muted-foreground">Quotes accepted</p>
            </CardContent>
          </Card>
        </div>

        {/* Offers Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {getTabCount()}
              </Badge>
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="all" className="space-y-6">
            {renderOffersList(filterOffersByStatus())}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}