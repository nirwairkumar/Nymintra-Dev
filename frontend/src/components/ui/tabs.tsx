"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (v: string) => void;
} | null>(null);

export function Tabs({ defaultValue, className, children, onValueChange }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  const handleValueChange = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value, setValue: handleValueChange }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      onClick={() => context?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative",
        isActive ? "text-foreground" : "hover:text-foreground/80",
        className
      )}
    >
      {isActive && (
        <motion.div
           layoutId="active-tab"
           className="absolute inset-0 bg-background rounded shadow-sm -z-0"
           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
    >
      {children}
    </motion.div>
  );
}
