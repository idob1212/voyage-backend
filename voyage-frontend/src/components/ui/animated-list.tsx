"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, getAnimationPreferences } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}

export function AnimatedList({ children, className, stagger = true }: AnimatedListProps) {
  const shouldAnimate = getAnimationPreferences();

  if (!shouldAnimate || !stagger) {
    return <div className={className}>{children}</div>;
  }

  const childrenArray = React.Children.toArray(children);

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          custom={index}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function AnimatedListItem({ children, className, index = 0 }: AnimatedListItemProps) {
  const shouldAnimate = getAnimationPreferences();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerItem}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}