"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getLoggedUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import {
  TrendingUp,
  AlertCircle,
  Users,
  ShoppingCart,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IconH1 } from "@tabler/icons-react";

export default function MatrizPage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(true);
  const [error, setError] = useState(null);

  const [expandedFilial, setExpandedFilial] = useState(null);

  // Modal / form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formCreate, setFormCreate] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    ativo: true,
  });

  const [formEdit, setFormEdit] = useState(null);
  const [filialToDelete, setFilialToDelete] = useState(null);

  // tab state (keeps same tab across expansions)
  const [tab, setTab] = useState("resumo");

  // AUTH
  useEffect(() => {
    const user = getLoggedUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserData(user);
    setAuthLoading(false);
  }, [router]);

  // FETCH FILIAIS
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
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoadingFiliais(false);
    }
  };

  const toggleFilialDetails = (filialId) => {
    setExpandedFilial(expandedFilial === filialId ? null : filialId);
  };

  // SAFE reducers (avoid crash if stats missing)
  const safe = (v, fallback = 0) => (typeof v === "number" ? v : fallback);
  const totalfiliais = filiais.reduce((acc, f) => acc + safe(f?.stats?.lucro, 0), 0);

  // =========================
  // CRUD: CREATE / PUT / DELETE
  // =========================

  // CREATE (POST)
  const criarFilial = async () => {
    try {
      const res = await fetch("/api/matriz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCreate),
      });

      if (!res.ok) throw new Error("Erro ao criar filial");

      setShowCreateModal(false);
      setFormCreate({ nome: "", endereco: "", cidade: "", estado: "", ativo: true });
      await fetchFiliais();
    } catch (err) {
      alert(err.message || "Erro ao criar filial");
    }
  };

  // UPDATE (PUT)
  const atualizarFilial = async (id, dados) => {
    try {
      const res = await fetch(`/api/matriz/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!res.ok) throw new Error("Erro ao atualizar filial");

      setShowEditModal(false);
      setFormEdit(null);
      await fetchFiliais();
    } catch (err) {
      alert(err.message || "Erro ao atualizar filial");
    }
  };

  // DELETE
  const deletarFilial = async (id) => {
    try {
      const res = await fetch(`/api/matriz/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao deletar filial");

      setShowDeleteModal(false);
      setFilialToDelete(null);
      await fetchFiliais();
    } catch (err) {
      alert(err.message || "Erro ao deletar filial");
    }
  };

  // =========================
  // Gerar PDF (mesma função do seu código)
  // =========================
  async function gerarPDF(filiaisForDoc) {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 40;
      const margin = 30;

      // LOGO
      try {
        const logoBlob = await fetch("/logos/logo2.png").then((r) => r.blob());
        const reader = await new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.readAsDataURL(logoBlob);
        });

        doc.addImage(reader, "PNG", margin, y, 120, 60);
      } catch (err) {
        console.warn("Não foi possível carregar o logo:", err);
      }

      y += 80;
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Gestão de Filiais", pageWidth / 2, y, { align: "center" });

      y += 40;
      const totalFaturamento = filiaisForDoc.reduce((a, f) => a + safe(f?.stats?.totalVendas, 0), 0);
      const totalLucro = filiaisForDoc.reduce((a, f) => a + safe(f?.stats?.lucro, 0), 0);
      const totalEstoqueBaixo = filiaisForDoc.reduce((a, f) => a + safe(f?.stats?.estoqueBaixo, 0), 0);

      autoTable(doc, {
        startY: y,
        head: [["Indicador", "Valor"]],
        body: [
          ["Filiais ativas", filiaisForDoc.length],
          ["Faturamento total", `R$ ${totalFaturamento.toFixed(2)}`],
          ["Lucro total", `R$ ${totalLucro.toFixed(2)}`],
          ["Produtos em falta", totalEstoqueBaixo],
        ],
        headStyles: { fillColor: "#800000" },
      });

      y = doc.lastAutoTable?.finalY + 30 || y + 30;

      for (const [index, filial] of filiaisForDoc.entries()) {
        if (index > 0) {
          doc.addPage();
          y = margin;
        }

        doc.setDrawColor(150, 0, 0);
        doc.setLineWidth(2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 25;

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(filial.nome || "—", margin, y);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${filial.endereco || ""} - ${filial.cidade || ""}/${filial.estado || ""}`, margin, y + 18);

        y += 35;

        autoTable(doc, {
          startY: y,
          head: [["Indicador", "Valor"]],
          body: [
            ["Faturamento", `R$ ${safe(filial?.stats?.totalVendas, 0).toFixed(2)}`],
            ["Lucro", `R$ ${safe(filial?.stats?.lucro, 0).toFixed(2)}`],
            ["Funcionários", safe(filial?.stats?.funcionarios, 0)],
            ["Caixas abertos", safe(filial?.stats?.caixasAbertos, 0)],
            ["Pedidos pendentes", safe(filial?.stats?.pedidosPendentes, 0)],
          ],
          headStyles: { fillColor: "#800000" },
        });

        y = doc.lastAutoTable?.finalY + 20 || y + 20;

        // estoque baixo
        if ((filial?.detalhes?.estoqueBaixo || []).length > 0) {
          autoTable(doc, {
            startY: y,
            theme: "grid",
            head: [["Produto", "Qtd", "Mínimo"]],
            body: (filial.detalhes.estoqueBaixo || []).map((p) => [p.produto, p.quantidade, p.estoque_minimo]),
            headStyles: { fillColor: "#b22222" },
          });
          y = doc.lastAutoTable?.finalY + 20 || y + 20;
        }

        // pedidos pendentes
        if ((filial?.detalhes?.pedidosPendentes || []).length > 0) {
          autoTable(doc, {
            startY: y,
            theme: "grid",
            head: [["Pedido", "Data", "Status"]],
            body: (filial.detalhes.pedidosPendentes || []).map((p) => [
              p.id,
              new Date(p.data_pedido).toLocaleDateString("pt-BR"),
              p.status,
            ]),
            headStyles: { fillColor: "#b22222" },
          });
          y = doc.lastAutoTable?.finalY + 20 || y + 20;
        }

        autoTable(doc, {
          startY: y,
          head: [["Nome", "Perfil"]],
          body: (filial.detalhes.funcionarios || []).map((f) => [f.nome, f.perfil]),
          headStyles: { fillColor: "#8b0000" },
        });

        y = doc.lastAutoTable?.finalY + 20 || y + 20;

        autoTable(doc, {
          startY: y,
          head: [["Caixa", "Saldo Inicial", "Abertura", "Status"]],
          body: (filial.detalhes.caixas || []).map((c) => [
            `Caixa ${c.id}`,
            `R$ ${safe(c.saldo_inicial, 0).toFixed(2)}`,
            c.data_abertura ? new Date(c.data_abertura).toLocaleString("pt-BR") : "",
            c.status || "",
          ]),
          headStyles: { fillColor: "#8b0000" },
        });

        y = doc.lastAutoTable?.finalY + 40 || y + 40;
      }

      doc.save("gestao_filiais.pdf");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar PDF");
    }
  }

  // =========================
  // RENDER STATES: loading / error / normal
  // =========================
  if (authLoading || !userData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadingFiliais) {
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
        <Button className="font-bold text-lg" onClick={fetchFiliais}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // =========================
  // RENDER FINAL
  // =========================
  return (
     <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gestão de Filiais e usuários</h1>
          <p className="text-muted-foreground text-xl m-7 font-semibold">
            Visão completa de todas as operações e gerenciamento das filiais / gestão dos usuários 
          </p>
        </div>

      </div>

      <div className="flex justify-center p-5">
        <Button onClick={() => router.push("/matrizRegistro")} variant="destructive" className="p-6">
          <p className="font-bold text-lg p-5">Gerenciar usuários</p>
        </Button>
      </div>

      {/* CARDS  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1 — Faturamento */}
        <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between mt-5 pb-2">
            <CardTitle className="text-lg font-semibold">
              Faturamento <br />
              Total
            </CardTitle>
            <DollarSign className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$
              {filiais
                .reduce((acc, f) => acc + f.stats.totalVendas, 0)
                .toFixed(2)}
            </div>
          </CardContent>
          <br></br>
        </Card>

        {/* 2 — Lucro */}
        <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between mt-5 pb-2">
            <CardTitle className="text-lg font-semibold">
              Lucro <br />
              Total
            </CardTitle>
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
          </CardContent>
          <br></br>
        </Card>

        {/* 3 — Estoque */}
        <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between mt-5 pb-2">
            <CardTitle className="text-lg font-medium">
              Produtos <br />
              em Falta
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

        {/* 4 — Pedidos */}
        <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between mt-5 pb-2">
            <CardTitle className="text-lg font-medium">
              Pedidos <br />
              Pendentes
            </CardTitle>
            <FileText className="h-7 w-7 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {filiais.reduce(
                (acc, f) => acc + f.stats.pedidosPendentes,
                0
              )}
            </div>
          </CardContent>
          <br></br>
        </Card>
      </div>

      {/* LISTA DE FILIAIS */}
<div className="space-y-6 mt-20">

  {/* Botão Criar Nova Filial */}
  <div className="flex justify-center p-5">
    <Button
      onClick={() => setShowCreateModal(true)}
      className="px-8 py-6 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition"
    >
      + Criar Nova Filial
    </Button>
  </div>

  {filiais.map((filial) => (
    <Card
      key={filial.id}
      className="overflow-hidden border shadow-sm hover:shadow-md transition rounded-xl"
    >
      <CardHeader
        className="p-6"
        onClick={() => toggleFilialDetails(filial.id)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          {/* Nome + Endereço */}
          <div className="flex items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-extrabold">
                {filial.nome}
              </CardTitle>

              <p className="font-medium text-muted-foreground text-lg mt-2">
                {filial.endereco} — {filial.cidade}/{filial.estado}
              </p>
            </div>
          </div>

          {/* Status + Icone */}
          <div className="flex items-center gap-4">
            <Badge
              className="text-lg font-semibold px-4 py-1"
              variant={filial.ativo ? "default" : "destructive"}
            >
              {filial.ativo ? "Ativa" : "Inativa"}
            </Badge>

            {expandedFilial === filial.id ? (
              <ChevronUp className="w-7 h-7" />
            ) : (
              <ChevronDown className="w-7 h-7" />
            )}
          </div>
        </div>
      </CardHeader>

      {expandedFilial === filial.id && (
        <CardContent className="p-6 sm:p-8 space-y-8">

          {/* Botões Editar / Excluir */}
          <div className="flex gap-4">
            <Button
              className="text-lg font-bold px-6 py-3"
              onClick={(e) => {
                e.stopPropagation();
                setFormEdit({
                  id: filial.id,
                  nome: filial.nome,
                  endereco: filial.endereco,
                  cidade: filial.cidade,
                  estado: filial.estado,
                  ativo: filial.ativo,
                });
                setShowEditModal(true);
              }}
            >
              Editar
            </Button>

            <Button
              variant="destructive"
              className="text-lg font-bold px-6 py-3"
              onClick={(e) => {
                e.stopPropagation();
                setFilialToDelete(filial.id);
                setShowDeleteModal(true);
              }}
            >
              Excluir
            </Button>
          </div>

          {/* TABS */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList
              className="grid grid-cols-2 sm:grid-cols-4 w-full mb-8 gap-3 bg-transparent"
            >
              {["resumo", "financeiro", "estoque", "equipe"].map((name) => (
                <Button
                  key={name}
                  onClick={() => setTab(name)}
                  className={`
                    font-bold text-lg rounded-lg px-4 py-2 border shadow-sm
                    ${tab === name
                      ? "bg-primary text-white"
                      : "bg-primary text-white"
                    }
                  `}
                >
                  {name[0].toUpperCase() + name.slice(1)}
                </Button>
              ))}
            </TabsList>
            <br></br>

            {/* ------------------ RESUMO ------------------ */}
            <TabsContent value="resumo" className="space-y-6 px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* FATURAMENTO */}
                <div className="space-y-2">
                  <div className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <p className="font-semibold text-lg text-muted-foreground">Faturamento</p>
                  </div>
                  <h1 className="text-3xl font-bold">
                    R$ {safe(filial?.stats?.totalVendas, 0).toFixed(2)}
                  </h1>
                </div>

                {/* LUCRO */}
                <div className="space-y-2">
                  <div className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <p className="font-semibold text-lg text-muted-foreground">Lucro</p>
                  </div>
                  <p
                    className={`text-3xl font-bold ${
                      safe(filial?.stats?.lucro, 0) < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    R$ {safe(filial?.stats?.lucro, 0).toFixed(2)}
                  </p>
                </div>

                {/* FUNCIONARIOS */}
                <div className="space-y-2">
                  <div className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <p className="font-semibold text-muted-foreground">Funcionários</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {safe(filial?.stats?.funcionarios, 0)}
                  </p>
                </div>

                {/* CAIXAS */}
                <div className="space-y-2">
                  <div className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <p className="font-semibold text-muted-foreground">Caixas abertos</p>
                  </div>
                  <p className="text-3xl font-bold">
                    {safe(filial?.stats?.caixasAbertos, 0)}
                  </p>
                </div>

              </div>
            </TabsContent>

            {/* ------------------ FINANCEIRO ------------------ */}
            <TabsContent value="financeiro" className="space-y-4">
              <div className="grid gap-4">

                {[
                  ["Total de vendas", safe(filial?.stats?.totalVendas, 0)],
                  ["CMV", safe(filial?.stats?.totalCMV, 0)],
                  ["Despesas pendentes", safe(filial?.stats?.totalDespesas, 0)],
                ].map(([label, value], i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between"
                  >
                    <span className="font-bold text-xl">{label}</span>
                    <span
                      className={`text-2xl font-extrabold ${
                        label === "Despesas pendentes" ? "text-red-600" : ""
                      }`}
                    >
                      R$ {value.toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* LUCRO LÍQUIDO */}
                <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
                  <span className="font-bold text-xl">Lucro líquido</span>
                  <span
                    className={`text-2xl font-extrabold ${
                      safe(filial?.stats?.lucro, 0) < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    R$ {safe(filial?.stats?.lucro, 0).toFixed(2)}
                  </span>
                </div>

                {/* MARGEM */}
                <div className="flex flex-col sm:flex-row items-center p-4 border rounded-lg sm:justify-between">
                  <span className="font-bold text-xl">Margem de lucro</span>
                  <span className="text-2xl font-extrabold">
                    {safe(filial?.stats?.margemLucro, 0).toFixed(2)}%
                  </span>
                </div>

              </div>
            </TabsContent>

            {/* ------------------ ESTOQUE ------------------ */}
            <TabsContent value="estoque" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Produtos com estoque baixo</h3>
                <Badge variant="destructive" className="text-lg px-4 py-1">
                  {safe(filial?.stats?.estoqueBaixo, 0)} itens
                </Badge>
              </div>

              {(!filial?.detalhes?.estoqueBaixo ||
                filial.detalhes.estoqueBaixo.length === 0) ? (
                <p className="text-center text-muted-foreground text-lg py-8 font-semibold">
                  Nenhum produto com estoque baixo
                </p>
              ) : (
                <div className="space-y-3">
                  {filial.detalhes.estoqueBaixo.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 border rounded-lg bg-muted/20"
                    >
                      <div>
                        <p className="font-semibold text-xl">{item.produto}</p>
                        <p className="text-lg text-muted-foreground">
                          Mínimo: {item.estoque_minimo}
                        </p>
                      </div>

                      <Badge variant="destructive" className="text-lg px-4 py-1">
                        {item.quantidade} restantes
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-2xl font-bold mb-4">Pedidos pendentes</h3>

                {(!filial?.detalhes?.pedidosPendentes ||
                  filial.detalhes.pedidosPendentes.length === 0) ? (
                  <p className="text-center text-muted-foreground text-lg py-8 font-semibold">
                    Nenhum pedido pendente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filial.detalhes.pedidosPendentes.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="flex justify-between items-center p-4 border rounded-lg bg-muted/20"
                      >
                        <div>
                          <p className="text-xl font-bold">Pedido {pedido.id}</p>
                          <p className="text-lg text-muted-foreground font-semibold">
                            {new Date(pedido.data_pedido).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-1">
                          {pedido.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ------------------ EQUIPE ------------------ */}
            <TabsContent value="equipe" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold">Equipe</h3>
                <Badge className="text-lg font-semibold px-4 py-1">
                  {safe(filial?.stats?.funcionarios, 0)} funcionários
                </Badge>
              </div>

              {/* Funcionários */}
              <div className="space-y-3">
                {(!filial?.detalhes?.funcionarios ||
                  filial.detalhes.funcionarios.length === 0) ? (
                  <p className="text-lg text-muted-foreground font-semibold">
                    Nenhum funcionário cadastrado.
                  </p>
                ) : (
                  filial.detalhes.funcionarios.map((func) => (
                    <div
                      key={func.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <span className="text-xl font-semibold">{func.nome}</span>
                      </div>

                      <Badge variant="outline" className="text-lg px-4 py-1">
                        {func.perfil}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              {/* Caixas */}
              <div>
                <h3 className="text-3xl font-bold mb-4">Status dos caixas</h3>

                <div className="space-y-3">
                  {(!filial?.detalhes?.caixas ||
                    filial.detalhes.caixas.length === 0) ? (
                    <p className="text-muted-foreground text-lg font-semibold">
                      Nenhum caixa registrado.
                    </p>
                  ) : (
                    filial.detalhes.caixas.map((caixa) => (
                      <div
                        key={caixa.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="text-2xl font-bold">Caixa {caixa.id}</p>
                          <p className="text-lg text-muted-foreground font-semibold">
                            Saldo Inicial: R$ {safe(caixa.saldo_inicial, 0).toFixed(2)}
                          </p>
                          <p className="text-lg text-muted-foreground font-semibold">
                            Aberto em:{" "}
                            {caixa.data_abertura
                              ? new Date(caixa.data_abertura).toLocaleString("pt-BR")
                              : "-"}
                          </p>
                        </div>

                        <Badge
                          variant={
                            caixa.status === "ABERTO"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-lg px-4 py-1"
                        >
                          {caixa.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      )}
    </Card>
  ))}
</div>


      {/* ---------------- MODAIS ---------------- */}

      {/* CRIAR */}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Criar nova filial</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <Input className="text-xl font-semibold" placeholder="Nome" value={formCreate.nome} onChange={(e) => setFormCreate({ ...formCreate, nome: e.target.value })} />
            <Input className="text-xl font-semibold" placeholder="Endereço" value={formCreate.endereco} onChange={(e) => setFormCreate({ ...formCreate, endereco: e.target.value })} />
            <div className="flex gap-2">
              <Input className="text-xl font-semibold" placeholder="Cidade" value={formCreate.cidade} onChange={(e) => setFormCreate({ ...formCreate, cidade: e.target.value })} />
              <Input className="text-xl font-semibold" placeholder="Estado" value={formCreate.estado} onChange={(e) => setFormCreate({ ...formCreate, estado: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button className="text-lg font-bold" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <br></br>
            <Button className="text-lg font-bold"variant="destructive"  onClick={criarFilial}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDITAR */}

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-3xl font-bold">Editar filial</DialogTitle>
    </DialogHeader>

    {formEdit && (
      <div className="grid gap-4">
        <Input
          className="text-lg font-bold"
          value={formEdit.nome}
          onChange={(e) => setFormEdit({ ...formEdit, nome: e.target.value })}
          placeholder="Nome"
        />

        <Input
          className="text-lg font-bold"
          value={formEdit.endereco}
          onChange={(e) => setFormEdit({ ...formEdit, endereco: e.target.value })}
          placeholder="Endereço"
        />

        <div className="flex gap-2">
          <Input
            className="text-lg font-bold w-full"
            value={formEdit.cidade}
            onChange={(e) => setFormEdit({ ...formEdit, cidade: e.target.value })}
            placeholder="Cidade"
          />

          <Input
            className="text-lg font-bold w-40"
            value={formEdit.estado}
            onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.value })}
            placeholder="UF"
          />
        </div>

        {/* ATIVAR / DESATIVAR FILIAL */}
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-bold">
            <p className="text-xl font-semibold">Status:</p>
              {" "}
              {formEdit.ativo ? "Ativa" : "Inativa"}  
          </h1>

          <Button
            variant={formEdit.ativo ? "destructive" : "default"}
            className="text-lg font-bold px-4"
            onClick={() =>
              setFormEdit({ ...formEdit, ativo: !formEdit.ativo })
            }
          >
            {formEdit.ativo ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </div>
    )}

    <DialogFooter>
      <Button
        variant="destructive"
        className="text-lg font-bold"
        onClick={() => {
          setShowEditModal(false);
          setFormEdit(null);
        }}
      >
        Cancelar
      </Button>
      <br></br>
      <Button
        className="text-lg font-bold"
        onClick={() => atualizarFilial(formEdit.id, formEdit)}
      >
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* DELETAR */}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Confirmar exclusão</DialogTitle>
          </DialogHeader>

          <p className="text-xl font-semibold">Tem certeza que deseja excluir esta filial?</p>

          <DialogFooter>
            <Button className="text-lg font-bold" onClick={() => { setShowDeleteModal(false); setFilialToDelete(null); }}>Cancelar</Button>
            <br></br>
            <Button className="text-lg font-bold" variant="destructive" onClick={() => deletarFilial(filialToDelete)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <div className="flex justify-center p-5">
    
        <Button onClick={() => gerarPDF(filiais)} className="p-6 ml-4">
          <p className="font-bold text-lg p-5">Gerar PDF</p>
        </Button>
      </div>
    </div>
  );
}
