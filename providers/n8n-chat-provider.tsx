"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type N8nChatContextType = {
  isOpen: boolean;
  isMobileOpen: boolean;
  openMobilePanel: () => void;
  closeMobilePanel: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleChat: () => void;
};

const N8nChatContext = createContext<N8nChatContextType | undefined>(
  undefined
);

export function N8nChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openMobilePanel = () => setIsMobileOpen(true);
  const closeMobilePanel = () => setIsMobileOpen(false);
  const setMobileOpen = (open: boolean) => setIsMobileOpen(open);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <N8nChatContext.Provider
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
    </N8nChatContext.Provider>
  );
}

export function useN8nChat() {
  const context = useContext(N8nChatContext);
  if (context === undefined) {
    throw new Error("useN8nChat must be used within N8nChatProvider");
  }
  return context;
}
