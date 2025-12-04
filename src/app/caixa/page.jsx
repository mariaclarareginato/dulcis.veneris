"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Assumindo que você tem esses componentes disponíveis (shadcn/ui ou similar)
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, AlertCircle } from "lucide-react";
import { getLoggedUser } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";

// Função utilitária para converter Decimal (string) para float formatado
const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  return num.toFixed(2);
};

export default function CaixaPage() {
  const router = useRouter();

  // Estados
  const [userData, setUserData] = useState(null);
  const [produtos, setProdutos] = useState([]); // todos os produtos retornados da API
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionandoId, setAdicionandoId] = useState(null);
  const [error, setError] = useState(null);

  // 1. Carrega usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // 2. Busca produtos da loja
  useEffect(() => {
    if (!userData) return;
    setLoading(true);

    const controller = new AbortController();

    fetch(`/api/produtos?lojaId=${userData.loja_id}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erro ao buscar produtos: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Garantir ordenação: produtos ativos com estoque primeiro, depois ativos sem estoque,
          // e inativos serão exibidos separadamente.
          const ativos = data.filter(p => p.ativo !== false); // ativo undefined or true => considered active
          const inativos = data.filter(p => p.ativo === false);

          const ordenadosAtivos = [...ativos].sort((a, b) => {
            // Coloca os com quantidade > 0 antes; se ambos >0, mantém ordem original
            if ((a.quantidade || 0) === 0 && (b.quantidade || 0) > 0) return 1;
            if ((a.quantidade || 0) > 0 && (b.quantidade || 0) === 0) return -1;
            return 0;
          });

          // Mantemos produtos no estado combinando ativos primeiro (ordenados) e inativos depois
          setProdutos([...ordenadosAtivos, ...inativos]);
        } else {
          setProdutos([]);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar produtos");
          setProdutos([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userData]);

  // 3. Busca carrinho
  const fetchCarrinho = async () => {
    if (!userData) return;
    try {
      const res = await fetch(`/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`);
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho", err);
    }
  };

  useEffect(() => {
    if (userData) fetchCarrinho();
  }, [userData]);

  // 4. Adicionar produto ao carrinho
  const adicionarAoCarrinho = async (produto) => {
    if (!userData) return;

    // Bloqueia adicionar se produto estiver sem estoque ou fora de linha
    if ((produto.quantidade || 0) <= 0) {
      console.log("Produto sem estoque disponível!");
      return;
    }
    if (produto.ativo === false) {
      console.log("Produto fora de linha - não pode ser adicionado.");
      return;
    }

    try {
      setAdicionandoId(produto.id);

      const res = await fetch("/api/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userData.id,
          lojaId: userData.loja_id,
          produtoId: produto.id,
          quantidade: 1,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.error || "Erro ao adicionar produto");

      fetchCarrinho();
    } catch (err) {
      console.error(err);
      console.log(err.message || "Erro ao adicionar produto");
    } finally {
      setAdicionandoId(null);
    }
  };

  // 5. Alterar quantidade do carrinho
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;
    try {
      const res = await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar quantidade");
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      console.log(err.message || "Erro ao atualizar quantidade");
    }
  };

  // 6. Remover do carrinho
  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      console.log("Erro ao remover item");
    }
  };

  // 7. Cálculo do total corrigido (usando parseFloat)
  const total = carrinho.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);

  // Separar produtos em ativos e fora de linha (para renderizar seções)
  const produtosAtivos = produtos.filter(p => p.ativo !== false);
  const produtosForaDeLinha = produtos.filter(p => p.ativo === false);

  // Loading ou erro
  if (!userData || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl font-bold text-red-500">{error}</p>
        <Button className="font-bold text-lg" onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // Render
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold">Produtos Disponíveis</h2>
          <p className="text-muted-foreground mt-4 font-semibold text-lg sm:text-xl">
            Bem-vindo(a), {userData.nome} | Loja: {userData.loja_id}
          </p>
        </div>
      </div>

      {/* Grid de produtos ATIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produtosAtivos.length === 0 && (
          <div className="col-span-full text-center text-lg font-bold text-muted-foreground">
            Nenhum produto ativo encontrado.
          </div>
        )}

        {produtosAtivos.map((produto) => {
          const semEstoque = (produto.quantidade || 0) <= 0;
          const estoqueMinimo = produto.quantidade > 0 && produto.quantidade <= produto.estoque_minimo;
          const isAdicionando = adicionandoId === produto.id;

          return (
            <Card
              key={produto.id}
              className={`rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col ${semEstoque ? "opacity-70" : ""}`}
            >
              {/* Imagem */}
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-3xl">
                {produto.img ? (
                  <Image src={produto.img} alt={produto.nome} fill className="object-cover p-4 rounded-3xl" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-2xl font-extrabold leading-tight">{produto.nome}</h3>
                  <br></br>
                  <p className="text-lg font-semibold text-muted-foreground line-clamp-3 min-h-[2.5rem] mt-3">
                    {produto.descricao || "Sem descrição"}
                  </p>

                  <p className="text-lg text-muted-foreground font-bold mt-6">
                    {produto.sku} | {produto.categoria}
                  </p>
                </div>

                {/* Estoque */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${semEstoque ? "text-red-200" : estoqueMinimo ? "text-yellow-200" : "text-green-200"}`}>
                  <div className="flex items-center gap-2">
                    <Package className={`w-5 h-5 ${semEstoque ? "dark:text-red-500 text-red-600" : estoqueMinimo ? "dark:text-yellow-500 text-yellow-600" : "dark:text-green-500 text-green-700"}`} />
                    <div>
                      <strong className="text-lg text-muted-foreground">Estoque</strong>
                      <p className={`text-2xl font-bold ${semEstoque ? "dark:text-red-500 text-red-600" : estoqueMinimo ? "dark:text-yellow-500 text-yellow-600" : "dark:text-green-500 text-green-700"}`}>
                        {produto.quantidade ?? 0}
                      </p>
                    </div>
                  </div>
                  {estoqueMinimo && !semEstoque && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                </div>

                {/* Preço */}
                <div className="flex justify-between items-center pt-2 border-t mt-auto">
                  <strong className="text-xl">Preço: </strong>
                  <h1 className="text-2xl font-extrabold text-black-600">
                    R$ {formatCurrency(produto.preco_venda)}
                  </h1>
                </div>

                {/* Botão */}
                <Button
  className="w-full mt-2 font-bold text-base sm:text-lg flex items-center justify-center gap-2"
  onClick={() => adicionarAoCarrinho(produto)}
  disabled={semEstoque || isAdicionando}
  variant={semEstoque ? "destructive" : "default"}
>
  {isAdicionando ? (
    <>
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span>Adicionando...</span>
    </>
  ) : semEstoque ? (
    "Sem estoque"
  ) : (
    <>
      <ShoppingCart className="w-5 h-5" />
      <span className="font-bold">Adicionar</span>
    </>
  )}
</Button>

              </CardContent>
            </Card>
          );
        })}
      </div>
      

      {/* SEÇÃO: Produtos FORA DE LINHA */}

<br></br>
      <Separator></Separator>
<br></br>
      {produtosForaDeLinha.length > 0 && (
        <div className="space-y-2">
          <div>
            <h3 className="text-4xl font-bold">Produtos Fora de Linha</h3>
            <br></br>
            <p className="text-xl text-muted-foreground font-semibold">Estes produtos foram desativados e não podem ser vendidos.</p>
            <br></br>
          </div>
          

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosForaDeLinha.map((produto) => {
              // mesmo layout visual, mas marca FORA DE LINHA e botão desabilitado
              return (
                <Card key={`fora-${produto.id}`} className="rounded-2xl shadow-md transition-all flex flex-col opacity-60">
                  <div className="relative w-full h-48 overflow-hidden rounded-t-2xl flex-shrink-0">
                    {produto.img ? (
                      <Image src={produto.img} alt={produto.nome} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* badge FORA DE LINHA no canto */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-m font-bold px-2 py-1 rounded">
                      FORA DE LINHA
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-extrabold text-2xl">{produto.nome}</h3>

                     <p className="text-lg text-muted-foreground line-clamp-3 min-h-[rem] mt-3">
                      {produto.descricao || "Sem descrição"}
                     </p>


              

                      <p className="text-lg font-semibold text-muted-foreground mt-6">
                        {produto.sku} | {produto.categoria}
                      </p>
                    </div>

                
                    <div className="flex justify-between items-center pt-2 border-t mt-auto">
                      <span className="text-xl font-bold">Preço:</span>
                      <span className="text-2xl font-extrabold">
                        R$ {formatCurrency(produto.preco_venda)}
                      </span>
                    </div>

                    <Button className="w-full mt-2 text-lg" disabled variant="destructive">
                      FORA DE LINHA
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <Card className="mt-8 p-4 sm:p-6 border-2 border-primary bg-transparent">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-2 flex-wrap">
            <ShoppingCart className="w-6 h-6" />
            Carrinho ({carrinho.length} {carrinho.length === 1 ? "item" : "itens"})
          </h3>

          <div className="space-y-3">
            {carrinho.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-transparent sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-bold text-2xl m-3">{item.produto.nome}</p>
                  <p className="text-lg font-semibold">
                    R$ {formatCurrency(item.preco_unitario)} x {item.quantidade}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-3">
                 <Button
  size="sm"
  variant="destructive"
  onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
  className="font-extrabold text-2xl w-10 h-10"
>
  -
</Button>

<span className="font-bold text-lg w-8 text-center">{item.quantidade}</span>

<Button
  size="sm"
  variant="destructive"
  onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
  className="font-extrabold text-xl w-10 h-10"
>
  +
</Button>

                  </div>

                  <div className="text-center sm:text-right min-w-[80px]">
                    <p className="font-bold text-xl">R$ {formatCurrency(item.subtotal)}</p>
                  </div>

                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => removerDoCarrinho(item.id)}
                  >
                   <p className="font-bold text-lg">X</p> 
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t-2 gap-2">
            <span className="text-xl sm:text-2xl font-bold">Total:</span>
            <span className="text-2xl sm:text-3xl font-bold">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <Button onClick={() => router.push("/pagamento")} className="w-full font-bold text-lg mt-4" size="lg">
            Finalizar Venda
          </Button>
        </Card>
      )}
    </div>
  );
}
