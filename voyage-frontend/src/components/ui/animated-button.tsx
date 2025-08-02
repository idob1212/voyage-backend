"use client";

import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { buttonVariants, getAnimationPreferences } from "@/lib/animations";
import { forwardRef } from "react";

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  enableAnimations?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, enableAnimations = true, ...props }, ref) => {
    const shouldAnimate = getAnimationPreferences() && enableAnimations;

    if (!shouldAnimate) {
      return (
        <Button ref={ref} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        <Button ref={ref} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";