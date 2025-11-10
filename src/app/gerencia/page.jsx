"use client";

import { useEffect, useState } from "react";
import { getLoggedUser } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#dc2626", "#16a34a"]; // vermelho e verde

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

  const chartData = [
    { name: "Despesas", value: dados.totalDespesas ?? 0 },
    { name: "Lucro", value: dados.lucro ?? 0 },
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
            {dados.totalDespesas === 0 && dados.lucro === 0 ? (
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
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg flex flex-col justify-center items-center text-center py-8">
        
          <CardContent className="space-y-3 text-lg">
            <p>
              💸 <strong>Despesas:</strong> R$ {(dados.totalDespesas ?? 0).toFixed(2)}
            </p>
            <p>
              💰 <strong>Lucro:</strong> R$ {(dados.lucro ?? 0).toFixed(2)}
            </p>
            <p>
              📈 <strong>Margem de lucro:</strong>{" "}
              <span
                className={
                  (dados.margemLucro ?? 0) >= 0
                    ? "text-green-500 font-bold"
                    : "text-red-500 font-bold"
                }
              >
                {(dados.margemLucro ?? 0)}%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
