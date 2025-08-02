"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layouts/MainLayout";
import { AnimatedPage } from "@/components/ui/animated-page";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedList } from "@/components/ui/animated-list";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  Search, 
  Globe, 
  Users, 
  Shield, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Building2,
  Briefcase
} from "lucide-react";

const featuredDestinations = [
  {
    name: "Santa Caterina",
    country: "Italy", 
    image: "/api/placeholder/300/200",
    hotels: 24,
  },
  {
    name: "Le Sirenus",
    country: "Greece",
    image: "/api/placeholder/300/200", 
    hotels: 18,
  },
  {
    name: "Sorrento",
    country: "Italy",
    image: "/api/placeholder/300/200",
    hotels: 32,
  },
  {
    name: "Barcelona",
    country: "Spain", 
    image: "/api/placeholder/300/200",
    hotels: 45,
  },
];

const featuredAgents = [
  {
    name: "Yiannis Mercourou",
    title: "Luxury Travel Specialist",
    location: "Sorrento",
    rating: 4.8,
    reviews: 32,
    specializations: ["Italy", "Luxury Hotels"],
    verified: true,
  },
  {
    name: "Sarah Collins", 
    title: "Mediterranean Expert",
    location: "Greece",
    rating: 4.6,
    reviews: 21,
    specializations: ["Greece", "Island Resorts"],
    verified: true,
  },
  {
    name: "David Meyer",
    title: "European Travel Pro",
    location: "Spain", 
    rating: 4.0,
    reviews: 48,
    specializations: ["Spain", "Cultural Tours"],
    verified: true,
  },
];

const features = [
  {
    icon: Search,
    title: "Smart Hotel Search",
    description: "Find the perfect accommodations with our advanced filtering and intelligent matching system.",
  },
  {
    icon: Users,
    title: "Verified DMC Network", 
    description: "Connect with trusted destination management companies worldwide, all thoroughly vetted.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Book with confidence using our secure payment system and comprehensive booking protection.",
  },
  {
    icon: Clock,
    title: "Real-time Communication",
    description: "Instant messaging and notifications keep all parties connected throughout the booking process.",
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <MainLayout>
      <AnimatedPage>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="mobile-container mobile-padding md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 sm:mb-6">
              Welcome to the future of travel bookings
            </Badge>
            <h1 className="mb-4 sm:mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
              <span className="font-serif text-primary">Book easily</span>
              <br />
              with DMC agents
            </h1>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg text-muted-foreground md:text-xl leading-relaxed">
              Connect travel agents with destination management companies worldwide. 
              Streamline your hotel bookings with our professional platform.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
                <AnimatedButton size="lg" asChild className="w-full sm:w-auto touch-friendly">
                  <Link href="/auth/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </AnimatedButton>
                <AnimatedButton size="lg" variant="outline" asChild className="w-full sm:w-auto touch-friendly">
                  <Link href="/browse-dmcs">Browse DMC Agents</Link>
                </AnimatedButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
                <AnimatedButton size="lg" asChild className="w-full sm:w-auto touch-friendly">
                  <Link href={user?.user_type === "travel_agent" ? "/dashboard/travel-agent" : "/dashboard/dmc-agent"}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </AnimatedButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mobile-padding md:py-24">
        <div className="mobile-container">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
            <h2 className="mb-4 heading-responsive font-bold tracking-tight">
              Why Choose Voyage?
            </h2>
            <p className="text-responsive text-muted-foreground">
              Our platform streamlines the connection between travel professionals and destination experts.
            </p>
          </div>
          
          <AnimatedList className="grid-responsive-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={index} className="text-center">
                <CardHeader className="card-responsive">
                  <div className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="card-responsive pt-0">
                  <CardDescription className="text-responsive leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </AnimatedCard>
            ))}
          </AnimatedList>
        </div>
      </section>

      {/* Agent of the Week */}
      <section className="mobile-padding bg-muted/30">
        <div className="mobile-container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8 sm:mb-12">
              <Badge variant="secondary" className="mb-4">Agent of the Week</Badge>
              <h2 className="heading-responsive font-bold tracking-tight">
                Destination Experts
              </h2>
            </div>
            
            <AnimatedList className="grid-responsive gap-4 sm:gap-6">
              {featuredAgents.map((agent, index) => (
                <AnimatedCard key={index} className="relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {agent.name}
                          {agent.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription>{agent.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{agent.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm font-medium">{agent.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {agent.reviews} reviews
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.specializations.map((spec, specIndex) => (
                        <Badge key={specIndex} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <AnimatedButton className="w-full touch-friendly" variant="outline">
                      Message
                    </AnimatedButton>
                  </CardContent>
                </AnimatedCard>
              ))}
            </AnimatedList>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="mobile-padding md:py-24">
        <div className="mobile-container">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12">
            <h2 className="mb-4 heading-responsive font-bold tracking-tight">
              Popular Destinations
            </h2>
            <p className="text-responsive text-muted-foreground">
              Discover amazing destinations with our network of local experts.
            </p>
          </div>
          
          <AnimatedList className="grid-responsive-4 gap-4 sm:gap-6">
            {featuredDestinations.map((destination, index) => (
              <AnimatedCard key={index} className="overflow-hidden group cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-semibold text-white">{destination.name}</h3>
                    <p className="text-sm text-white/80">{destination.country}</p>
                  </div>
                </div>
                <CardContent className="card-responsive">
                  <p className="text-sm text-muted-foreground">
                    {destination.hotels} hotels available
                  </p>
                </CardContent>
              </AnimatedCard>
            ))}
          </AnimatedList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mobile-padding md:py-24 bg-primary">
        <div className="mobile-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 heading-responsive font-bold tracking-tight text-white">
              Ready to Connect?
            </h2>
            <p className="mb-6 sm:mb-8 text-responsive text-primary-foreground/80">
              Join thousands of travel professionals using Voyage to streamline their bookings.
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
              <AnimatedButton size="lg" variant="secondary" asChild className="w-full sm:w-auto touch-friendly">
                <Link href="/auth/register?type=travel_agent">
                  <Briefcase className="mr-2 h-4 w-4" />
                  I&apos;m a Travel Agent
                </Link>
              </AnimatedButton>
              <AnimatedButton size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary touch-friendly" asChild>
                <Link href="/auth/register?type=dmc_agent">
                  <Building2 className="mr-2 h-4 w-4" />
                  I&apos;m a DMC Agent
                </Link>
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>
      </AnimatedPage>
    </MainLayout>
  );
}
