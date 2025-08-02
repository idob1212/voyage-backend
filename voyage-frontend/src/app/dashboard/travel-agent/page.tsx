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
import { useOfferStore } from "@/stores/offerStore";
import { useBookingStore } from "@/stores/bookingStore";
import { 
  Search, 
  Plus, 
  FileText, 
  Calendar, 
  Users,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { OfferStatus, BookingStatus } from "@/types";

export default function TravelAgentDashboard() {
  const { user } = useAuth();
  const { 
    myOffers, 
    isLoadingMyOffers, 
    offerStats,
    setMyOffers,
    setLoadingMyOffers,
    setOfferStats 
  } = useOfferStore();
  const { 
    myBookings, 
    isLoadingMyBookings,
    bookingStats,
    setMyBookings,
    setLoadingMyBookings,
    setBookingStats
  } = useBookingStore();

  // Mock data - replace with real API calls
  useEffect(() => {
    // Load recent offers
    setLoadingMyOffers(true);
    setTimeout(() => {
      setMyOffers([
        {
          id: "1",
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
          hotel: { name: "Hilton Prague", city: "Prague", country: "Czech Republic" }
        },
        {
          id: "2", 
          travel_agent_id: "ta1",
          hotel_id: "h2",
          dmc_agent_id: "dmc2",
          check_in_date: "2024-11-15",
          check_out_date: "2024-11-20",
          guests: { adults: 4, children: 0, infants: 0 },
          room_requirements: [],
          status: OfferStatus.QUOTED,
          created_at: "2024-07-28T14:30:00Z",
          updated_at: "2024-07-29T09:15:00Z",
          hotel: { name: "Hotel Sorrento", city: "Sorrento", country: "Italy" }
        }
      ]);
      setLoadingMyOffers(false);
    }, 1000);

    // Load recent bookings
    setLoadingMyBookings(true);
    setTimeout(() => {
      setMyBookings([
        {
          id: "b1",
          offer_id: "1",
          travel_agent_id: "ta1",
          dmc_agent_id: "dmc1", 
          hotel_id: "h1",
          guest_details: {
            primary_guest: { name: "John Smith", email: "john@example.com", phone: "+1234567890" },
            additional_guests: []
          },
          status: BookingStatus.CONFIRMED,
          confirmation_number: "VG12345",
          total_amount: 1200,
          currency: "USD",
          payment_status: "paid" as any,
          created_at: "2024-07-25T12:00:00Z",
          updated_at: "2024-07-25T12:00:00Z",
          hotel: { name: "Grand Hotel", city: "Paris", country: "France" },
          offer: { check_in_date: "2024-09-15", check_out_date: "2024-09-20" }
        }
      ]);
      setLoadingMyBookings(false);
    }, 1200);

    // Load stats
    setOfferStats({
      total_offers: 12,
      pending_offers: 3,
      quoted_offers: 4,
      accepted_offers: 5,
      conversion_rate: 75
    });

    setBookingStats({
      total_bookings: 8,
      confirmed_bookings: 7,
      cancelled_bookings: 1,
      total_revenue: 15600,
      monthly_revenue: 4200
    });
  }, []);

  const recentOffers = myOffers.slice(0, 5);
  const recentBookings = myBookings.slice(0, 5);

  const offerColumns = [
    {
      key: "hotel.name",
      header: "Hotel",
      render: (offer: any) => (
        <div>
          <div className="font-medium">{offer.hotel?.name}</div>
          <div className="text-sm text-muted-foreground">
            {offer.hotel?.city}, {offer.hotel?.country}
          </div>
        </div>
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
      key: "hotel.name",
      header: "Hotel",
      render: (booking: any) => (
        <div>
          <div className="font-medium">{booking.hotel?.name}</div>
          <div className="text-sm text-muted-foreground">
            {booking.hotel?.city}, {booking.hotel?.country}
          </div>
        </div>
      ),
    },
    {
      key: "guest_details.primary_guest.name",
      header: "Guest",
      render: (booking: any) => (
        <div className="text-sm">{booking.guest_details?.primary_guest?.name}</div>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (booking: any) => (
        <div className="font-medium">
          ${booking.total_amount?.toLocaleString()} {booking.currency}
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
          description="Manage your hotel quotes and bookings from your dashboard."
          action={
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Hotels
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/offers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={offerStats?.total_offers || 0}
            icon={FileText}
            trend={{
              value: 12,
              label: "from last month",
              isPositive: true,
            }}
          />
          <StatsCard
            title="Pending Quotes"
            value={offerStats?.pending_offers || 0}
            icon={Clock}
            description="Awaiting DMC response"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${offerStats?.conversion_rate || 0}%`}
            icon={TrendingUp}
            trend={{
              value: 8,
              label: "from last month",
              isPositive: true,
            }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${bookingStats?.monthly_revenue?.toLocaleString() || 0}`}
            icon={Users}
            trend={{
              value: 15,
              label: "from last month",
              isPositive: true,
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Quote Requests</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/offers">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOffers.length > 0 ? (
                <DataTable
                  data={recentOffers}
                  columns={offerColumns}
                  loading={isLoadingMyOffers}
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No requests yet"
                  description="Start by searching for hotels and requesting quotes from DMC agents."
                  action={{
                    label: "Search Hotels",
                    onClick: () => window.location.href = "/search",
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
                <Link href="/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentBookings.length > 0 ? (
                <DataTable
                  data={recentBookings}
                  columns={bookingColumns}
                  loading={isLoadingMyBookings}
                />
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No bookings yet"
                  description="Your confirmed bookings will appear here once you accept quotes."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                <Link href="/search">
                  <div className="flex items-center space-x-3">
                    <Search className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Search Hotels</div>
                      <div className="text-sm text-muted-foreground">Find perfect accommodations</div>
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                <Link href="/browse-dmcs">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Browse DMCs</div>
                      <div className="text-sm text-muted-foreground">Discover local experts</div>
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 justify-start" asChild>
                <Link href="/messages">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Messages</div>
                      <div className="text-sm text-muted-foreground">Chat with DMC agents</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}