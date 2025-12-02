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

  const totalfiliais = filiais.reduce((acc, f) => acc + f.stats.lucro, 0);
 

  const [tab, setTab] = useState("resumo")

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
        <p className="text-xl font-bold text-red-500">{error}</p>
        <Button className="font-bold text-lg" onClick={fetchFiliais}>Tentar Novamente</Button>
      </div>
    );
  }

  // RENDER FINAL
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gestão de Filiais</h1>
          <p className="text-muted-foreground text-lg m-2 font-bold">
            Visão completa de todas as operações das filiais
          </p>
        </div>

        <div variant="outline" className="text-xl font-extrabold px-4 py-2">
          <h1 className="w-5 h-5 mr-2" />
          <p className="text-3xl">{filiais.length}</p> Filiais Ativas
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <br></br>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Faturamento <br></br> Total
            </CardTitle>
            <DollarSign className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {filiais
                .reduce((acc, f) => acc + f.stats.totalVendas, 0)
                .toFixed(2)}
            </div>
          </CardContent>
          <br></br>
        </Card>

        <Card>
          <br></br>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Lucro <br></br> Total</CardTitle>
            <TrendingUp className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
          <p
                     className={`text-2xl font-bold ${
                    totalfiliais < 0
                   ? "text-red-500"
                   : totalfiliais > 0
                   ? "text-green-500"
                  : ""
                   }`}
                   >
                 R$ {totalfiliais.toFixed(2)}
                   </p>
          <br></br>
          </CardContent>
        </Card>

        <Card>
          <br></br>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Produtos <br></br> em Falta
            </CardTitle>
            <AlertCircle className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filiais.reduce((acc, f) => acc + f.stats.estoqueBaixo, 0)}
            </div>
          </CardContent>
          <br></br>
        </Card>

        <Card>
          <br></br>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Pedidos <br></br> Pendentes
            </CardTitle>
            <FileText className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {filiais.reduce((acc, f) => acc + f.stats.pedidosPendentes, 0)}
            </div>
          </CardContent>
          <br></br>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Nome + Endereço */}
            <br></br>
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <br></br>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {filial.nome}
              </CardTitle>
              <p className="text-lg sm:text-lg text-muted-foreground mt-1">
                {filial.endereco} - {filial.cidade}/{filial.estado}
              </p>
            </div>
          </div>

          {/* Status + Ícone de expandir */}
          <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-center">
            <Badge
              className="text-lg sm:text-base font-semibold px-3 py-1"
              variant={filial.ativo ? "default" : "destructive"}
            >
              {filial.ativo ? "Ativo" : "Inativo"}
            </Badge>

            {expandedFilial === filial.id ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </div>
        </div>
        <br></br>
      </CardHeader>
   


            {/* DETALHES EXPANDIDOS */}
       {expandedFilial === filial.id && (
  <CardContent className="pt-6">
    <Tabs value={tab} onValueChange={setTab} className="w-full">

       <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-20 p-6 bg-transparent gap-3 shadow-none rounded-none">

        <Button
          onClick={() => setTab("resumo")}
          className={`font-bold text-lg rounded-lg border px-3 py-2 
          ${tab === "resumo" ? "bg-red-900 text-white" : "bg-red-900 text-white"}`}>
          Resumo
        </Button>

        <Button
          onClick={() => setTab("financeiro")}
          className={`font-bold text-lg rounded-lg border px-3 py-2 
          ${tab === "financeiro" ? "bg-red-900 text-white" : "bg-red-900 text-white"}`}>
          Financeiro
        </Button>

        <Button
          onClick={() => setTab("estoque")}
          className={`font-bold text-lg rounded-lg border px-3 py-2 
          ${tab === "estoque" ? "bg-red-900 text-white" : "bg-red-900 text-white"}`}>
          Estoque
        </Button>

        <Button
          onClick={() => setTab("equipe")}
          className={`font-bold text-lg rounded-lg border px-3 py-2 
          ${tab === "equipe" ? "bg-red-900 text-white" : "bg-red-900 text-white"}`}>
          Equipe
        </Button>
      </TabsList>


                  {/* === TAB 1: RESUMO === */}
                 <TabsContent value="resumo" className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

    {/* FATURAMENTO */}
    <br></br>
    <div className="space-y-2">
      <div className="text-sm flex items-center gap-2">
        <DollarSign className="w-4 h-4" />
        <p className="font-semibold text-lg">Faturamento</p>
      </div>
      <h1 className="text-2xl font-bold">
        R$ {filial.stats.totalVendas.toFixed(2)}
      </h1>
    </div>

    {/* LUCRO */}
    <br></br>
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        <p className="font-bold text-lg">Lucro</p>
      </div>
      <p
        className={`text-2xl font-bold ${
          filial.stats.lucro < 0 ? "text-red-500" : "text-green-500"
        }`}
      >
        R$ {filial.stats.lucro.toFixed(2)}
      </p>
    </div>

    {/* FUNCIONÁRIOS */}
    <br></br>
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Users className="w-4 h-4" />
        <p className="font-bold text-lg">Funcionários</p>
      </div>
      <p className="text-2xl font-bold">
        {filial.stats.funcionarios}
      </p>
    </div>

    {/* CAIXAS ABERTOS */}
    <br></br>
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <ShoppingCart className="w-4 h-4" />
        <p className="font-bold text-lg">Caixas Abertos</p>
      </div>
      <p className="text-2xl font-bold">
        {filial.stats.caixasAbertos}
      </p>
    </div>

  </div>
</TabsContent>


                  {/* === TAB 2: FINANCEIRO === */}
                <TabsContent value="financeiro" className="space-y-4">
  <div className="grid gap-4">

    <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
      <span className="font-bold text-lg text-center sm:text-left">
        Total de Vendas
      </span>
      <span className="text-xl font-bold mt-2 sm:mt-0 text-center sm:text-right">
        R$ {filial.stats.totalVendas.toFixed(2)}
      </span>
    </div>

    <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
      <span className="font-bold text-lg text-center sm:text-left">
        CMV
      </span>
      <span className="text-xl font-bold mt-2 sm:mt-0 text-center sm:text-right">
        R$ {filial.stats.totalCMV.toFixed(2)}
      </span>
    </div>

    <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
      <span className="font-bold text-lg text-center sm:text-left">
        Despesas pendentes
      </span>
      <p className="text-xl font-bold text-red-500 mt-2 sm:mt-0 text-center sm:text-right">
        R$ {filial.stats.totalDespesas.toFixed(2)}
      </p>
    </div>

    <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
      <span className="font-bold text-lg text-center sm:text-left">
        Lucro Líquido
      </span>
      <p
        className={`text-xl font-bold mt-2 sm:mt-0 text-center sm:text-right ${
          filial.stats.lucro < 0
            ? "text-red-500"
            : filial.stats.lucro > 0
            ? "text-green-500"
            : ""
        }`}
      >
        R$ {filial.stats.lucro.toFixed(2)}
      </p>
    </div>

        <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
        <span className="font-bold text-lg text-center sm:text-left">
        Margem de Lucro
        </span>
        <p
         className={`text-xl font-bold mt-2 sm:mt-0 text-center sm:text-right ${
          filial.stats.margemLucro < 0
            ? "text-red-500"
            : filial.stats.margemLucro > 0
            ? "text-green-500"
            : ""
        }`}
      >
        {filial.stats.margemLucro.toFixed(2)}%
        </p>
       </div>

       <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
      <span className="font-bold text-lg text-center sm:text-left">
        Número de Vendas
      </span>
      <span className="text-xl font-bold mt-2 sm:mt-0 text-center sm:text-right">
        {filial.stats.numeroVendas}
        </span>
        </div>

        </div>
       </TabsContent>


                  {/* === TAB 3: ESTOQUE === */}
                  <TabsContent value="estoque" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">
                        Produtos com estoque baixo
                      </h3>
                      <Badge className="text-lg m-3" variant="destructive">
                        {filial.stats.estoqueBaixo} itens
                      </Badge>
                    </div>

                    {filial.detalhes.estoqueBaixo.length === 0 ? (
                      <p className="text-center text-muted-foreground text-lg font-semibold py-8">
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
                              <p className="text-lg text-muted-foreground">
                                Mínimo: {item.estoque_minimo}
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {item.quantidade} restantes
                            </Badge>
                            <br></br>
                          </div>
                        ))}
                      </div>
                    )}

                   <Separator/>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold">
                        Pedidos Pendentes
                      </h3>
                      <br></br>

                      {filial.detalhes.pedidosPendentes.length === 0 ? (
                        <p className="text-center text-lg font-semibold text-muted-foreground py-8">
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
                                <p className="text-xl font-bold">
                                  Pedido {pedido.id}
                                </p>
                                <p className="text-lg text-muted-foreground">
                                  {new Date(
                                    pedido.data_pedido
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <Badge className="text-lg font-semibold" variant="outline">{pedido.status}</Badge>
                              <br></br>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* === TAB 4: EQUIPE === */}
                  <TabsContent value="equipe" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-2xl font-bold">Equipe</h3>
                      <Badge className="text-lg font-semibold">{filial.stats.funcionarios} funcionários</Badge>
                    </div>

                    <div className="space-y-2">
                      {filial.detalhes.funcionarios.map((func) => (
                        <div
                          key={func.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full">
                              <Users className="w-4 h-4" />
                            </div>
                            <span className="text-xl font-semibold">{func.nome}</span>
                          </div>
                          <Badge className="text-lg" variant="outline">{func.perfil}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h3 className="text-2xl font-bold mb-4">
                        Status dos Caixas
                      </h3>

                      <div className="space-y-2">
                        {filial.detalhes.caixas.map((caixa) => (
                          <div
                            key={caixa.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-bold text-xl">Caixa {caixa.id}</p>
                              <br></br>
                              <p className="text-m text-muted-foreground">
                                Saldo Inicial: R${" "}
                                {caixa.saldo_inicial.toFixed(2)}
                              </p>
                              <p className="text-m text-muted-foreground">
                                Aberto em:{" "}
                                {new Date(caixa.data_abertura).toLocaleString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                            <Badge
                            className="text-lg font-m"
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
                <br></br>
              </CardContent>
            )}
          </Card>

        ))}

            <div className="flex justify-center p-5">
  <Button onClick={() => router.push('/registro') } className="p-6"> 
   <p className="font-bold text-lg p-5">Criar novo Usuário</p>
  </Button>
</div>

      </div>
    </div>
  );
}
