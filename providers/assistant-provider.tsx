"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type AssistantContextType = {
  isOpen: boolean;
  isMobileOpen: boolean;
  openMobilePanel: () => void;
  closeMobilePanel: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleChat: () => void;
};

const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined
);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openMobilePanel = () => setIsMobileOpen(true);
  const closeMobilePanel = () => setIsMobileOpen(false);
  const setMobileOpen = (open: boolean) => setIsMobileOpen(open);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        isMobileOpen,
        openMobilePanel,
        closeMobilePanel,
        setMobileOpen,
        toggleChat,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error("useAssistant must be used within AssistantProvider");
  }
  return context;
}
