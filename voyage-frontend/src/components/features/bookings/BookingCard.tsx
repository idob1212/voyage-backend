"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Phone,
  Mail,
  Download,
  MessageSquare
} from "lucide-react";
import { Booking, BookingStatus, PaymentStatus } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking & {
    hotel?: { name: string; city: string; country: string };
    travel_agent?: { company_name: string; user: { full_name: string; email: string } };
    dmc_agent?: { company_name: string; user: { full_name: string; email: string } };
    offer?: { check_in_date: string; check_out_date: string };
  };
  userType: "travel_agent" | "dmc_agent";
  onCancel?: (bookingId: string) => void;
  onDownloadConfirmation?: (bookingId: string) => void;
  onMessage?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  isLoading?: boolean;
}

export function BookingCard({ 
  booking, 
  userType, 
  onCancel, 
  onDownloadConfirmation, 
  onMessage, 
  onViewDetails,
  isLoading 
}: BookingCardProps) {
  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      [BookingStatus.CONFIRMED]: { 
        label: "Confirmed", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200"
      },
      [BookingStatus.CANCELLED]: { 
        label: "Cancelled", 
        variant: "destructive" as const, 
        icon: XCircle,
        color: "text-red-600 bg-red-50 border-red-200"
      },
      [BookingStatus.COMPLETED]: { 
        label: "Completed", 
        variant: "secondary" as const, 
        icon: CheckCircle,
        color: "text-blue-600 bg-blue-50 border-blue-200"
      },
    };
    return configs[status] || configs[BookingStatus.CONFIRMED];
  };

  const getPaymentStatusConfig = (status: PaymentStatus) => {
    const configs = {
      [PaymentStatus.PENDING]: { 
        label: "Payment Pending", 
        variant: "secondary" as const, 
        icon: Clock 
      },
      [PaymentStatus.PAID]: { 
        label: "Paid", 
        variant: "default" as const, 
        icon: CheckCircle 
      },
      [PaymentStatus.FAILED]: { 
        label: "Payment Failed", 
        variant: "destructive" as const, 
        icon: XCircle 
      },
      [PaymentStatus.REFUNDED]: { 
        label: "Refunded", 
        variant: "outline" as const, 
        icon: CheckCircle 
      },
    };
    return configs[status] || configs[PaymentStatus.PENDING];
  };

  const statusConfig = getStatusConfig(booking.status);
  const paymentConfig = getPaymentStatusConfig(booking.payment_status);
  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canCancel = booking.status === BookingStatus.CONFIRMED && 
    booking.offer?.check_in_date && 
    new Date(booking.offer.check_in_date) > new Date();

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      {/* Status Header */}
      <div className={cn("px-4 py-2 border-b", statusConfig.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
            <Badge variant={paymentConfig.variant} className="flex items-center gap-1">
              <PaymentIcon className="h-3 w-3" />
              {paymentConfig.label}
            </Badge>
          </div>
          
          <div className="font-mono text-sm font-medium">
            {booking.confirmation_number}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Hotel Information */}
          {booking.hotel && (
            <div>
              <CardTitle className="text-lg">{booking.hotel.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {booking.hotel.city}, {booking.hotel.country}
              </div>
            </div>
          )}

          {/* Agent Information */}
          {userType === "travel_agent" && booking.dmc_agent && (
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(booking.dmc_agent.company_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{booking.dmc_agent.company_name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.dmc_agent.user.full_name}
                </p>
              </div>
            </div>
          )}

          {userType === "dmc_agent" && booking.travel_agent && (
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(booking.travel_agent.company_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{booking.travel_agent.company_name}</p>
                <p className="text-xs text-muted-foreground">
                  {booking.travel_agent.user.full_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stay Details */}
        {booking.offer && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Check-in</span>
              </div>
              <p>{format(new Date(booking.offer.check_in_date), "MMM dd, yyyy")}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Check-out</span>
              </div>
              <p>{format(new Date(booking.offer.check_out_date), "MMM dd, yyyy")}</p>
            </div>
          </div>
        )}

        <Separator />

        {/* Guest Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Primary Guest</span>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-lg space-y-2">
            <p className="font-medium">{booking.guest_details.primary_guest.name}</p>
            
            <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {booking.guest_details.primary_guest.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {booking.guest_details.primary_guest.phone}
              </div>
            </div>
          </div>

          {booking.guest_details.additional_guests && booking.guest_details.additional_guests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Additional Guests</p>
              <div className="space-y-1">
                {booking.guest_details.additional_guests.map((guest, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {guest.name} {guest.age && `(${guest.age} years)`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Booking Amount */}
        <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Total Amount</span>
          </div>
          <div className="text-lg font-bold">
            ${booking.total_amount.toLocaleString()} {booking.currency}
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="space-y-2">
            <span className="font-medium text-sm">Special Requests</span>
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {booking.special_requests}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewDetails?.(booking.id)}
            variant="outline"
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            View Details
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => onDownloadConfirmation?.(booking.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => onMessage?.(booking.id)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Cancel Button for Travel Agents */}
        {userType === "travel_agent" && canCancel && (
          <Button 
            variant="destructive"
            onClick={() => onCancel?.(booking.id)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Booking
              </>
            )}
          </Button>
        )}

        {/* Booking Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Booked: {format(new Date(booking.created_at), "MMM dd, yyyy 'at' HH:mm")}
        </div>
      </CardContent>
    </Card>
  );
}