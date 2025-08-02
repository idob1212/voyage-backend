"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trapFocus, handleEscapeKey } from "@/lib/accessibility";
import { cn } from "@/lib/utils";

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md"
}: AccessibleModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  // Trap focus and handle escape key
  React.useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const cleanupFocus = trapFocus(modalRef.current);
    const cleanupEscape = handleEscapeKey(onClose);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      cleanupFocus();
      cleanupEscape();
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] mobile-container">
        <div
          ref={modalRef}
          className={cn(
            "bg-background border rounded-lg shadow-lg p-6 mx-auto",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="touch-friendly"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}