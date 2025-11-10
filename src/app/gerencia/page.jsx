"use client";

import { useEffect, useState } from "react";
import { getLoggedUser } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// CORES CORRIGIDAS: Verde (Lucro) no índice 0, Vermelho (Despesas) no índice 1
// Isso evita que, se Despesas vier primeiro, ele pegue o verde.
const COLORS = ["#16a34a", "#dc2626"]; // verde e vermelho

export default function FinanceiroPage() {
  const [dados, setDados] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getLoggedUser();
    if (user) {
      setUserData(user);
    } else {
      console.warn("Usuário não logado!");
    }
  }, []);

  useEffect(() => {
    if (!userData) return;

    // Assumindo que a API de financeiro agora retorna:
    // { loja: "Nome da Loja", totalDespesas: "X.XX", lucro: "Y.YY", margemLucro: "Z.ZZ" }
    fetch(`/api/financeiro?lojaId=${userData.loja_id}`)
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setDados(null));
  }, [userData]);

  if (!dados || dados.totalDespesas === undefined)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando dados financeiros...
      </div>
    );

  // --- Conversão de Decimal (String) para Float para cálculos e visualização ---

  const totalDespesas = parseFloat(dados.totalDespesas ?? 0);
  const lucro = parseFloat(dados.lucro ?? 0);
  const margemLucro = parseFloat(dados.margemLucro ?? 0);
    
  // A ordem foi invertida para seguir a ordem das cores (Lucro = Verde, Despesas = Vermelho)
  const chartData = [
    { name: "Lucro", value: lucro }, 
    { name: "Despesas", value: totalDespesas }, 
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-yellow-400">
        📊 Financeiro da Loja {dados.loja || "Não encontrada"}
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Despesas x Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            {totalDespesas === 0 && lucro === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Nenhum dado disponível ainda.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {/* A cor agora mapeia Lucro (Verde) e Despesas (Vermelho) */}
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`R$ ${value.toFixed(2)}`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg flex flex-col justify-center items-center text-center py-8">
          <CardContent className="space-y-3 text-lg">
            <p>
              💸 <strong>Despesas Operacionais:</strong> R$ {totalDespesas.toFixed(2)}
            </p>
            <p>
              💰 <strong>Lucro Líquido:</strong> R$ {lucro.toFixed(2)}
            </p>
            <p>
              📈 <strong>Margem de lucro:</strong>{" "}
              <span
                className={
                  margemLucro >= 0
                    ? "text-green-500 font-bold"
                    : "text-red-500 font-bold"
                }
              >
                {margemLucro.toFixed(2)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}