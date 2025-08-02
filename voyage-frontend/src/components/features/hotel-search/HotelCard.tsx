"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Utensils, 
  Waves,
  CheckCircle,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { Hotel } from "@/types";
import { cn } from "@/lib/utils";

interface HotelCardProps {
  hotel: Hotel & { 
    dmc_agent?: { 
      company_name: string; 
      is_verified: boolean;
      user?: { full_name: string };
    } 
  };
  onRequestQuote?: (hotelId: string) => void;
  onContactDMC?: (agentId: string) => void;
  isRequestingQuote?: boolean;
}

const amenityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "Pool": Waves,
  "Parking": Car,
  "Restaurant": Utensils,
  "Spa": Star,
  "Fitness Center": Star,
  "Bar": Utensils,
  "Room Service": Utensils,
  "Business Center": Star,
  "Pet Friendly": Star,
  "Airport Shuttle": Car,
  "Air Conditioning": Star,
  "Beach Access": Waves,
  "Conference Facilities": Star,
};

export function HotelCard({ 
  hotel, 
  onRequestQuote, 
  onContactDMC, 
  isRequestingQuote 
}: HotelCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getAmenityIcon = (amenity: string) => {
    const Icon = amenityIcons[amenity] || Star;
    return <Icon className="h-3 w-3" />;
  };

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(hotel.id);
    }
  };

  const handleContactDMC = () => {
    if (onContactDMC && hotel.dmc_agent_id) {
      onContactDMC(hotel.dmc_agent_id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Hotel Images */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5">
        {hotel.images && hotel.images.length > 0 ? (
          <div className="relative w-full h-full">
            <img 
              src={hotel.images[currentImageIndex]} 
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            {hotel.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {hotel.images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentImageIndex ? "bg-white" : "bg-white/60"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-2xl font-bold">{hotel.name.charAt(0)}</div>
              <div className="text-sm opacity-80">No Image</div>
            </div>
          </div>
        )}
        
        {/* Star Rating Overlay */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center space-x-1 bg-black/70 rounded-full px-2 py-1">
            {Array.from({ length: hotel.star_rating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Hotel Status */}
        <div className="absolute top-3 right-3">
          <Badge variant={hotel.is_active ? "default" : "secondary"}>
            {hotel.is_active ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{hotel.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {hotel.city}, {hotel.country}
              </div>
            </div>
          </div>

          {/* DMC Agent Info */}
          {hotel.dmc_agent && (
            <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(hotel.dmc_agent.company_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-medium truncate">
                    {hotel.dmc_agent.company_name}
                  </p>
                  {hotel.dmc_agent.is_verified && (
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
                </div>
                {hotel.dmc_agent.user?.full_name && (
                  <p className="text-xs text-muted-foreground">
                    {hotel.dmc_agent.user.full_name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Hotel Description */}
        {hotel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {hotel.description}
          </p>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.slice(0, 6).map((amenity, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs flex items-center gap-1"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </Badge>
              ))}
              {hotel.amenities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{hotel.amenities.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Room Types Preview */}
        {hotel.room_types && hotel.room_types.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Room Types:</p>
            <div className="flex flex-wrap gap-1">
              {hotel.room_types.slice(0, 3).map((room, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {room.name}
                </Badge>
              ))}
              {hotel.room_types.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{hotel.room_types.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleRequestQuote}
            disabled={!hotel.is_active || isRequestingQuote}
            className="flex-1"
          >
            {isRequestingQuote ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                Requesting...
              </>
            ) : (
              "Request Quote"
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleContactDMC}
            disabled={!hotel.dmc_agent_id}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.open(`/hotels/${hotel.id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Contact Info */}
        {hotel.contact_info && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            {hotel.contact_info.phone && (
              <p>📞 {hotel.contact_info.phone}</p>
            )}
            {hotel.contact_info.email && (
              <p>✉️ {hotel.contact_info.email}</p>
            )}
            {hotel.contact_info.website && (
              <p>
                🌐 <a 
                  href={hotel.contact_info.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Website
                </a>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}