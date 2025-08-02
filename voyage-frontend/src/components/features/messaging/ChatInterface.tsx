"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: "travel_agent" | "dmc_agent";
  content: string;
  timestamp: string;
  message_type: "text" | "file" | "image";
  file_url?: string;
  file_name?: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    company: string;
    type: "travel_agent" | "dmc_agent";
    is_online: boolean;
    last_seen?: string;
  }>;
  messages: Message[];
  related_offer_id?: string;
  related_booking_id?: string;
  created_at: string;
  updated_at: string;
}

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserType: "travel_agent" | "dmc_agent";
  onSendMessage: (content: string, type?: "text" | "file") => Promise<void>;
  onMarkAsRead: (messageIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInterface({
  conversation,
  currentUserId,
  currentUserType,
  onSendMessage,
  onMarkAsRead,
  isLoading
}: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Mark unread messages as read
    const unreadMessages = conversation.messages
      .filter(msg => !msg.is_read && msg.sender_id !== currentUserId)
      .map(msg => msg.id);
    
    if (unreadMessages.length > 0) {
      onMarkAsRead(unreadMessages);
    }
  }, [conversation.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const content = messageInput.trim();
    setMessageInput("");
    
    try {
      await onSendMessage(content, "text");
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageInput(content); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // In a real app, you'd upload the file and get a URL
      await onSendMessage(`Shared file: ${file.name}`, "file");
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender_id === currentUserId;
    const showAvatar = !isOwn;

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 mb-4",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        {showAvatar && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="text-xs">
              {getInitials(message.sender_name)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
          {!isOwn && (
            <p className="text-xs text-muted-foreground">{message.sender_name}</p>
          )}
          
          <div
            className={cn(
              "rounded-lg px-3 py-2 break-words",
              isOwn
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            )}
          >
            {message.message_type === "text" && (
              <p className="text-sm">{message.content}</p>
            )}
            
            {message.message_type === "file" && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{message.file_name || message.content}</span>
              </div>
            )}
            
            {message.message_type === "image" && (
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">{message.file_name || "Image"}</span>
              </div>
            )}
          </div>
          
          <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", isOwn && "justify-end")}>
            <span>{format(new Date(message.timestamp), "HH:mm")}</span>
            {isOwn && (
              message.is_read ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Clock className="h-3 w-3" />
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <CardHeader className="flex-none border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {otherParticipant ? getInitials(otherParticipant.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherParticipant?.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">{otherParticipant?.company}</p>
                <Badge variant="outline" className="text-xs">
                  {otherParticipant?.type === "travel_agent" ? "Travel Agent" : "DMC Agent"}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  otherParticipant?.is_online ? "bg-green-500" : "bg-gray-400"
                )} />
                <span className="text-xs text-muted-foreground">
                  {otherParticipant?.is_online 
                    ? "Online" 
                    : otherParticipant?.last_seen 
                      ? `Last seen ${format(new Date(otherParticipant.last_seen), "MMM dd, HH:mm")}`
                      : "Offline"
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Context Information */}
      {(conversation.related_offer_id || conversation.related_booking_id) && (
        <div className="flex-none px-4 py-2 bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {conversation.related_offer_id && (
              <span>Related to Offer #{conversation.related_offer_id}</span>
            )}
            {conversation.related_booking_id && (
              <span>Related to Booking #{conversation.related_booking_id}</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation with {otherParticipant?.name}
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map(renderMessage)}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="text-xs">
                    {otherParticipant ? getInitials(otherParticipant.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="flex-none p-4">
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}