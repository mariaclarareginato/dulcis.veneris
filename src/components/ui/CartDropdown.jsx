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

<DropdownMenuContent
  align="end"
  className="w-64 sm:w-80 md:w-96 p-2 overflow-auto max-h-96"
>
  {carrinho.length === 0 ? (
    <DropdownMenuItem disabled className="px-4 py-2">
      Seu carrinho está vazio
    </DropdownMenuItem>
  ) : (
    <>
      {carrinho.map((item) => (
        <DropdownMenuItem
          key={item.id}
          className="flex justify-between text-md px-4 py-2"
        >
          <span className="truncate w-3/4">
            {item.produto?.nome} x {item.quantidade}
          </span>
          <span className="ml-2">
            R$ {((item.produto?.preco_venda || 0) * item.quantidade).toFixed(2)}
          </span>
        </DropdownMenuItem>
      ))}

      <DropdownMenuItem className="font-bold flex justify-between border-t mt-2 pt-2 px-4">
        <span>Total:</span>
        <span>R$ {total.toFixed(2)}</span>
      </DropdownMenuItem>

      <DropdownMenuItem className="px-4 py-2">
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
