

"use client";
import { useEffect, useState, useMemo } from "react";
import { getLoggedUser } from "@/lib/auth-client";
import { money } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";


const COLORS = ["#16a34a", "#dc2626"];

export default function FinanceiroPage() {
  // --- estados principais ---
  const [user, setUser] = useState(null);
  const [despesas, setDespesas] = useState([]);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // --- modais e formulários ---
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

const [formCriar, setFormCriar] = useState({
  descricao: "",
  valor: "",
  data_vencimento: "",
  tipo: "FIXA", // padrão
});


  const [formEditar, setFormEditar] = useState({
    id: null,
    descricao: "",
    valor: "",
    data_vencimento: "",
    pago: false,
  });

  const [idExcluir, setIdExcluir] = useState(null);
  const [saving, setSaving] = useState(false); // usado para criar/editar/excluir

  // pegar usuário logado
  useEffect(() => {
    const u = getLoggedUser();
    if (u) setUser(u);
  }, []);

  // quando user chega, busca dados
  useEffect(() => {
    if (!user) return;
    (async () => {
      await fetchDespesas();
      await fetchFinanceiro();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // =========================
  // FETCHS
  // =========================
  async function fetchDespesas() {
    try {
      setLoading(true);
      const res = await fetch(`/api/despesas?lojaId=${user.loja_id}`);
      if (!res.ok) throw new Error("Erro ao buscar despesas");
      const data = await res.json();
      setDespesas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchDespesas:", err);
      setDespesas([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFinanceiro() {
    try {
      const res = await fetch(`/api/financeiro?lojaId=${user.loja_id}`);
      if (!res.ok) throw new Error("Erro ao buscar financeiro");
      const data = await res.json();
      setDados(data || null);
    } catch (err) {
      console.error("fetchFinanceiro:", err);
      setDados(null);
    }
  }

  // =========================
  // TOGGLE PAGAMENTO
  // =========================
  async function togglePagamento(id, statusAtual) {
    setUpdating(id);
    try {
      const res = await fetch("/api/despesas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pago: !statusAtual }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar pagamento");
      await fetchDespesas();
      await fetchFinanceiro();
    } catch (err) {
      console.error("togglePagamento:", err);
    } finally {
      setUpdating(null);
    }
  }

  // =========================
  // CRIAR DESPESA
  // =========================
 async function criarDespesa(nova) {
  try {
    if (!nova.descricao || !nova.valor || !nova.data_vencimento || !nova.tipo) {
      alert("Preencha todos os campos.");
      return;
    }

    setSaving(true);

    const payload = {
      lojaId: user.loja_id,
      descricao: nova.descricao,
      valor: Number(nova.valor),
      data_vencimento: nova.data_vencimento,
      tipo: nova.tipo, // <-- AGORA VAI!
    };

    const res = await fetch("/api/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erro ao criar despesa");

    setModalCriar(false);

    // resetar form
    setFormCriar({
      descricao: "",
      valor: "",
      data_vencimento: "",
      tipo: "FIXA",
    });

    // atualizar listas
    await fetchDespesas();
    await fetchFinanceiro();

  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    alert("Erro ao criar despesa.");
  } finally {
    setSaving(false);
  }
}


  // =========================
  // EDITAR DESPESA
  // =========================
  async function editarDespesa(dados) {
    try {
      if (!dados.id) {
        alert("ID faltando.");
        return;
      }
      if (!dados.descricao || !dados.valor || !dados.data_vencimento) {
        alert("Preencha todos os campos.");
        return;
      }

      setSaving(true);
      const payload = {
        id: dados.id,
        descricao: dados.descricao,
        valor: Number(dados.valor),
        data_vencimento: dados.data_vencimento,
        pago: dados.pago ?? false,
      };

      const res = await fetch("/api/despesas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao editar despesa");

      setModalEditar(false);
      setFormEditar({ id: null, descricao: "", valor: "", data_vencimento: "", pago: false });
      await fetchDespesas();
      await fetchFinanceiro();
    } catch (error) {
      console.error("Erro ao editar despesa:", error);
      alert("Erro ao editar despesa.");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // EXCLUIR DESPESA
  // =========================
  async function excluirDespesa(id) {
    try {
      if (!id) return;
      setSaving(true);
      const res = await fetch(`/api/despesas?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir despesa");
      setModalExcluir(false);
      setIdExcluir(null);
      await fetchDespesas();
      await fetchFinanceiro();
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      alert("Erro ao excluir despesa.");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // GERAR PDF
  // =========================
  async function gerarPDF() {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      // datas locais usadas aqui (definidas no momento da geração)
      const nomeMes = new Date().toLocaleString("pt-BR", { month: "long" });
      const anoAtual = new Date().getFullYear();

      function garantirEspaco(alturaNecessaria = 20) {
        const pageHeight = doc.internal.pageSize.height;
        const yAtual = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
        if (yAtual + alturaNecessaria > pageHeight - 20) {
          doc.addPage();
          return 30;
        }
        return yAtual + 15;
      }

      // logo (se existir)
      try {
        const logo = await fetch("/logos/logo2.png")
          .then((res) => res.blob())
          .then((blob) => convertBlobToBase64(blob));
        doc.addImage(logo, "PNG", 70, 10, 70, 40);
      } catch (err) {
        // se não achar logo, não quebra
        console.warn("Logo não adicionada:", err);
      }

      const titulo = `Painel Financeiro — ${
        nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
      } ${anoAtual}`;

      doc.setFontSize(18);
      doc.text(titulo, 105, 60, { align: "center" });

      doc.setFontSize(14);
      doc.text(`Loja: ${dados?.loja ?? ""}`, 105, 70, { align: "center" });

      autoTable(doc, {
        startY: 85,
        head: [["Item", "Valor"]],
        body: [
          ["Lucro", money(dados?.lucro ?? 0)],
          ["Despesas Pendentes", money(dados?.totalDespesasPendentes ?? 0)],
          ["CMV", money(dados?.totalCMV ?? 0)],
          ["Margem de Lucro", `${dados?.margemLucro ?? 0}%`],
        ],
        headStyles: { fillColor: [139, 0, 0] },
        styles: { fontSize: 11 },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 70 } },
      });

      let y = garantirEspaco(40);
      doc.setFontSize(14);
      doc.text("Despesas Fixas", 105, y, { align: "center" });

      autoTable(doc, {
        startY: y + 5,
        head: [["Descrição", "Valor", "Vencimento", "Status"]],
        body: despesas.map((d) => [
          d.descricao,
          money(d.valor),
          new Date(d.data_vencimento).toLocaleDateString(),
          d.pago ? "Pago" : "Pendente",
        ]),
        headStyles: { fillColor: [139, 0, 0] },
        styles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } },
        pageBreak: "auto",
      });

      doc.save(`financeiro-${nomeMes}-${anoAtual}.pdf`);
    } catch (err) {
      console.error("Erro gerarPDF:", err);
      alert("Erro ao gerar PDF.");
    }
  }

  // converter blob para base64 (usado pela geração de PDF)
  function convertBlobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // =========================
  // CALCULOS MEMO
  // =========================
  const totalDespesasPendentes = useMemo(
    () => despesas.filter((d) => !d.pago).reduce((acc, cur) => acc + Number(cur.valor), 0),
    [despesas]
  );

  const totalPago = useMemo(
    () => despesas.filter((d) => d.pago).reduce((acc, cur) => acc + Number(cur.valor), 0),
    [despesas]
  );

  const totalGeral = totalPago + totalDespesasPendentes;

  const chartData = [
    { name: "Lucro", value: dados?.lucro || 0 },
    { name: "Despesas", value: totalDespesasPendentes || 0 },
  ];

  const nomeMes = new Date().toLocaleString("pt-BR", { month: "long" });
  const anoAtual = new Date().getFullYear();

  // loading global
  if (loading || !dados)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-4 sm:p-8 space-y-8">
      <h1 className="text-3xl sm:text-3xl font-bold text-center p-4 sm:p-10 leading-tight">
        {dados.loja} — Painel Financeiro — {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} {anoAtual}
      </h1>

      {/* Gráfico + Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Gráfico */}
        <Card className="w-full bg-transparent rounded-xl backdrop-blur-md shadow-[0_0_35px_10px_rgba(0,0,0,.25)] dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)] transition-all duration-300 hover:scale-[1.01]">
          <CardHeader className="p-6">
            <CardTitle className="text-3xl m-5 font-bold">Lucro vs Despesas</CardTitle>
            <span className="text-xl font-semibold ml-5 text-muted-foreground">Distribuição financeira</span>
          </CardHeader>

          <CardContent className="pt-4">
            {dados.totalCMV === 0 ? (
              <div className="flex items-center font-semibold justify-center h-[250px] text-xl">Loja ainda sem vendas.</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value">
                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>

                  <Tooltip formatter={(v, n) => [money(v), n]} contentStyle={{ borderRadius: "12px", padding: "10px 16px", backdropFilter: "blur(6px)" }} />

                  <Legend verticalAlign="bottom" height={50} iconType="circle" formatter={(value) => <span className="font-semibold text-xl">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="w-full bg-transparent rounded-xl backdrop-blur-md shadow-[0_0_35px_10px_rgba(0,0,0,.25)] dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)] transition-all duration-300 hover:scale-[1.01]">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center mb-6">Resumo Financeiro</h2>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                <p className="text-lg font-semibold flex items-center gap-2">💰 Lucro</p>
                <p className={`text-3xl font-extrabold ${dados.lucro < 0 ? "text-red-500" : dados.lucro > 0 ? "text-green-600" : ""}`}>
                  R$ {Number(dados.lucro ?? 0).toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                <p className="text-lg font-semibold flex items-center gap-2">📉 Despesas Pendentes</p>
                <p className="text-3xl font-extrabold text-red-500 mt-1">{money(totalDespesasPendentes)}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                <p className="text-lg font-semibold flex items-center gap-2">📦 CMV (Custo por mercadoria vendida)</p>
                <p className="text-3xl font-extrabold mt-1">{money(dados.totalCMV ?? 0)}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                <p className="text-lg font-semibold flex items-center gap-2">📈 Margem de Lucro</p>
                <p className="text-3xl font-extrabold mt-1">{dados.margemLucro ?? 0}%</p>
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

      
      {/* botão adicionar */}
      <div className="flex justify-end">
        <Button onClick={() => setModalCriar(true)} className="m-4">
          + Nova Despesa
        </Button>
      </div>

      <Card>
        <CardContent>
          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3 m-5 text-lg">
            {despesas.map((d) => {
              const vencida = new Date(d.data_vencimento) < new Date() && !d.pago;
              return (
                <div key={d.id} className="border border-zinc-700 rounded-lg p-4">
                  <p>Descrição:</p> <strong>{d.descricao}</strong>
                  <p>Valor:</p> <strong>{money(d.valor)}</strong>
                  <p>Vencimento:</p> <strong>{new Date(d.data_vencimento).toLocaleDateString()}</strong>

                  <p className={`font-semibold text-lg mt-1 ${d.pago ? "text-green-600 dark:text-green-500" : vencida ? "text-red-500 dark:text-red-500" : "text-yellow-600 dark:text-yellow-500"}`}>
                    {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
                  </p>

            
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button onClick={() => { setFormEditar({ id: d.id, descricao: d.descricao, valor: d.valor, data_vencimento: d.data_vencimento, pago: d.pago }); setModalEditar(true); }}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => { setIdExcluir(d.id); setModalExcluir(true); }}>
                      Excluir
                    </Button>
                  </div>
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
                  const vencida = new Date(d.data_vencimento) < new Date() && !d.pago;
                  return (
                    <tr key={d.id}>
                      <td className="py-3 px-2 text-lg font-bold">{d.descricao}</td>
                      <td className="py-3 px-2 text-lg font-semibold">{money(d.valor)}</td>
                      <td className="py-3 px-2 text-lg font-semibold">{new Date(d.data_vencimento).toLocaleDateString()}</td>

                      <td className={`py-3 px-2 text-lg font-bold ${d.pago ? "text-green-600 dark:text-green-500" : vencida ? "text-red-500 dark:text-red-500" : "text-yellow-600 dark:text-yellow-500"}`}>
                        {d.pago ? "Pago" : vencida ? "Vencido" : "Pendente"}
                      </td>

                      <td className="py-3 px-2 flex gap-2">
            

                        <Button className="text-lg font-bold" onClick={() => { setFormEditar({ id: d.id, descricao: d.descricao, valor: d.valor, data_vencimento: d.data_vencimento, pago: d.pago }); setModalEditar(true); }}>
                          Editar
                        </Button>

                        <Button className="text-lg font-bold" variant="destructive" onClick={() => { setIdExcluir(d.id); setModalExcluir(true); }}>
                          Excluir
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

      {/* =========================
          MODAL CRIAR
         ========================= */}
      {modalCriar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h3 className="text-2xl font-bold">Adicionar Despesa</h3>

            <input className="w-full text-lg font-semibold p-2 rounded" placeholder="Descrição" value={formCriar.descricao} onChange={(e) => setFormCriar({ ...formCriar, descricao: e.target.value })} />
            <input className="w-full text-lg font-semibold p-2 rounded" placeholder="Valor" type="number" value={formCriar.valor} onChange={(e) => setFormCriar({ ...formCriar, valor: e.target.value })} />
            <input className="w-full text-lg font-semibold p-2 opacity-60 rounded" type="date" value={formCriar.data_vencimento} onChange={(e) => setFormCriar({ ...formCriar, data_vencimento: e.target.value })} />
                 <select
                  value={formCriar.tipo}
                  onChange={(e) => setFormCriar({ ...formCriar, tipo: e.target.value })}
                  className="w-full text-lg font-semibold opacity-60 p-2 border rounded"
                   >
                  <option  className="text-lg font-semibold bg-gray-400 text-gray-900" value="FIXA">Fixa</option>
                 <option   className="text-lg font-semibold bg-gray-400 text-gray-900"  value="VARIAVEL">Variável</option>
                  </select>

            <div className="flex justify-end gap-2">
              <Button className="text-lg font-bold" onClick={() => setModalCriar(false)}>Cancelar</Button>
              <Button className="text-lg font-bold" variant="destructive" onClick={() => criarDespesa(formCriar)} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL EDITAR
         ========================= */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h3 className="text-2xl font-bold">Editar Despesa</h3>

            <input className="text-m font-semibold w-full p-2 rounded" placeholder="Descrição" value={formEditar.descricao} onChange={(e) => setFormEditar({ ...formEditar, descricao: e.target.value })} />
            <input className="text-m font-semibold w-full p-2 rounded" placeholder="Valor" type="number" value={formEditar.valor} onChange={(e) => setFormEditar({ ...formEditar, valor: e.target.value })} />
            <input className="text-m font-semibold w-full p-2 rounded" type="date" value={formEditar.data_vencimento?.split("T")[0] ?? ""} onChange={(e) => setFormEditar({ ...formEditar, data_vencimento: e.target.value })} />

            <div className="flex gap-2 items-center">
            <input
            id="editarPago"
            type="checkbox"
            className="accent-red-500"
            checked={!!formEditar.pago}
            onChange={(e) =>
           setFormEditar({ ...formEditar, pago: e.target.checked })
           }
           />
           <label className="text-lg font-semibold" htmlFor="editarPago">Pago</label>
          </div>


            <div className="flex justify-end gap-2">
              <Button className="text-lg font-bold" onClick={() => setModalEditar(false)}>Cancelar</Button>
              <Button  className="text-lg font-bold"  variant="destructive" onClick={() => editarDespesa(formEditar)} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL EXCLUIR
         ========================= */}
      {modalExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h3 className="text-2xl font-bold text-center">Confirmar exclusão</h3>
            <p className="text-center text-lg">Tem certeza que deseja excluir esta despesa?</p>

            <div className="flex justify-center gap-3">
              <Button className="text-lg font-semibold" onClick={() => setModalExcluir(false)}>Cancelar</Button>
              <Button className="text-lg font-semibold" variant="destructive" onClick={() => excluirDespesa(idExcluir)} disabled={saving}>{saving ? "Excluindo..." : "Excluir"}</Button>
    

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
