"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings, HelpCircle, Menu, X } from "lucide-react";
import { UserType } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return user.user_type === UserType.TRAVEL_AGENT 
      ? "/dashboard/travel-agent"
      : "/dashboard/dmc-agent";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mobile-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="font-serif text-xl sm:text-2xl font-bold text-primary">
            Voyage
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden touch-friendly"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                href={getDashboardLink()}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              {user?.user_type === UserType.TRAVEL_AGENT && (
                <>
                  <Link
                    href="/search"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Search Hotels
                  </Link>
                  <Link
                    href="/offers"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    My Offers
                  </Link>
                  <Link
                    href="/bookings"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Bookings
                  </Link>
                </>
              )}
              {user?.user_type === UserType.DMC_AGENT && (
                <>
                  <Link
                    href="/hotels"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    My Hotels
                  </Link>
                  <Link
                    href="/incoming-offers"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Incoming Offers
                  </Link>
                  <Link
                    href="/hotel-bookings"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Hotel Bookings
                  </Link>
                </>
              )}
              <Link
                href="/messages"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Messages
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/browse-dmcs"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Browse DMCs
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggleSimple />
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="mobile-container py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.user_type === UserType.TRAVEL_AGENT && (
                  <>
                    <Link
                      href="/search"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Search Hotels
                    </Link>
                    <Link
                      href="/offers"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Offers
                    </Link>
                    <Link
                      href="/bookings"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bookings
                    </Link>
                  </>
                )}
                {user?.user_type === UserType.DMC_AGENT && (
                  <>
                    <Link
                      href="/hotels"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Hotels
                    </Link>
                    <Link
                      href="/incoming-offers"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Incoming Offers
                    </Link>
                    <Link
                      href="/hotel-bookings"
                      className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Hotel Bookings
                    </Link>
                  </>
                )}
                <Link
                  href="/messages"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                
                {/* Mobile Auth Section */}
                {user && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <ThemeToggleSimple />
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/browse-dmcs"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse DMCs
                </Link>
                <Link
                  href="/how-it-works"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors touch-friendly"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggleSimple />
                  </div>
                  <Button variant="ghost" size="sm" asChild className="w-full justify-start touch-friendly">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full touch-friendly">
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}