"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHotelStore } from "@/stores/hotelStore";
import { useOfferStore } from "@/stores/offerStore";
import { useBookingStore } from "@/stores/bookingStore";
import { 
  Plus, 
  FileText, 
  Building2, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { OfferStatus, BookingStatus } from "@/types";

export default function DMCAgentDashboard() {
  const { user } = useAuth();
  const { 
    myHotels, 
    isLoadingMyHotels,
    setMyHotels,
    setLoadingMyHotels 
  } = useHotelStore();
  const { 
    incomingOffers, 
    isLoadingIncomingOffers,
    offerStats,
    setIncomingOffers,
    setLoadingIncomingOffers,
    setOfferStats 
  } = useOfferStore();
  const { 
    hotelBookings, 
    isLoadingHotelBookings,
    bookingStats,
    setHotelBookings,
    setLoadingHotelBookings,
    setBookingStats
  } = useBookingStore();

  // Mock data - replace with real API calls
  useEffect(() => {
    // Load my hotels
    setLoadingMyHotels(true);
    setTimeout(() => {
      setMyHotels([
        {
          id: "h1",
          dmc_agent_id: "dmc1",
          name: "Grand Resort Sorrento",
          description: "Luxury oceanfront resort",
          address: "Via Marina Piccola 15",
          city: "Sorrento",
          country: "Italy",
          star_rating: 5,
          amenities: ["Pool", "Spa", "Restaurant", "WiFi"],
          images: [],
          room_types: [],
          policies: {
            check_in_time: "15:00",
            check_out_time: "11:00",
            cancellation_policy: "Free cancellation up to 24 hours",
            payment_terms: "Pay at property"
          },
          contact_info: {
            phone: "+39 081 878 1024",
            email: "info@grandresortsorrento.com"
          },
          is_active: true,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-08-01T14:30:00Z"
        },
        {
          id: "h2",
          dmc_agent_id: "dmc1", 
          name: "Hotel Poseidon",
          description: "Charming boutique hotel",
          address: "Via Correale 15",
          city: "Sorrento",
          country: "Italy",
          star_rating: 4,
          amenities: ["Restaurant", "WiFi", "Terrace"],
          images: [],
          room_types: [],
          policies: {
            check_in_time: "14:00",
            check_out_time: "12:00",
            cancellation_policy: "Free cancellation up to 48 hours",
            payment_terms: "Advance payment required"
          },
          contact_info: {
            phone: "+39 081 878 2020",
            email: "info@hotelposeidon.com"
          },
          is_active: true,
          created_at: "2024-02-20T09:00:00Z",
          updated_at: "2024-07-28T16:15:00Z"
        }
      ]);
      setLoadingMyHotels(false);
    }, 800);

    // Load incoming offers
    setLoadingIncomingOffers(true);
    setTimeout(() => {
      setIncomingOffers([
        {
          id: "o1",
          travel_agent_id: "ta1",
          hotel_id: "h1",
          dmc_agent_id: "dmc1",
          check_in_date: "2024-12-20",
          check_out_date: "2024-12-25",
          guests: { adults: 2, children: 1, infants: 0 },
          room_requirements: [],
          status: OfferStatus.PENDING,
          created_at: "2024-08-01T10:00:00Z",
          updated_at: "2024-08-01T10:00:00Z",
          hotel: { name: "Grand Resort Sorrento" },
          travel_agent: { 
            company_name: "Elite Travel Co.",
            user: { full_name: "Sarah Johnson" }
          }
        },
        {
          id: "o2",
          travel_agent_id: "ta2", 
          hotel_id: "h2",
          dmc_agent_id: "dmc1",
          check_in_date: "2024-11-10",
          check_out_date: "2024-11-15",
          guests: { adults: 4, children: 0, infants: 0 },
          room_requirements: [],
          status: OfferStatus.PENDING,
          created_at: "2024-07-30T15:30:00Z",
          updated_at: "2024-07-30T15:30:00Z",
          hotel: { name: "Hotel Poseidon" },
          travel_agent: {
            company_name: "Dream Vacations",
            user: { full_name: "Michael Chen" }
          }
        }
      ]);
      setLoadingIncomingOffers(false);
    }, 1000);

    // Load hotel bookings
    setLoadingHotelBookings(true);
    setTimeout(() => {
      setHotelBookings([
        {
          id: "b1",
          offer_id: "o_prev1",
          travel_agent_id: "ta1",
          dmc_agent_id: "dmc1",
          hotel_id: "h1",
          guest_details: {
            primary_guest: { name: "Emma Thompson", email: "emma@example.com", phone: "+44 20 7946 0958" },
            additional_guests: []
          },
          status: BookingStatus.CONFIRMED,
          confirmation_number: "VG78901",
          total_amount: 2500,
          currency: "EUR",
          payment_status: "paid" as any,
          created_at: "2024-07-25T14:20:00Z",
          updated_at: "2024-07-25T14:20:00Z",
          hotel: { name: "Grand Resort Sorrento" },
          travel_agent: {
            company_name: "Elite Travel Co.",
            user: { full_name: "Sarah Johnson" }
          },
          offer: { check_in_date: "2024-09-10", check_out_date: "2024-09-15" }
        }
      ]);
      setLoadingHotelBookings(false);
    }, 1200);

    // Load stats
    setOfferStats({
      total_offers: 18,
      pending_offers: 2,
      quoted_offers: 6,
      accepted_offers: 10,
      conversion_rate: 85
    });

    setBookingStats({
      total_bookings: 12,
      confirmed_bookings: 11,
      cancelled_bookings: 1,
      total_revenue: 28400,
      monthly_revenue: 8200
    });
  }, []);

  const recentOffers = incomingOffers.slice(0, 5);
  const recentBookings = hotelBookings.slice(0, 5);
  const featuredHotels = myHotels.slice(0, 3);

  const offerColumns = [
    {
      key: "travel_agent.company_name",
      header: "Travel Agent",
      render: (offer: any) => (
        <div>
          <div className="font-medium">{offer.travel_agent?.user?.full_name}</div>
          <div className="text-sm text-muted-foreground">
            {offer.travel_agent?.company_name}
          </div>
        </div>
      ),
    },
    {
      key: "hotel.name",
      header: "Hotel",
      render: (offer: any) => (
        <div className="font-medium">{offer.hotel?.name}</div>
      ),
    },
    {
      key: "check_in_date",
      header: "Dates",
      render: (offer: any) => (
        <div className="text-sm">
          {format(new Date(offer.check_in_date), "MMM dd")} - {format(new Date(offer.check_out_date), "MMM dd, yyyy")}
        </div>
      ),
    },
    {
      key: "guests",
      header: "Guests",
      render: (offer: any) => (
        <div className="text-sm">
          {offer.guests.adults} adults
          {offer.guests.children > 0 && `, ${offer.guests.children} children`}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (offer: any) => {
        const statusConfig = {
          [OfferStatus.PENDING]: { label: "Pending", variant: "secondary" as const, icon: Clock },
          [OfferStatus.QUOTED]: { label: "Quoted", variant: "default" as const, icon: FileText },
          [OfferStatus.ACCEPTED]: { label: "Accepted", variant: "default" as const, icon: CheckCircle },
          [OfferStatus.REJECTED]: { label: "Rejected", variant: "destructive" as const, icon: AlertCircle },
          [OfferStatus.EXPIRED]: { label: "Expired", variant: "outline" as const, icon: AlertCircle },
        };
        const config = statusConfig[offer.status] || statusConfig[OfferStatus.PENDING];
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
  ];

  const bookingColumns = [
    {
      key: "confirmation_number",
      header: "Confirmation",
      render: (booking: any) => (
        <div className="font-mono text-sm">{booking.confirmation_number}</div>
      ),
    },
    {
      key: "guest_details.primary_guest.name",
      header: "Guest",
      render: (booking: any) => (
        <div>
          <div className="font-medium">{booking.guest_details?.primary_guest?.name}</div>
          <div className="text-sm text-muted-foreground">
            via {booking.travel_agent?.company_name}
          </div>
        </div>
      ),
    },
    {
      key: "hotel.name",
      header: "Hotel",
      render: (booking: any) => (
        <div className="text-sm">{booking.hotel?.name}</div>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (booking: any) => (
        <div className="font-medium">
          €{booking.total_amount?.toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking: any) => {
        const statusConfig = {
          [BookingStatus.CONFIRMED]: { label: "Confirmed", variant: "default" as const },
          [BookingStatus.CANCELLED]: { label: "Cancelled", variant: "destructive" as const },
          [BookingStatus.COMPLETED]: { label: "Completed", variant: "secondary" as const },
        };
        const config = statusConfig[booking.status] || statusConfig[BookingStatus.CONFIRMED];
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
  ];

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <PageHeader
          title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Agent'}!`}
          description="Manage your hotel inventory and respond to travel agent requests."
          action={
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/hotels/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hotel
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/incoming-offers">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Requests
                </Link>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="My Hotels"
            value={myHotels.length}
            icon={Building2}
            trend={{
              value: 2,
              label: "new this month",
              isPositive: true,
            }}
          />
          <StatsCard
            title="Pending Requests"
            value={offerStats?.pending_offers || 0}
            icon={Clock}
            description="Awaiting your response"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${offerStats?.conversion_rate || 0}%`}
            icon={TrendingUp}
            trend={{
              value: 5,
              label: "from last month",
              isPositive: true,
            }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`€${bookingStats?.monthly_revenue?.toLocaleString() || 0}`}
            icon={DollarSign}
            trend={{
              value: 22,
              label: "from last month",
              isPositive: true,
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Incoming Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Incoming Requests</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/incoming-offers">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOffers.length > 0 ? (
                <DataTable
                  data={recentOffers}
                  columns={offerColumns}
                  loading={isLoadingIncomingOffers}
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No requests yet"
                  description="Travel agents will send quote requests for your hotels. Make sure your hotel listings are active."
                  action={{
                    label: "Add Hotel",
                    onClick: () => window.location.href = "/hotels/new",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/hotel-bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <DataTable
                  data={recentBookings}
                  columns={bookingColumns}
                  loading={isLoadingHotelBookings}
                />
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No bookings yet"
                  description="Confirmed bookings for your hotels will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Hotels */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Hotels</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/hotels">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {featuredHotels.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {featuredHotels.map((hotel) => (
                  <Card key={hotel.id} className="overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative">
                      <div className="absolute top-2 right-2">
                        <Badge variant={hotel.is_active ? "default" : "secondary"}>
                          {hotel.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center space-x-1 mb-1">
                          {Array.from({ length: hotel.star_rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{hotel.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {hotel.city}, {hotel.country}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{hotel.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="No hotels added yet"
                description="Add your first hotel to start receiving booking requests from travel agents."
                action={{
                  label: "Add Hotel",
                  onClick: () => window.location.href = "/hotels/new",
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}