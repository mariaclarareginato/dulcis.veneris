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

  // Função para gerar pdf 

  async function gerarPDF() {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  // Logo
  const img = await fetch("/logos/logo2.png")
    .then((res) => res.blob())
    .then((blob) => convertBlobToBase64(blob));

  doc.addImage(img, "PNG", 70, 10, 70, 40);

  // Título
  doc.setFontSize(18);
  doc.text(
    `Painel Financeiro — ${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${anoAtual}`,
    105,
    60,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.text(`Loja: ${dados.loja}`, 105, 70, { align: "center" });

  // Tabela simples com resumo financeiro
  autoTable(doc, {
    startY: 85,
    head: [["Item", "Valor"]],
    body: [
      ["Lucro", money(dados.lucro)],
      ["Despesas Pendentes", money(dados.totalDespesasPendentes)],
      ["CMV", money(dados.totalCMV)],
      ["Margem de Lucro", `${dados.margemLucro}%`],
    ],
    headStyles: {
      fillColor: "darkred",
    }
  });

  // Tabela das despesas

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Descrição", "Valor", "Vencimento", "Status"]],
    body: despesas.map((d) => [
      d.descricao,
      money(d.valor),
      new Date(d.data_vencimento).toLocaleDateString(),
      d.pago ? "Pago" : "Pendente",
    ]),
    headStyles: {
      fillColor: "darkred",
    }
  });

  doc.save(`financeiro-${nomeMes}-${anoAtual}.pdf`);
}

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
        <Card className="w-full bg-transparent rounded-xl backdrop-blur-md
                       shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
                       dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
                       transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl m-3 font-bold">Lucro vs Despesas</CardTitle>
          </CardHeader>

            <CardContent>
            {(dados.totalCMV === 0) ? (
            <div className="flex items-center font-semibold justify-center h-[250px] text-lg">
             Loja ainda sem vendas. 
              </div>
              ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card  className="w-full bg-transparent rounded-xl backdrop-blur-md
                       shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
                       dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
                       transition-all duration-300">
          <CardContent className="text-center text-lg space-y-2 py-6">
           <b>💰 Lucro: </b><br></br> <p className="font-extrabold text-xl"> {money(dados.lucro)}</p>
            <b>📉 Despesas Pendentes: <br></br></b> <p className="font-extrabold text-xl"> {money(totalDespesasPendentes)}</p>
            <b>📦 CMV (Custo das Mercadorias Vendidas): <br></br></b> <p className="font-extrabold text-xl">{money(dados.totalCMV)}</p>
            <b>📈 Margem de Lucro: <br></br></b> <p  className="font-extrabold text-xl"> {dados.margemLucro}%</p>
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
    <div className="md:hidden space-y-3">
      {despesas.map((d) => {
        const vencida = new Date(d.data_vencimento) < new Date() && !d.pago;

        return (
          <div
            key={d.id}
            className={`border border-zinc-700 rounded-lg p-4 ${
              vencida ? "bg-red-900/20" : "bg-zinc-900/20"
            }`}
          >
            <p><b>Descrição:</b> {d.descricao}</p>
            <p><b>Valor:</b> {money(d.valor)}</p>
            <p><b>Vencimento:</b> {new Date(d.data_vencimento).toLocaleDateString()}</p>

            <p className={`font-semibold mt-1 ${
              d.pago
                ? "text-green-700"
                : vencida
                ? "text-red-700"
                : "text-yellow-700"
            }`}>
              {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
            </p>

            <Button
              className="mt-3 w-full"
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
    <div className="hidden md:block overflow-x-auto">
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
                <td className="py-3 px-2 text-lg">{money(d.valor)}</td>
                <td className="py-3 px-2 text-lg">
                  {new Date(d.data_vencimento).toLocaleDateString()}
                </td>

                <td
                  className={`py-3 px-2 text-lg font-semibold ${
                    d.pago
                      ? "text-green-500"
                      : vencida
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
                </td>

                <td className="py-3 px-2">
                  <Button
                    className="text-xs"
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
