"use client";

import { useEffect, useState, useMemo } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { AlertCircle, ShoppingCart, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLoggedUser } from "@/lib/auth-client";

export default function CategoriaPage({ params }) {
  const router = useRouter();
  const categoria = use(params).categoria;

  // Estados
  const [userData, setUserData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adicionandoId, setAdicionandoId] = useState(null);

  // Busca usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // Busca produtos após carregar o usuário
  useEffect(() => {
    if (!userData) return;

    const controller = new AbortController();

    async function fetchProdutos() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/produtos?lojaId=${userData.loja_id}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const data = await res.json();
        setProdutos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar produtos");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
    return () => controller.abort();
  }, [userData]);

  // Filtra pela categoria
  const produtosFiltrados = useMemo(() => {
    const c = decodeURIComponent(categoria).toLowerCase();
    return produtos.filter(
      (p) => p.categoria?.toLowerCase() === c
    );
  }, [produtos, categoria]);

  // Adiciona ao carrinho
  const handleAdicionarCarrinho = async (produto) => {
    if (!userData) return;
    if (produto.quantidade <= 0) return alert("Produto sem estoque disponível");

    try {
      setAdicionandoId(produto.id);

      const res = await fetch(`/api/carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userData.id,
          lojaId: userData.loja_id,
          produtoId: produto.id,
          quantidade: 1,
        }),
      });

      const txt = await res.text();
      const data = txt ? JSON.parse(txt) : {};

      if (!res.ok) throw new Error(data.error || "Erro ao adicionar");
    } catch (err) {
      alert(err.message || "Erro ao adicionar produto");
    } finally {
      setAdicionandoId(null);
    }
  };

  // LOADING
  if (!userData || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // ERRO
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl font-bold text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}><p className="font-bold text-lg">Tentar Novamente</p></Button>
      </div>
    );
  }

  // SEM PRODUTOS
  if (produtosFiltrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-center">Nenhum produto encontrado</h2>
        <p className="text-muted-foreground font-bold">
          Não há produtos na categoria "{decodeURIComponent(categoria)}"
        </p>
      </div>
    );
  }

  // FUNÇÃO PARA RENDERIZAR CARD
  function renderCard(produto) {


    const semEstoque = produto.quantidade <= 0;
    const estoqueMinimo =
      produto.quantidade > 0 && produto.quantidade <= produto.estoque_minimo;
    const isAdicionando = adicionandoId === produto.id;

    return (
      <Card
        key={produto.id}
        className="rounded-2xl  shadow-md hover:shadow-lg transition-shadow flex flex-col"
      >
        <br></br>
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold leading-tight">{produto.nome}</CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span className="m-3 text-m font-semibold">{produto.sku}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Imagem */}
          {produto.img ? (
            <div className="relative w-full h-72 rounded-lg overflow-hidden">
              <Image
                src={produto.img}
                alt={produto.nome}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-72 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Descrição igualada */}
          <p className="text-lg font-semibold line-clamp-3">
            {produto.descricao || "Sem descrição"}
          </p>

          {/* Estoque */}
          {produto.ativo !== false && (
            <>
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-m font-semibold">ESTOQUE DISPONÍVEL:</p>

              <p
                className={`text-2xl font-bold ${
                  semEstoque
                    ? "text-red-600"
                    : estoqueMinimo
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {produto.quantidade}
              </p>

              <p className="text-lg font-semibold">
                {produto.quantidade === 1 ? "unidade" : "unidades"}
              </p>
            </div>
          </div>

          {estoqueMinimo && (
            <Alert className="py-2 border-yellow-500 bg-yellow-50">
              <AlertDescription className="text-lg text-yellow-700">
                ⚠️ Estoque baixo! Restam apenas {produto.quantidade} unidades
              </AlertDescription>
            </Alert>
          )}

          {semEstoque && (
            <Alert className="py-2 border-red-500 bg-red-50">
              <AlertDescription className="text-lg text-red-700 font-bold">
                🚫 PRODUTO ESGOTADO
              </AlertDescription>
            </Alert>
          )}
          </>
          )}

          {/* Preço */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Preço:</span>
              <span className="text-xl font-bold">
                R$ {Number(produto.preco_venda ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-lg font-semibold">Custo:</span>
              <span className="text-xl font-bold">R$ {Number(produto.custo ?? 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Botão */}
          <Button
            className="w-full text-lg font-bold"
            onClick={() => handleAdicionarCarrinho(produto)}
            disabled={semEstoque || isAdicionando || produto.ativo === false}
            variant={produto.ativo === false || semEstoque === true ? "destructive" : "default"}
          >
            {produto.ativo === false
              ? "Fora de linha"
              : isAdicionando
              ? "Adicionando..."
              : semEstoque
              ? "Sem estoque"
              : (  <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Adicionar ao carrinho
             </>
                )}
               
          </Button>
        </CardContent>
         <br></br>
      </Card>
    );
  }

  // RENDERIZAÇÃO
  return (
    <div className="space-y-6">
      <h2 className="text-4xl m-7 font-bold capitalize">
        {decodeURIComponent(categoria)}
      </h2>

      <p className="text-xl text-muted-foreground m-7 font-semibold">
        {produtosFiltrados.length} produto(s) encontrado(s)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 m-7">

        {/* 1) Disponíveis */}
        {produtosFiltrados
          .filter((p) => p.ativo !== false && p.quantidade > 0)
          .map(renderCard)}

        {/* 2) Esgotados */}
        {produtosFiltrados
          .filter((p) => p.ativo !== false && p.quantidade === 0)
          .map(renderCard)}

        {/* 3) Fora de Linha */}
        {produtosFiltrados.some((p) => p.ativo === false) && (
          <div className="col-span-full mt-10 mb-2">
            <h3 className="text-3xl font-bold">
              Produtos Fora de Linha
            </h3>
            <p className="text-lg font-semibold text-muted-foreground m-4">
              Estes produtos não estão mais sendo comercializados.
            </p>
          </div>
        )}
        <div className="opacity-50">
        {produtosFiltrados
          .filter((p) => p.ativo === false)
          .map(renderCard)}
        </div>

      </div>
    </div>
  );
}
