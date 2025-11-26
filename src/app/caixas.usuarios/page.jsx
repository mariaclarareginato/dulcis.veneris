"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client";
import {
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UsuariosPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Autenticação
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // Busca de usuários
  useEffect(() => {
    if (!userData) return;

    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/usuarios/stats?lojaId=${userData.loja_id}`
        );
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const data = await res.json();
        setUsuarios(data);
      } catch {
        setError("Erro ao carregar dados dos usuários");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [userData]);


  // Função para gerar pdf

  async function gerarPDF() {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  // Logo
  const img = await fetch("/logos/logo2.png")
    .then((res) => res.blob())
    .then((b) => convertBlobToBase64(b));

  doc.addImage(img, "PNG", 70, 10, 70, 40);

  // Título
  doc.setFontSize(18);
  doc.text(
    `Desempenho dos Caixas — ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${anoAtual}`,
    105,
    60,
    { align: "center" }
  );

  // Totais
  autoTable(doc, {
    startY: 80,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de Vendas", totais.vendas],
      ["Faturamento Total", `R$ ${totais.faturamento.toFixed(2)}`],
      ["Lucro Total", `R$ ${totais.lucro.toFixed(2)}`],
    ],
    headStyles: {
      fillColor: "darkred",
  
    }
  });

  // Tabela usuários
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Nome", "Email", "Vendas", "Faturamento", "Lucro"]],
    body: usuarios.map((u) => [
      u.nome,
      u.email,
      u.stats.numeroVendas,
      `R$ ${u.stats.totalVendas.toFixed(2)}`,
      `R$ ${u.stats.lucro.toFixed(2)}`,
    ]),
    headStyles: {
      fillColor: "darkred",
    }
  });

  doc.save(`desempenhocaixas-${nomeMes}-${anoAtual}.pdf`);
}

function convertBlobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Mês e ano atuais

const nomeMes = new Date().toLocaleString("pt-BR", { month: "long" });
const anoAtual = new Date().getFullYear();


  // Estados de carregamento e erro
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
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  // Cálculos totais
  const totais = usuarios.reduce(
    (acc, usuario) => ({
      vendas: acc.vendas + usuario.stats.numeroVendas,
      faturamento: acc.faturamento + usuario.stats.totalVendas,
      lucro: acc.lucro + usuario.stats.lucro,
    }),
    { vendas: 0, faturamento: 0, lucro: 0 }
  );

  // Render principal
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 md:items-center ">
        <div>
          <h1 className="text-3xl font-bold">Desempenho dos Caixas</h1>
          <p className="text-muted-foreground mt-2 text-lg font-semibold">
            Acompanhe o desempenho dos seus caixas e registre novos usuários
          </p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => router.push("/registro")}>
          <strong className="font-bold">Registrar novo usuário</strong>
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.vendas}</div>
            <p className="text-sm text-muted-foreground">vendas finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {Number(totais.faturamento).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">em vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totais.lucro.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">lucro líquido</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      {usuarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            
            <p className="text-lg font-semibold">Nenhum operador encontrado</p>
            <p className="text-muted-foreground">Registre novos usuários</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {usuarios.map((usuario, index) => (
            <Card
              key={usuario.id}
              className="hover:shadow-lg text-3xl transition-shadow p-4"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div> 
                      <CardTitle className="text-xl font-bold">{usuario.nome}</CardTitle>
                      <CardDescription className="mt-1 text-lg">
                        {usuario.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      index === 0
                        ? "bg-yellow-500 font-bold text-black text-lg"
                        : index === 1
                        ? "bg-gray-400 font-bold text-black text-lg"
                        : index === 2
                        ? "bg-amber-600 text-black font-bold text-lg"
                        : "bg-gray-200 text-black font-bold text-lg"
                    }
                  >
                    {index === 0
                      ? "🥇 1º Lugar"
                      : index === 1
                      ? "🥈 2º Lugar"
                      : index === 2
                      ? "🥉 3º Lugar"
                      : `#${index + 1}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" /> Vendas
                    </p>
                    <p className="text-2xl font-bold">
                      {usuario.stats.numeroVendas}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> Faturamento
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {Number(usuario.stats.totalVendas).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Lucro
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {Number(usuario.stats.lucro).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      R$ {Number(usuario.stats.ticketMedio).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (usuario.stats.totalVendas / totais.faturamento) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(
                      (usuario.stats.totalVendas / totais.faturamento) *
                      100
                    ).toFixed(1)}
                    % do faturamento total
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-10">
  <Button onClick={gerarPDF}>
    <h1 className="font-bold">Gerar PDF</h1>
  </Button>
</div>

    </div>
  );
}
