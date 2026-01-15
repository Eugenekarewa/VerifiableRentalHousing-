"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shared states for the entire protocol
export type ProtocolStatus = 'PENDING_ADMIN' | 'VERIFIED_ACTIVE' | 'OCCUPIED' | 'COMPLETED';

export interface GlobalProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  status: ProtocolStatus;
  currentGuest?: string;
  txHash?: string;
}

interface ProtocolContextType {
  properties: GlobalProperty[];
  adminVerifyProperty: (id: string) => void;
  guestBookProperty: (id: string, guestName: string) => void;
  hostCompleteStay: (id: string) => void;
  listNewProperty: (title: string, price: number, location: string) => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const ProtocolProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<GlobalProperty[]>([
    { 
      id: '1', title: 'The Glass Horizon', price: 1250, location: 'Malibu, CA', 
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 
      status: 'VERIFIED_ACTIVE' 
    }
  ]);

  // 1. Admin Action: Approves the listing
  const adminVerifyProperty = (id: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'VERIFIED_ACTIVE' } : p));
  };

  // 2. Guest Action: Requests the stay
  const guestBookProperty = (id: string, guestName: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { 
      ...p, status: 'OCCUPIED', currentGuest: guestName, txHash: '0x' + Math.random().toString(16).slice(2, 10) 
    } : p));
  };

  // 3. Host Action: Finalizes stay and settles funds
  const hostCompleteStay = (id: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'COMPLETED' } : p));
  };

  // 4. Host Action: Creates new entry in the verification queue
  const listNewProperty = (title: string, price: number, location: string) => {
    const newProp: GlobalProperty = {
      id: Date.now().toString(),
      title, price, location,
      image: 'https://images.unsplash.com/photo-1600585154340-be6199f7a099',
      status: 'PENDING_ADMIN'
    };
    setProperties(prev => [...prev, newProp]);
  };

  return (
    <ProtocolContext.Provider value={{ properties, adminVerifyProperty, guestBookProperty, hostCompleteStay, listNewProperty }}>
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error("useProtocol must be used within ProtocolProvider");
  return context;
};