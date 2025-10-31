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

// Função fetcher padrão para o SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export function CartDropdown() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  // Carrega usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // Busca automática do carrinho com SWR
  const { data, error, mutate } = useSWR(
    userData
      ? `/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`
      : null,
    fetcher,
    {
      refreshInterval: 5000, // atualiza automaticamente a cada 5s
      revalidateOnFocus: true, // atualiza ao voltar para a aba
    }
  );

  const carrinho = data?.itens || [];

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
        {!data ? (
          <DropdownMenuItem disabled className="px-4 py-2">
            Carregando carrinho...
          </DropdownMenuItem>
        ) : carrinho.length === 0 ? (
          <DropdownMenuItem disabled className="px-4 py-2">
            Seu carrinho está vazio
          </DropdownMenuItem>
        ) : (
          <>
            {carrinho.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex justify-between text-md px-4 py-2 border-t"
              >
                <span className=" w-full">
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
