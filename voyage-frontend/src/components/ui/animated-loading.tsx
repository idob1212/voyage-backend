"use client";

import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";
import { getAnimationPreferences } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedLoadingProps {
  type?: "spinner" | "skeleton" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function AnimatedLoading({ 
  type = "spinner", 
  size = "md", 
  className, 
  label = "Loading" 
}: AnimatedLoadingProps) {
  const shouldAnimate = getAnimationPreferences();

  if (type === "spinner") {
    return <LoadingSpinner size={size} className={className} label={label} />;
  }

  if (type === "skeleton") {
    return <SkeletonLoader size={size} className={className} />;
  }

  if (type === "pulse") {
    return <PulseLoader size={size} className={className} />;
  }

  return null;
}

interface SkeletonLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  lines?: number;
}

export function SkeletonLoader({ size = "md", className, lines = 3 }: SkeletonLoaderProps) {
  const shouldAnimate = getAnimationPreferences();

  const sizeClasses = {
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
  };

  const skeletonVariants = {
    loading: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className={cn("space-y-2", className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "bg-muted rounded",
            sizeClasses[size],
            index === lines - 1 ? "w-3/4" : "w-full"
          )}
          variants={shouldAnimate ? skeletonVariants : undefined}
          animate={shouldAnimate ? "loading" : undefined}
          style={{
            animationDelay: shouldAnimate ? `${index * 0.1}s` : undefined,
          }}
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
}

interface PulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseLoader({ size = "md", className }: PulseLoaderProps) {
  const shouldAnimate = getAnimationPreferences();

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const pulseVariants = {
    loading: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className={cn("flex space-x-1", className)} role="status" aria-label="Loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          className={cn("bg-primary rounded-full", sizeClasses[size])}
          variants={shouldAnimate ? pulseVariants : undefined}
          animate={shouldAnimate ? "loading" : undefined}
          style={{
            animationDelay: shouldAnimate ? `${index * 0.2}s` : undefined,
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

interface LoadingSkeletonCardProps {
  className?: string;
}

export function LoadingSkeletonCard({ className }: LoadingSkeletonCardProps) {
  const shouldAnimate = getAnimationPreferences();

  const skeletonVariants = {
    loading: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-muted rounded-full"
            variants={shouldAnimate ? skeletonVariants : undefined}
            animate={shouldAnimate ? "loading" : undefined}
          />
          <div className="space-y-2 flex-1">
            <motion.div
              className="h-4 bg-muted rounded w-1/3"
              variants={shouldAnimate ? skeletonVariants : undefined}
              animate={shouldAnimate ? "loading" : undefined}
              style={{ animationDelay: "0.1s" }}
            />
            <motion.div
              className="h-3 bg-muted rounded w-1/4"
              variants={shouldAnimate ? skeletonVariants : undefined}
              animate={shouldAnimate ? "loading" : undefined}
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <motion.div
            className="h-4 bg-muted rounded w-full"
            variants={shouldAnimate ? skeletonVariants : undefined}
            animate={shouldAnimate ? "loading" : undefined}
            style={{ animationDelay: "0.3s" }}
          />
          <motion.div
            className="h-4 bg-muted rounded w-5/6"
            variants={shouldAnimate ? skeletonVariants : undefined}
            animate={shouldAnimate ? "loading" : undefined}
            style={{ animationDelay: "0.4s" }}
          />
          <motion.div
            className="h-4 bg-muted rounded w-3/4"
            variants={shouldAnimate ? skeletonVariants : undefined}
            animate={shouldAnimate ? "loading" : undefined}
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Button skeleton */}
        <motion.div
          className="h-10 bg-muted rounded w-24"
          variants={shouldAnimate ? skeletonVariants : undefined}
          animate={shouldAnimate ? "loading" : undefined}
          style={{ animationDelay: "0.6s" }}
        />
      </div>
    </Card>
  );
}