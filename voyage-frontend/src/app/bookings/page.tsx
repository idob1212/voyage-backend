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
import { BookingCard } from "@/components/features/bookings/BookingCard";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { Booking, BookingStatus, PaymentStatus } from "@/types";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Search,
  FileText,
  Download
} from "lucide-react";
import { toast } from "sonner";

// Mock bookings data
const mockBookings: (Booking & {
  hotel: { name: string; city: string; country: string };
  dmc_agent: { company_name: string; user: { full_name: string; email: string } };
  offer: { check_in_date: string; check_out_date: string };
})[] = [
  {
    id: "booking1",
    offer_id: "offer1",
    travel_agent_id: "ta1",
    dmc_agent_id: "dmc1",
    hotel_id: "h1",
    guest_details: {
      primary_guest: {
        name: "Emma Thompson",
        email: "emma.thompson@email.com",
        phone: "+44 20 7946 0958"
      },
      additional_guests: [
        { name: "James Thompson", age: 45 },
        { name: "Sophie Thompson", age: 12 }
      ]
    },
    status: BookingStatus.CONFIRMED,
    confirmation_number: "VG78901",
    total_amount: 2500,
    currency: "EUR",
    payment_status: PaymentStatus.PAID,
    special_requests: "Late check-out requested, high floor preferred",
    created_at: "2024-07-25T14:20:00Z",
    updated_at: "2024-07-25T14:20:00Z",
    hotel: { name: "Hilton Prague", city: "Prague", country: "Czech Republic" },
    dmc_agent: { 
      company_name: "TravelWays Prague", 
      user: { full_name: "Aaron Becker", email: "aaron@travelways.com" } 
    },
    offer: { check_in_date: "2024-12-20", check_out_date: "2024-12-25" }
  },
  {
    id: "booking2",
    offer_id: "offer2",
    travel_agent_id: "ta1",
    dmc_agent_id: "dmc2",
    hotel_id: "h2",
    guest_details: {
      primary_guest: {
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+1 555 123 4567"
      },
      additional_guests: []
    },
    status: BookingStatus.CONFIRMED,
    confirmation_number: "VG89012",
    total_amount: 3200,
    currency: "EUR",
    payment_status: PaymentStatus.PAID,
    special_requests: "Champagne and flowers for anniversary",
    created_at: "2024-07-18T09:30:00Z",
    updated_at: "2024-07-18T09:30:00Z",
    hotel: { name: "Grand Hotel Sorrento", city: "Sorrento", country: "Italy" },
    dmc_agent: { 
      company_name: "Mediterranean Dreams", 
      user: { full_name: "Yiannis Mercourou", email: "yiannis@meddreams.com" } 
    },
    offer: { check_in_date: "2024-11-15", check_out_date: "2024-11-20" }
  },
  {
    id: "booking3",
    offer_id: "offer3",
    travel_agent_id: "ta1",
    dmc_agent_id: "dmc3",
    hotel_id: "h3",
    guest_details: {
      primary_guest: {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 555 987 6543"
      },
      additional_guests: [
        { name: "David Johnson", age: 42 }
      ]
    },
    status: BookingStatus.COMPLETED,
    confirmation_number: "VG90123",
    total_amount: 1800,
    currency: "EUR",
    payment_status: PaymentStatus.PAID,
    created_at: "2024-06-10T16:45:00Z",
    updated_at: "2024-06-20T12:00:00Z",
    hotel: { name: "Hotel Poseidon", city: "Sorrento", country: "Italy" },
    dmc_agent: { 
      company_name: "Amalfi Coast Experts", 
      user: { full_name: "Marco Rossi", email: "marco@amalfiexperts.com" } 
    },
    offer: { check_in_date: "2024-06-15", check_out_date: "2024-06-20" }
  },
  {
    id: "booking4",
    offer_id: "offer4",
    travel_agent_id: "ta1",
    dmc_agent_id: "dmc4",
    hotel_id: "h4",
    guest_details: {
      primary_guest: {
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@email.com",
        phone: "+34 91 123 4567"
      },
      additional_guests: []
    },
    status: BookingStatus.CANCELLED,
    confirmation_number: "VG01234",
    total_amount: 2200,
    currency: "EUR",
    payment_status: PaymentStatus.REFUNDED,
    special_requests: "Dietary restrictions: vegetarian meals",
    created_at: "2024-07-01T11:15:00Z",
    updated_at: "2024-07-05T14:30:00Z",
    hotel: { name: "Hotel Barcelona Center", city: "Barcelona", country: "Spain" },
    dmc_agent: { 
      company_name: "Catalonia Travel", 
      user: { full_name: "Carlos Martinez", email: "carlos@catalonia.com" } 
    },
    offer: { check_in_date: "2024-08-10", check_out_date: "2024-08-15" }
  }
];

export default function BookingsPage() {
  const { user } = useAuth();
  const { 
    myBookings, 
    isLoadingMyBookings, 
    bookingStats,
    setMyBookings,
    setLoadingMyBookings,
    setBookingStats 
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Load bookings
    setLoadingMyBookings(true);
    setTimeout(() => {
      setMyBookings(mockBookings);
      setLoadingMyBookings(false);
    }, 1000);

    // Load stats
    setBookingStats({
      total_bookings: mockBookings.length,
      confirmed_bookings: mockBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      cancelled_bookings: mockBookings.filter(b => b.status === BookingStatus.CANCELLED).length,
      total_revenue: mockBookings.reduce((sum, b) => sum + b.total_amount, 0),
      monthly_revenue: mockBookings
        .filter(b => new Date(b.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, b) => sum + b.total_amount, 0)
    });
  }, []);

  const filterBookingsByStatus = (status?: BookingStatus) => {
    if (!status) return myBookings;
    return myBookings.filter(booking => booking.status === status);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Booking cancelled", {
        description: "The booking has been cancelled and refund will be processed.",
      });
      
      // Update local state
      const updatedBookings = myBookings.map(booking =>
        booking.id === bookingId 
          ? { ...booking, status: BookingStatus.CANCELLED, payment_status: PaymentStatus.REFUNDED }
          : booking
      );
      setMyBookings(updatedBookings);
    } catch (error) {
      toast.error("Failed to cancel booking", {
        description: "Please try again later or contact support.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadConfirmation = async (bookingId: string) => {
    try {
      // Simulate PDF generation
      toast.success("Downloading confirmation", {
        description: "Your booking confirmation PDF is being generated.",
      });
      
      // In a real app, this would trigger a PDF download
      console.log(`Downloading confirmation for booking: ${bookingId}`);
    } catch (error) {
      toast.error("Failed to download confirmation", {
        description: "Please try again later.",
      });
    }
  };

  const handleMessage = (bookingId: string) => {
    const booking = myBookings.find(b => b.id === bookingId);
    if (booking) {
      window.location.href = `/messages?agent=${booking.dmc_agent_id}&booking=${bookingId}`;
    }
  };

  const handleViewDetails = (bookingId: string) => {
    window.location.href = `/bookings/${bookingId}`;
  };

  const getTabCount = (status?: BookingStatus) => {
    return filterBookingsByStatus(status).length;
  };

  const renderBookingsList = (bookings: typeof myBookings) => {
    if (isLoadingMyBookings) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="Your confirmed bookings will appear here once you accept quotes from DMC agents."
          action={{
            label: "Search Hotels",
            onClick: () => window.location.href = "/search",
          }}
        />
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            userType="travel_agent"
            onCancel={handleCancelBooking}
            onDownloadConfirmation={handleDownloadConfirmation}
            onMessage={handleMessage}
            onViewDetails={handleViewDetails}
            isLoading={actionLoading === booking.id}
          />
        ))}
      </div>
    );
  };

  const upcomingBookings = myBookings.filter(booking => 
    booking.status === BookingStatus.CONFIRMED &&
    booking.offer?.check_in_date &&
    new Date(booking.offer.check_in_date) > new Date()
  );

  return (
    <MainLayout>
      <div className="space-responsive">
        <PageHeader
          title="My Bookings"
          description="Manage your confirmed bookings and travel arrangements."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard/travel-agent" },
            { label: "Bookings" },
          ]}
          action={
            <Button asChild>
              <a href="/search">
                <Search className="mr-2 h-4 w-4" />
                Book More Hotels
              </a>
            </Button>
          }
        />

        {/* Upcoming Bookings Alert */}
        {upcomingBookings.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {upcomingBookings.length} upcoming booking{upcomingBookings.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-blue-700">
                      Don&apos;t forget to prepare travel documents
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setActiveTab("confirmed")}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid-responsive-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingStats?.total_bookings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingStats?.confirmed_bookings || 0}</div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{bookingStats?.total_revenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{bookingStats?.monthly_revenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export All Bookings
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Monthly Report
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Upcoming Itinerary
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {getTabCount()}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              Confirmed
              <Badge variant="secondary" className="ml-1">
                {getTabCount(BookingStatus.CONFIRMED)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Completed
              <Badge variant="secondary" className="ml-1">
                {getTabCount(BookingStatus.COMPLETED)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-3 w-3" />
              Cancelled
              <Badge variant="secondary" className="ml-1">
                {getTabCount(BookingStatus.CANCELLED)}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {renderBookingsList(filterBookingsByStatus())}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-6">
            {renderBookingsList(filterBookingsByStatus(BookingStatus.CONFIRMED))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {renderBookingsList(filterBookingsByStatus(BookingStatus.COMPLETED))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {renderBookingsList(filterBookingsByStatus(BookingStatus.CANCELLED))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}