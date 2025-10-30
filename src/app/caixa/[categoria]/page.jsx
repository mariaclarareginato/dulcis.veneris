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

  //  Estados
  const [userData, setUserData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adicionandoId, setAdicionandoId] = useState(null);

  //  1. BUSCA DADOS DO USUÁRIO LOGADO
  useEffect(() => {
    const user = getLoggedUser();

    if (!user) {
      // Se não estiver logado, redireciona para login
      router.push("/login");
      return;
    }

    setUserData(user);
  }, [router]);

  //  2. BUSCA PRODUTOS (só roda quando tiver userData)
  useEffect(() => {
    if (!userData) return; // Aguarda usuário carregar

    const controller = new AbortController();

    async function fetchProdutos() {
      try {
        setLoading(true);
        setError(null);

        //  Usa o loja_id do usuário logado
        const res = await fetch(`/api/produtos?lojaId=${userData.loja_id}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar produtos: ${res.status}`);
        }

        const data = await res.json();
        setProdutos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar produtos");
          setProdutos([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
    return () => controller.abort();
  }, [userData]); // ← Depende de userData

  //  3. FILTRA PRODUTOS POR CATEGORIA
  const produtosFiltrados = useMemo(() => {
    const categoriaNormalizada = decodeURIComponent(categoria).toLowerCase();
    return produtos.filter(
      (p) => p.categoria?.toLowerCase() === categoriaNormalizada
    );
  }, [produtos, categoria]);



  //  4. ADICIONA PRODUTO AO CARRINHO

 const handleAdicionarCarrinho = async (produto) => {
  if (!userData) return; // Proteção extra

  if (produto.quantidade <= 0) {
    alert("Produto sem estoque disponível");
    return;
  }

  try {

    const res = await fetch(`/api/carrinho`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: userData.id,    // Usuário logado
        lojaId: userData.loja_id,  // Loja do usuário
        produtoId: produto.id,     
        quantidade: 1,             // Sempre envia 1
      }),
    });

    // Proteção: evita erro caso o backend retorne corpo vazio
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(data.error || "Erro ao adicionar ao carrinho");
    }

    // Feedback de sucesso
    alert(`✅ ${produto.nome} adicionado ao carrinho!`);
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao adicionar produto ao carrinho");
  } finally {
    setAdicionandoId(null);
  }
};


  //  LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  //  ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  //  ESTADO DE ERRO
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  //  NENHUM PRODUTO ENCONTRADO
  if (produtosFiltrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Package className="w-16 h-16 text-muted-foreground"/>
        <h2 className="text-2xl font-bold text-center">
          Nenhum produto encontrado
        </h2>
        <p className="text-muted-foreground font-bold">
          Não há produtos disponíveis na categoria "
          {decodeURIComponent(categoria)}"
        </p>
      </div>
    );
  }

  //  RENDERIZAÇÃO PRINCIPAL
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold capitalize">
          {decodeURIComponent(categoria)}
        </h2>
        <p className="text-sm text-muted-foreground mt-4 mb-4 font-bold">
          {produtosFiltrados.length}{" "}
          {produtosFiltrados.length === 1
            ? "produto encontrado"
            : "produtos encontrados"}
        </p>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto) => {
          const semEstoque = produto.quantidade <= 0;
          const estoqueMinimo =
            produto.quantidade > 0 &&
            produto.quantidade <= produto.estoque_minimo;
          const isAdicionando = adicionandoId === produto.id;

          return (
            <Card
              key={produto.id}
              className="rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">{produto.nome}</CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>{produto.sku}</span>
                  <span className="text-xs capitalize">
                    {produto.categoria}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Imagem do Produto */}
                {produto.img ? (
                  <div className="relative w-full h-72 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={produto.img}
                      alt={produto.nome}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-72 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Descrição */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {produto.descricao || "Sem descrição"}
                </p>

                {/* DESTAQUE: Badge de Estoque */}
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r">
                  <div className="text-center">
                    <p className="text-xs font-medium">
                      ESTOQUE DISPONÍVEL: 
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        semEstoque
                          ? "text-red-600"
                          : estoqueMinimo
                          ? "text-yellow-600"
                          : "text-green-800"
                      }`}
                    >
                      {produto.quantidade}
                    </p>
                    <p className="text-xs">
                      {produto.quantidade === 1 ? "unidade" : "unidades"}
                    </p>
                  </div>
                </div>

                {/* Alerta de Estoque Baixo */}
                {estoqueMinimo && (
                  <Alert className="py-2 border-yellow-500 bg-yellow-50">
                    <AlertDescription className="text-xs text-yellow-700">
                      ⚠️ Estoque baixo! Restam apenas {produto.quantidade}{" "}
                      unidades
                    </AlertDescription>
                  </Alert>
                )}

                {semEstoque && (
                  <Alert className="py-2 border-red-500 bg-red-50">
                    <AlertDescription className="text-xs text-red-700 font-bold">
                      🚫 PRODUTO ESGOTADO
                    </AlertDescription>
                  </Alert>
                )}

                {/* Informações de Preço */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Preço de Venda:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {produto.preco_venda?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Custo:</span>
                    <span className="text-muted-foreground">
                      R$ {produto.custo?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                   </div>

                   {/* 
                  <div className="flex justify-between items-center text-xs pt-1 border-t">
                    <span className="text-muted-foreground">Margem de lucro:</span>
                    <span className="font-semibold text-blue-600">
                      {(
                        ((produto.preco_venda - produto.custo) /
                          produto.custo) *
                          100 || 0
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                </div> 
                */}
                

                {/* Botão Adicionar ao Carrinho */}
                <Button
                  className="w-full"
                  onClick={() => handleAdicionarCarrinho(produto)}
                  disabled={semEstoque || isAdicionando}
                  variant={semEstoque ? "destructive" : "default"}
                >
                  {isAdicionando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adicionando...
                    </>
                  ) : semEstoque ? (
                    "Sem Estoque"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar ao carrinho
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
      </div>
    </div>
  );
}
