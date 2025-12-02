"use client";
import { useEffect, useState, useMemo } from "react";
import { getLoggedUser } from "@/lib/auth-client";
import { money } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle, Clock } from "lucide-react";

const COLORS = ["#16a34a", "#dc2626"];

export default function FinanceiroPage() {
  const [user, setUser] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const u = getLoggedUser();
    if (u) setUser(u);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchDespesas();
    fetchFinanceiro();
  }, [user]);

  async function fetchDespesas() {
    setLoading(true);
    const res = await fetch(`/api/despesas?lojaId=${user.loja_id}`);
    const data = await res.json();
    setDespesas(data);
    setLoading(false);
  }

  async function fetchFinanceiro() {
    const res = await fetch(`/api/financeiro?lojaId=${user.loja_id}`);
    const data = await res.json();
    setDados(data);
  }

  async function togglePagamento(id, statusAtual) {
    setUpdating(id);
    try {
      await fetch("/api/despesas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pago: !statusAtual }),
      });

      await fetchDespesas();
      await fetchFinanceiro();
    } catch (err) {
      console.error(err);
    }
    setUpdating(null);
  }
// Função para gerar PDF
async function gerarPDF() {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  // =========================
  //  LOGO
  // =========================
  const logo = await fetch("/logos/logo2.png")
    .then((res) => res.blob())
    .then((blob) => convertBlobToBase64(blob));

  doc.addImage(logo, "PNG", 70, 10, 70, 40);

  // =========================
  //  CABEÇALHO / TÍTULO
  // =========================
  const titulo = `Painel Financeiro — ${
    nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
  } ${anoAtual}`;

  doc.setFontSize(18);
  doc.text(titulo, 105, 60, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Loja: ${dados.loja}`, 105, 70, { align: "center" });

  // =========================
  //  TABELA: RESUMO FINANCEIRO
  // =========================
  autoTable(doc, {
    startY: 85,
    head: [["Item", "Valor"]],
    body: [
      ["Lucro", money(dados.lucro)],
      ["Despesas Pendentes", money(dados.totalDespesasPendentes)],
      ["CMV", money(dados.totalCMV)],
      ["Margem de Lucro", `${dados.margemLucro}%`],
    ],
    headStyles: { fillColor: [139, 0, 0] }, // darkred
    styles: { fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 70 },
    },
  });

  // =========================
  //  TÍTULO DAS DESPESAS FIXAS
  // =========================

  doc.setFontSize(14);
  doc.text("Despesas Fixas", 105, doc.lastAutoTable.finalY + 15, { align: "center" });

  // =========================
  //  TABELA: DESPESAS
  // =========================
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Descrição", "Valor", "Vencimento", "Status"]],
    body: despesas.map((d) => [
      d.descricao,
      money(d.valor),
      new Date(d.data_vencimento).toLocaleDateString(),
      d.pago ? "Pago" : "Pendente",
    ]),
    headStyles: { fillColor: [139, 0, 0] }, // darkred
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
    },
  });


  doc.save(`financeiro-${nomeMes}-${anoAtual}.pdf`);
}

// Converter blob para base64 (para imagem funcionar)

function convertBlobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}




  const totalDespesasPendentes = useMemo(
    () => despesas.filter((d) => !d.pago).reduce((a, b) => a + Number(b.valor), 0),
    [despesas]
  );

  const totalPago = useMemo(
    () => despesas.filter((d) => d.pago).reduce((a, b) => a + Number(b.valor), 0),
    [despesas]
  );

  const totalGeral = totalPago + totalDespesasPendentes;

  const chartData = [
    { name: "Lucro", value: dados?.lucro || 0 },
    { name: "Despesas", value: totalDespesasPendentes || 0 },
  ];
 

  // Mês e dia atuais 

   const nomeMes = new Date().toLocaleString("pt-BR", { month: "long" });
    const anoAtual = new Date().getFullYear();


  // Carregando

  if (loading || !dados)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

   
  return (
    <div className="p-4 sm:p-8 space-y-8">
    <h1 className="text-3xl sm:text-3xl font-bold text-center p-4 sm:p-10 leading-tight">
  {dados.loja} — Painel Financeiro — {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} {anoAtual}
</h1>



    {/* Gráfico + Resumo */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

  {/* ======= CARD DO GRÁFICO ======= */}
  <Card className="w-full bg-transparent rounded-xl backdrop-blur-md
                   shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
                   dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
                   transition-all duration-300 hover:scale-[1.01]">

    <CardHeader className="p-6">
      <CardTitle className="text-3xl m-5 font-bold">Lucro vs Despesas</CardTitle>
      <span className="text-xl font-semibold ml-5 text-muted-foreground">Distribuição financeira</span>
    </CardHeader>

    <CardContent className="pt-4">
      {dados.totalCMV === 0 ? (
        <div className="flex items-center font-semibold justify-center h-[250px] text-xl">
          Loja ainda sem vendas.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              dataKey="value"
            >
              {chartData.map((e, i) => (
                <Cell key={i} fill={COLORS[i]}  />
              ))}
            </Pie>

            <Tooltip
              formatter={(v, n) => [money(v), n]}
              contentStyle={{
                borderRadius: "12px",
                padding: "10px 16px",
                backdropFilter: "blur(6px)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={50}
              iconType="circle"
              formatter={(value) => (
                <span className="font-semibold text-xl">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>



  {/* ======= CARD DO RESUMO ======= */}
  <Card 
    className="w-full bg-transparent rounded-xl backdrop-blur-md
               shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
               dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
               transition-all duration-300 hover:scale-[1.01]">
    
    <CardContent className="p-8">

      <h2 className="text-3xl font-bold text-center mb-6">
        Resumo Financeiro
      </h2>

      <div className="grid grid-cols-1 gap-6">

        {/* LUCRO */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md
                        border border-white/20 dark:border-white/10">
          <p className="text-lg font-semibold flex items-center gap-2">
            💰 Lucro
          </p>
          <p
                     className={`text-3xl font-extrabold ${
                    dados.lucro < 0
                   ? "text-red-500"
                   : dados.lucro > 0
                   ? "text-green-600"
                  : ""
                   }`}
                   >
                 R$ {dados.lucro.toFixed(2)}
                   </p>
        </div>

        {/* DESPESAS */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md
                        border border-white/20 dark:border-white/10">
          <p className="text-lg font-semibold flex items-center gap-2">
            📉 Despesas Pendentes
          </p>
          <p className="text-3xl font-extrabold text-red-500 mt-1">{money(totalDespesasPendentes)}</p>
        </div>

        {/* CMV */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md
                        border border-white/20 dark:border-white/10">
          <p className="text-lg font-semibold flex items-center gap-2">
            📦 CMV (Custo por mercadoria vendida)
          </p>
          <p className="text-3xl font-extrabold mt-1">{money(dados.totalCMV)}</p>
        </div>

        {/* MARGEM */}
        <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md
                        border border-white/20 dark:border-white/10">
          <p className="text-lg font-semibold flex items-center gap-2">
            📈 Margem de Lucro
          </p>
          <p className="text-3xl font-extrabold mt-1">{dados.margemLucro}%</p>
        </div>

      </div>
    </CardContent>
  </Card>

</div>

      {/* Totais rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-yellow-500 bg-transparent border text-yellow-500 text-center p-4">
          <CardTitle className="text-lg text-semibold">Despesas fixas pendentes:</CardTitle>
          <CardContent className="font-extrabold text-2xl">{money(totalDespesasPendentes)}</CardContent>
        </Card>
        <Card className="border-green-500 bg-tranparent border text-green-500 text-center p-4">
          <CardTitle className="text-lg text-semibold">Despesas fixas pagas:</CardTitle>
          <CardContent className="font-extrabold text-2xl">{money(totalPago)}</CardContent>
        </Card>
        <Card className="border-blue-500 border bg-transparent text-blue-500 text-center p-4">
          <CardTitle className="text-lg font-semibold">Total geral das despesas fixas:</CardTitle>
          <CardContent className="font-extrabold text-2xl">{money(totalGeral)}</CardContent>
        </Card>
      </div>

      {/* Tabela */}
<Card>
  <CardContent>

    {/* Mobile: Cards */}
    <div className="md:hidden space-y-3 m-5 text-lg">
      {despesas.map((d) => {
        const vencida = new Date(d.data_vencimento) < new Date() && !d.pago;

        return (
          <div
            key={d.id}
            className='border border-zinc-700 rounded-lg p-4'>
            <p>Descrição:</p> <strong>{d.descricao}</strong>
            <p>Valor:</p> <strong>{money(d.valor)}</strong>
            <p>Vencimento:</p> <strong>{new Date(d.data_vencimento).toLocaleDateString()}</strong>

            <p className={`font-semibold  text-lg mt-1 ${
              d.pago
                      ? "text-green-600 dark:text-green-500"
                      : vencida
                      ? "text-red-500 dark:text-red-500"
                      : "text-yellow-600 dark:text-yellow-500"
                  }`}>
              {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
            </p>

            <Button
              className="mt-3 w-full text-lg font-bold"
              onClick={() => togglePagamento(d.id, d.pago)}
              disabled={updating === d.id}
            >
              {updating === d.id ? (
                <Clock className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {d.pago ? "Marcar como pendente" : "Marcar como paga"}
                </>
              )}
            </Button>
          </div>
        );
      })}
    </div>



    {/* Desktop: Tabela normal */}
    
    <div className="hidden md:block overflow-x-auto ">
   
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-700 h-12">
            <th className="py-3 text-lg px-2">Descrição</th>
            <th className="py-3 text-lg px-2">Valor</th>
            <th className="py-3 text-lg px-2">Vencimento</th>
            <th className="py-3 text-lg px-2">Status</th>
            <th className="py-3 text-lg px-2">Ações</th>
          </tr>
        </thead>

        <tbody>
          {despesas.map((d) => {
            const vencida =
              new Date(d.data_vencimento) < new Date() && !d.pago;

            return (
              <tr
                key={d.id}

              >
                <td className="py-3 px-2 text-lg font-bold">{d.descricao}</td>
                <td className="py-3 px-2 text-lg font-semibold">{money(d.valor)}</td>
                <td className="py-3 px-2 text-lg font-semibold">
                  {new Date(d.data_vencimento).toLocaleDateString()}
                </td>

                <td
                  className={`py-3 px-2 text-lg font-bold ${
                    d.pago
                      ? "text-green-600 dark:text-green-500"
                      : vencida
                      ? "text-red-500 dark:text-red-500"
                      : "text-yellow-600 dark:text-yellow-500"
                  }`}
                >
                  {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
                </td>

                <td className="py-3 px-2">
                  <Button
                    className="text-lg font-bold"
                    onClick={() => togglePagamento(d.id, d.pago)}
                    disabled={updating === d.id}
                  >
                    {updating === d.id ? (
                      <Clock className="animate-spin h-4 w-4 font-bold text-lg" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-lg font-bold mr-2" />
                        {d.pago ? "Marcar como pendente" : "Marcar como paga"}
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  </CardContent>
</Card>

<div className="flex justify-center">
  <Button onClick={gerarPDF} className="p-7 text-lg font-bold">
    <p>Gerar PDF</p>
  </Button>
</div>

    </div>
  );
}
