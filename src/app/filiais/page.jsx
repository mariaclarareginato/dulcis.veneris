"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getLoggedUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Store,
  Package,
  TrendingUp,
  AlertCircle,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function MatrizPage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [error, setError] = useState(null);

  const [expandedFilial, setExpandedFilial] = useState(null);

  // AUTENTICAÇÃO
  useEffect(() => {
    const user = getLoggedUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserData(user);
    setAuthLoading(false);
  }, [router]);

  // BUSCAR FILIAIS
  useEffect(() => {
    if (!userData) return;

    fetchFiliais();
  }, [userData]);

  const fetchFiliais = async () => {
    try {
      setLoadingFiliais(true);
      setError(null);

      const res = await fetch("/api/matriz");

      if (!res.ok) throw new Error("Erro ao buscar dados das filiais");

      const data = await res.json();
      setFiliais(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const toggleFilialDetails = (filialId) => {
    setExpandedFilial(expandedFilial === filialId ? null : filialId);
  };

  // LOADING AUTENTICAÇÃO
  if (authLoading || !userData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // LOADING FILIAIS
  if (loadingFiliais) {
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
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={fetchFiliais}>Tentar Novamente</Button>
      </div>
    );
  }

  // RENDER FINAL
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Filiais</h1>
          <p className="text-muted-foreground mt-2 font-bold">
            Visão completa de todas as operações das filiais
          </p>
        </div>

        <Badge variant="outline" className="text-lg px-4 py-2">
          <Store className="w-5 h-5 mr-2" />
          {filiais.length} Filiais Ativas
        </Badge>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R${" "}
              {filiais
                .reduce((acc, f) => acc + f.stats.totalVendas, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {filiais.reduce((acc, f) => acc + f.stats.lucro, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos em Falta
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filiais.reduce((acc, f) => acc + f.stats.estoqueBaixo, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Pendentes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filiais.reduce((acc, f) => acc + f.stats.pedidosPendentes, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE FILIAIS */}
      <div className="space-y-4">
        {filiais.map((filial) => (
          <Card key={filial.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer transition-colors"
              onClick={() => toggleFilialDetails(filial.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className=" p-3 rounded-full">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{filial.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filial.endereco} - {filial.cidade}/{filial.estado}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={filial.ativo ? "default" : "destructive"}>
                    {filial.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  {expandedFilial === filial.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </CardHeader>

            {/* DETALHES EXPANDIDOS */}
            {expandedFilial === filial.id && (
              <CardContent className="pt-6">
                <Tabs defaultValue="resumo" className="w-full">
                  <TabsList className="grid w-full mb-14 grid-cols-2 bg-transparent shadow-none rounded-none">
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                    <TabsTrigger value="estoque">Estoque</TabsTrigger>
                    <TabsTrigger value="equipe">Equipe</TabsTrigger>
                  </TabsList>

                  {/* === TAB 1: RESUMO === */}
                  <TabsContent value="resumo" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm  flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Faturamento
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {filial.stats.totalVendas.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Lucro
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {filial.stats.lucro.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Funcionários
                        </p>
                        <p className="text-2xl font-bold">
                          {filial.stats.funcionarios}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Caixas Abertos
                        </p>
                        <p className="text-2xl font-bold">
                          {filial.stats.caixasAbertos}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* === TAB 2: FINANCEIRO === */}
                  <TabsContent value="financeiro" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium">Total de Vendas</span>
                        <span className="text-xl font-bold text-green-600">
                          R$ {filial.stats.totalVendas.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium">CMV</span>
                        <span className="text-xl font-bold text-orange-600">
                          R$ {filial.stats.totalCMV.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium">Despesas Pendentes</span>
                        <span className="text-xl font-bold text-red-600">
                          R$ {filial.stats.totalDespesas.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-bold">Lucro Líquido</span>
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {filial.stats.lucro.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium">Margem de Lucro</span>
                        <span className="text-xl font-bold">
                          {filial.stats.margemLucro}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <span className="font-medium">Número de Vendas</span>
                        <span className="text-xl font-bold">
                          {filial.stats.numeroVendas}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  {/* === TAB 3: ESTOQUE === */}
                  <TabsContent value="estoque" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Produtos com Estoque Baixo
                      </h3>
                      <Badge variant="destructive">
                        {filial.stats.estoqueBaixo} itens
                      </Badge>
                    </div>

                    {filial.detalhes.estoqueBaixo.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum produto com estoque baixo
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filial.detalhes.estoqueBaixo.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{item.produto}</p>
                              <p className="text-sm text-muted-foreground">
                                Mínimo: {item.estoque_minimo}
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {item.quantidade} restantes
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                   <Separator/>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Pedidos Pendentes
                      </h3>

                      {filial.detalhes.pedidosPendentes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum pedido pendente
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filial.detalhes.pedidosPendentes.map((pedido) => (
                            <div
                              key={pedido.id}
                              className="flex justify-between items-center p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  Pedido {pedido.id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    pedido.data_pedido
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <Badge variant="outline">{pedido.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* === TAB 4: EQUIPE === */}
                  <TabsContent value="equipe" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Equipe</h3>
                      <Badge>{filial.stats.funcionarios} funcionários</Badge>
                    </div>

                    <div className="space-y-2">
                      {filial.detalhes.funcionarios.map((func) => (
                        <div
                          key={func.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{func.nome}</span>
                          </div>
                          <Badge variant="outline">{func.perfil}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Status dos Caixas
                      </h3>

                      <div className="space-y-2">
                        {filial.detalhes.caixas.map((caixa) => (
                          <div
                            key={caixa.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">Caixa {caixa.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Saldo Inicial: R${" "}
                                {caixa.saldo_inicial.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Aberto em:{" "}
                                {new Date(caixa.data_abertura).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                            <Badge
                              variant={
                                caixa.status === "ABERTO"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {caixa.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>

        ))}

            <div className="flex justify-center mt-10">
  <Button onClick={() => router.push('/registro') }>
   <p className="font-bold">Criar novo Usuário</p>
  </Button>
</div>

      </div>
    </div>
  );
}
