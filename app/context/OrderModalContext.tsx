"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import OrderModal from "@/components/order/OrderModal";
import type { OrderItem } from "@/types/checkout";

interface ModalContextType {
  openOrderModal: (items: OrderItem[], userId?: string) => void;
  closeOrderModal: () => void;
}

const OrderModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(OrderModalContext);
  if (!context) {
    throw new Error("useModal must be used within OrderModalProvider");
  }
  return context;
}

export function OrderModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [userId, setUserId] = useState<string | undefined>();

  const openOrderModal = (modalItems: OrderItem[], modalUserId?: string) => {
    setItems(modalItems);
    setUserId(modalUserId);
    setIsOpen(true);
  };

  const closeOrderModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setItems([]);
      setUserId(undefined);
    }, 300);
  };

  return (
    <OrderModalContext.Provider value={{ openOrderModal, closeOrderModal }}>
      {children}
      <OrderModal isOpen={isOpen} onClose={closeOrderModal} items={items} userId={userId} />
    </OrderModalContext.Provider>
  );
}
