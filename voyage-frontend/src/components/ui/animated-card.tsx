"use client";

import { motion } from "framer-motion";
import { Card, CardProps } from "@/components/ui/card";
import { cardVariants, getAnimationPreferences } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  enableHover?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  enableHover = true, 
  ...props 
}: AnimatedCardProps) {
  const shouldAnimate = getAnimationPreferences();

  if (!shouldAnimate) {
    return (
      <Card className={className} {...props}>
        {children}
      </Card>
    );
  }

  return (
    <motion.div
      variants={enableHover ? cardVariants : undefined}
      initial="rest"
      whileHover={enableHover ? "hover" : undefined}
      className={cn("cursor-pointer", className)}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
}