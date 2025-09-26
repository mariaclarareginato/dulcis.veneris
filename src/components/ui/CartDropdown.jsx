"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CartDropdown() {
    const router = useRouter(); 

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Chocolate Amargo", quantity: 2, price: 12.5 },
    { id: 2, name: "Trufa de Morango", quantity: 1, price: 8.0 },
  ]);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Abrir carrinho</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {cartItems.length === 0 ? (
          <DropdownMenuItem disabled>Sem nada no seu carrinho</DropdownMenuItem>
        ) : (
          <>
            {cartItems.map((item) => (
              <DropdownMenuItem key={item.id} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="font-bold flex justify-between border-t mt-1 pt-1">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </DropdownMenuItem>
            <DropdownMenuItem  onClick={() => router.push("/carrinho")} className="text-center text-gray-900 justify-center bg-red-400 cursor-pointer border-red border-red-2px">
              Vizualizar carrinho
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
