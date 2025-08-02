"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Calendar, 
  Users, 
  MapPin, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  DollarSign,
  MessageSquare,
  Eye
} from "lucide-react";
import { Offer, OfferStatus } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: Offer & {
    hotel?: { name: string; city: string; country: string };
    dmc_agent?: { company_name: string; user: { full_name: string } };
    travel_agent?: { company_name: string; user: { full_name: string } };
  };
  userType: "travel_agent" | "dmc_agent";
  onAccept?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onProvideQuote?: (offerId: string) => void;
  onViewDetails?: (offerId: string) => void;
  onMessage?: (offerId: string) => void;
  isLoading?: boolean;
}

export function OfferCard({ 
  offer, 
  userType, 
  onAccept, 
  onReject, 
  onProvideQuote, 
  onViewDetails, 
  onMessage,
  isLoading 
}: OfferCardProps) {
  const getStatusConfig = (status: OfferStatus) => {
    const configs = {
      [OfferStatus.PENDING]: { 
        label: "Pending", 
        variant: "secondary" as const, 
        icon: Clock,
        color: "text-yellow-600 bg-yellow-50 border-yellow-200"
      },
      [OfferStatus.QUOTED]: { 
        label: "Quoted", 
        variant: "default" as const, 
        icon: FileText,
        color: "text-blue-600 bg-blue-50 border-blue-200"
      },
      [OfferStatus.ACCEPTED]: { 
        label: "Accepted", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600 bg-green-50 border-green-200"
      },
      [OfferStatus.REJECTED]: { 
        label: "Rejected", 
        variant: "destructive" as const, 
        icon: AlertCircle,
        color: "text-red-600 bg-red-50 border-red-200"
      },
      [OfferStatus.EXPIRED]: { 
        label: "Expired", 
        variant: "outline" as const, 
        icon: AlertCircle,
        color: "text-gray-600 bg-gray-50 border-gray-200"
      },
    };
    return configs[status] || configs[OfferStatus.PENDING];
  };

  const statusConfig = getStatusConfig(offer.status);
  const StatusIcon = statusConfig.icon;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isExpiringSoon = offer.expires_at && 
    new Date(offer.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-md",
      offer.status === OfferStatus.PENDING && "border-l-4 border-l-primary"
    )}>
      {/* Status Header */}
      <div className={cn("px-4 py-2 border-b", statusConfig.color)}>
        <div className="flex items-center justify-between">
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          
          {isExpiringSoon && offer.status === OfferStatus.QUOTED && (
            <Badge variant="destructive" className="text-xs">
              Expires Soon
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Hotel Information */}
          {offer.hotel && (
            <div>
              <CardTitle className="text-lg">{offer.hotel.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {offer.hotel.city}, {offer.hotel.country}
              </div>
            </div>
          )}

          {/* Agent Information */}
          {userType === "travel_agent" && offer.dmc_agent && (
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(offer.dmc_agent.company_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{offer.dmc_agent.company_name}</p>
                <p className="text-xs text-muted-foreground">
                  {offer.dmc_agent.user.full_name}
                </p>
              </div>
            </div>
          )}

          {userType === "dmc_agent" && offer.travel_agent && (
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(offer.travel_agent.company_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{offer.travel_agent.company_name}</p>
                <p className="text-xs text-muted-foreground">
                  {offer.travel_agent.user.full_name}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stay Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Check-in</span>
            </div>
            <p>{format(new Date(offer.check_in_date), "MMM dd, yyyy")}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Check-out</span>
            </div>
            <p>{format(new Date(offer.check_out_date), "MMM dd, yyyy")}</p>
          </div>
        </div>

        <Separator />

        {/* Guest Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Guests</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {offer.guests.adults} adults
            {offer.guests.children > 0 && `, ${offer.guests.children} children`}
            {offer.guests.infants > 0 && `, ${offer.guests.infants} infants`}
          </p>
        </div>

        {/* Room Requirements */}
        {offer.room_requirements && offer.room_requirements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Room Requirements</span>
            </div>
            <div className="space-y-1">
              {offer.room_requirements.map((req, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {req.quantity}x {req.room_type}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Budget Range */}
        {offer.budget_range && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Budget Range</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ${offer.budget_range.min_budget} - ${offer.budget_range.max_budget}
            </p>
          </div>
        )}

        {/* Special Requests */}
        {offer.special_requests && (
          <div className="space-y-2">
            <span className="font-medium text-sm">Special Requests</span>
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {offer.special_requests}
            </p>
          </div>
        )}

        {/* Quote Information */}
        {offer.quote && (
          <div className="space-y-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Quote Provided</span>
              <div className="text-lg font-bold text-green-700">
                ${offer.quote.total_cost} {offer.quote.currency}
              </div>
            </div>
            
            {offer.quote.valid_until && (
              <p className="text-xs text-muted-foreground">
                Valid until: {format(new Date(offer.quote.valid_until), "MMM dd, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {offer.notes && (
          <div className="space-y-2">
            <span className="font-medium text-sm">Notes</span>
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {offer.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Travel Agent Actions */}
          {userType === "travel_agent" && (
            <>
              {offer.status === OfferStatus.QUOTED && (
                <>
                  <Button 
                    onClick={() => onAccept?.(offer.id)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Accept Quote
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onReject?.(offer.id)}
                    disabled={isLoading}
                  >
                    Reject
                  </Button>
                </>
              )}
              
              {offer.status === OfferStatus.PENDING && (
                <Button 
                  variant="outline"
                  onClick={() => onViewDetails?.(offer.id)}
                  className="flex-1"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Awaiting Quote
                </Button>
              )}
            </>
          )}

          {/* DMC Agent Actions */}
          {userType === "dmc_agent" && (
            <>
              {offer.status === OfferStatus.PENDING && (
                <Button 
                  onClick={() => onProvideQuote?.(offer.id)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Provide Quote
                </Button>
              )}
              
              {offer.status === OfferStatus.QUOTED && (
                <Button 
                  variant="outline"
                  onClick={() => onViewDetails?.(offer.id)}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Quote
                </Button>
              )}
            </>
          )}

          {/* Common Actions */}
          <Button 
            variant="outline"
            size="icon"
            onClick={() => onViewDetails?.(offer.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => onMessage?.(offer.id)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Created Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Created: {format(new Date(offer.created_at), "MMM dd, yyyy 'at' HH:mm")}
        </div>
      </CardContent>
    </Card>
  );
}