"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getLoggedUser } from "@/lib/auth-client";

export function CartDropdown() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [carrinho, setCarrinho] = useState([]);

  // Carrega usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // Busca carrinho
  const fetchCarrinho = async () => {
    if (!userData) return;
    try {
      const res = await fetch(
        `/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`
      );
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho", err);
    }
  };

  useEffect(() => {
    if (userData) fetchCarrinho();
  }, [userData]);

  const total = carrinho.reduce(
    (acc, item) => acc + (item.produto?.preco_venda || 0) * item.quantidade,
    0
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto max-w-sm sm:max-w-sm">
        {carrinho.length === 0 ? (
          <DropdownMenuItem disabled>Seu carrinho está vazio</DropdownMenuItem>
        ) : (
          <>
            {carrinho.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex justify-between text-md"
              >
                <span className="w-full">{item.produto?.nome} x {item.quantidade}</span>
                <span> R$ {((item.produto?.preco_venda || 0) * item.quantidade).toFixed(2)}
                </span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem className="font-bold flex justify-between border-t mt-2 pt-5">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Button
                onClick={() => router.push("/carrinho")}
                className="w-full bg-red-800 text-white hover:bg-red-700"
              >
                Visualizar carrinho
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
