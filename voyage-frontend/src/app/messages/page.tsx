"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChatInterface } from "@/components/features/messaging/ChatInterface";
import { useAuth } from "@/lib/hooks/useAuth";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Users,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock conversations data
const mockConversations = [
  {
    id: "conv1",
    participants: [
      {
        id: "ta1",
        name: "Sarah Johnson",
        company: "Elite Travel Co.",
        type: "travel_agent" as const,
        is_online: true
      },
      {
        id: "dmc1",
        name: "Aaron Becker",
        company: "TravelWays Prague",
        type: "dmc_agent" as const,
        is_online: false,
        last_seen: "2024-08-02T10:30:00Z"
      }
    ],
    messages: [
      {
        id: "msg1",
        sender_id: "ta1",
        sender_name: "Sarah Johnson",
        sender_type: "travel_agent" as const,
        content: "Hi Aaron! I have a client interested in your Hilton Prague for December 20-25. Can we discuss rates?",
        timestamp: "2024-08-02T09:00:00Z",
        message_type: "text" as const,
        is_read: true
      },
      {
        id: "msg2",
        sender_id: "dmc1",
        sender_name: "Aaron Becker",
        sender_type: "dmc_agent" as const,
        content: "Hello Sarah! Absolutely, I'd be happy to help. For those dates, I can offer a special rate. Let me prepare a detailed quote for you.",
        timestamp: "2024-08-02T09:15:00Z",
        message_type: "text" as const,
        is_read: true
      },
      {
        id: "msg3",
        sender_id: "ta1",
        sender_name: "Sarah Johnson",
        sender_type: "travel_agent" as const,
        content: "Perfect! They're looking for 2 adults and 1 child. Would prefer a room with city view if possible.",
        timestamp: "2024-08-02T09:20:00Z",
        message_type: "text" as const,
        is_read: false
      }
    ],
    related_offer_id: "offer1",
    created_at: "2024-08-02T09:00:00Z",
    updated_at: "2024-08-02T09:20:00Z"
  },
  {
    id: "conv2",
    participants: [
      {
        id: "ta1",
        name: "Michael Chen",
        company: "Dream Vacations",
        type: "travel_agent" as const,
        is_online: true
      },
      {
        id: "dmc2",
        name: "Yiannis Mercourou",
        company: "Mediterranean Dreams",
        type: "dmc_agent" as const,
        is_online: true
      }
    ],
    messages: [
      {
        id: "msg4",
        sender_id: "ta1",
        sender_name: "Michael Chen",
        sender_type: "travel_agent" as const,
        content: "Thank you for the excellent service! My clients loved the hotel. Looking forward to more bookings.",
        timestamp: "2024-08-01T16:45:00Z",
        message_type: "text" as const,
        is_read: true
      },
      {
        id: "msg5",
        sender_id: "dmc2",
        sender_name: "Yiannis Mercourou",
        sender_type: "dmc_agent" as const,
        content: "Wonderful to hear! I'm always here to help. Feel free to reach out for any future bookings in Sorrento.",
        timestamp: "2024-08-01T17:00:00Z",
        message_type: "text" as const,
        is_read: true
      }
    ],
    related_booking_id: "booking2",
    created_at: "2024-07-28T14:30:00Z",
    updated_at: "2024-08-01T17:00:00Z"
  },
  {
    id: "conv3",
    participants: [
      {
        id: "ta2",
        name: "Lisa Rodriguez",
        company: "Family Adventures",
        type: "travel_agent" as const,
        is_online: false,
        last_seen: "2024-08-01T14:20:00Z"
      },
      {
        id: "dmc3",
        name: "Marco Rossi",
        company: "Amalfi Coast Experts",
        type: "dmc_agent" as const,
        is_online: false,
        last_seen: "2024-08-01T18:30:00Z"
      }
    ],
    messages: [
      {
        id: "msg6",
        sender_id: "ta2",
        sender_name: "Lisa Rodriguez",
        sender_type: "travel_agent" as const,
        content: "Hi Marco, do you have availability for a family of 6 in October? Looking for connecting rooms.",
        timestamp: "2024-08-01T14:00:00Z",
        message_type: "text" as const,
        is_read: true
      }
    ],
    created_at: "2024-08-01T14:00:00Z",
    updated_at: "2024-08-01T14:00:00Z"
  }
];

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preselectedAgent = searchParams.get("agent");
  const relatedOffer = searchParams.get("offer");
  const relatedBooking = searchParams.get("booking");

  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-select conversation based on URL params
    if (preselectedAgent) {
      const conv = conversations.find(c => 
        c.participants.some(p => p.id === preselectedAgent)
      );
      if (conv) {
        setSelectedConversation(conv.id);
      }
    } else if (conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [preselectedAgent, conversations]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id);
  };

  const getUnreadCount = (conversation: any) => {
    return conversation.messages.filter((msg: any) => 
      !msg.is_read && msg.sender_id !== user?.id
    ).length;
  };

  const getLastMessage = (conversation: any) => {
    return conversation.messages[conversation.messages.length - 1];
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = async (conversationId: string, content: string, type = "text") => {
    if (!user) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender_id: user.id,
      sender_name: user.full_name,
      sender_type: user.user_type as "travel_agent" | "dmc_agent",
      content,
      timestamp: new Date().toISOString(),
      message_type: type as "text" | "file",
      is_read: false
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            updated_at: new Date().toISOString()
          }
        : conv
    ));

    // Simulate API call
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (conversationId: string, messageIds: string[]) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
            )
          }
        : conv
    ));
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const totalUnread = conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0);

  return (
    <MainLayout>
      <div className="space-responsive">
        <PageHeader
          title="Messages"
          description="Communicate with DMC agents and travel professionals."
          breadcrumbs={[
            { label: "Dashboard", href: user?.user_type === "travel_agent" ? "/dashboard/travel-agent" : "/dashboard/dmc-agent" },
            { label: "Messages" },
          ]}
          action={
            <Button className="touch-friendly">
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          }
        />

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-3 h-[500px] sm:h-[600px] lg:h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-none">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversations
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="rounded-full px-2 py-1 text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0">
                {filteredConversations.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={MessageSquare}
                      title="No conversations"
                      description="Start a conversation with DMC agents or travel professionals."
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const lastMessage = getLastMessage(conversation);
                      const unreadCount = getUnreadCount(conversation);
                      const isSelected = selectedConversation === conversation.id;

                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={cn(
                            "p-4 cursor-pointer transition-colors border-b hover:bg-muted/50",
                            isSelected && "bg-muted"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {otherParticipant ? getInitials(otherParticipant.name) : "?"}
                                </AvatarFallback>
                              </Avatar>
                              {otherParticipant?.is_online && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                  {otherParticipant?.name}
                                </p>
                                <div className="flex items-center gap-1">
                                  {unreadCount > 0 && (
                                    <Badge variant="destructive" className="rounded-full px-2 py-1 text-xs">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                  {lastMessage && (
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(lastMessage.timestamp), "HH:mm")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                {otherParticipant?.company}
                              </p>

                              {lastMessage && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {lastMessage.sender_id === user?.id ? "You: " : ""}
                                  {lastMessage.content}
                                </p>
                              )}

                              {/* Context badges */}
                              <div className="flex gap-1">
                                {conversation.related_offer_id && (
                                  <Badge variant="outline" className="text-xs">
                                    Offer #{conversation.related_offer_id}
                                  </Badge>
                                )}
                                {conversation.related_booking_id && (
                                  <Badge variant="outline" className="text-xs">
                                    Booking #{conversation.related_booking_id}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedConv && user ? (
              <ChatInterface
                conversation={selectedConv}
                currentUserId={user.id}
                currentUserType={user.user_type as "travel_agent" | "dmc_agent"}
                onSendMessage={(content, type) => handleSendMessage(selectedConv.id, content, type)}
                onMarkAsRead={(messageIds) => handleMarkAsRead(selectedConv.id, messageIds)}
                isLoading={isLoading}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnread}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {conversations.filter(c => 
                  getOtherParticipant(c)?.is_online
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}