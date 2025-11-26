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
import useSWR from "swr";
import { getLoggedUser } from "@/lib/auth-client";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function CartDropdown() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  const { data, error, mutate } = useSWR(
    userData
      ? `/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`
      : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  const carrinho = data?.itens || [];

  const total = carrinho.reduce(
    (acc, item) => acc + (item.produto?.preco_venda || 0) * item.quantidade,
    0
  );

  // Remover do carrinho
  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      mutate(); // Atualiza o SWR
    } catch (err) {
      console.error(err);
      alert("Erro ao remover item");
    }
  };

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
        {!data ? (
          <DropdownMenuItem disabled className="px-4 py-2 font-semibold text-lg">
            Carregando carrinho...
          </DropdownMenuItem>
        ) : carrinho.length === 0 ? (
          <DropdownMenuItem disabled className="px-4 py-2 font-semibold text-lg">
            Seu carrinho está vazio
          </DropdownMenuItem>
        ) : (
          <>
            {carrinho.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex flex-col border-t px-4 py-2"
              >
                <div className="flex justify-between items-center w-full">
                   
                  <span>
                    {item.produto?.nome} x {item.quantidade}
                  </span>
                  <span className="font-bold px-4">
                    R$ {((item.produto?.preco_venda || 0) * item.quantidade).toFixed(2)}
                  </span>
                       <Button
                  variant="destructive"
                  size="sm"
                  className="m-5 w-5 h-5 flex"
                  onClick={() => removerDoCarrinho(item.id)}
                >
                  X
                </Button>
                </div>
          
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem className="font-extrabold flex justify-between border-t mt-2 pt-2 px-4">
              <span>Total:</span>
              <span className="text-2xl">R$ {total.toFixed(2)}</span>
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
