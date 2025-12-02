"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client";
import { AlertCircle, List, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Status do ENUM
const STATUS_OPTIONS = ["PENDENTE", "EM_PROCESSAMENTO", "ENVIADO", "CANCELADO"];

export default function MatrizPedidosPage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPedidos = async () => {
    setLoading(pedidos.length === 0);
    setError(null);

    try {
      const res = await fetch(`/api/pedidos`);
      if (!res.ok) throw new Error("Erro ao buscar pedidos");

      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar pedidos.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getLoggedUser();
    if (!user || user.perfil !== "ADMIN") {
      router.push("/");
      toast.error("Acesso restrito à Administração.");
      return;
    }

    setUserData(user);
    fetchPedidos();
  }, [router]);

  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    if (!userData?.id) return;

    setUpdatingId(pedidoId);

    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: novoStatus,
          usuario_id: userData.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success(`Pedido ${pedidoId} atualizado para ${novoStatus}!`);

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
      );
    } catch (err) {
      console.error(err);
      toast.error("Falha ao atualizar status.");
    } finally {
      setUpdatingId(null);
    }
  };

  async function gerarPDFPedidos() {
    
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    
    doc.setFontSize(22);
    doc.text("Relatório de Pedidos da Matriz", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.text(`Total de Pedidos: ${pedidos.length}`, 105, 30, { align: "center" });
    
    
    const dataGeracao = new Date().toLocaleDateString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataGeracao}`, 200, 10, { align: "right" });

    const pedidosParaPDF = pedidos.map((p) => [
      p.id,
      p.status,
      new Date(p.data_pedido).toLocaleDateString(),
      p.loja?.nome || `ID ${p.loja_id}`,
      p.usuario?.nome || `ID ${p.usuario_id}`,
      p.itens_pedido.length,
      p.itens_pedido.map(item => `${item.produto_nome} (Qtd: ${item.quantidade})`).join('\n')
    ]);


    autoTable(doc, {
      startY: 40, 
      head: [
        [
          "ID",
          "Status",
          "Data",
          "Loja",
          "Solicitante",
          "Itens",
          "Detalhes dos Itens"
        ],
      ],
      body: pedidosParaPDF,
      headStyles: {
        fillColor: [139, 0, 0], 
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 2
      },
      columnStyles: {
          6: { cellWidth: 50 } 
      }
    });

   
    doc.save(`relatorio_pedidos_matriz_${new Date().getTime()}.pdf`);
  }

  if (loading && !pedidos.length)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-xl font-bold text-red-500">Erro: {error}</p>
        <Button className="font-bold text-lg" onClick={fetchPedidos}>
          Tentar Novamente
        </Button>
      </div>
    );



  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="text-4xl font-bold m-5 flex items-center gap-3">
        Painel de Pedidos da Matriz
      </div>

      <p className="text-muted-foreground sm:text-xl text-m font-semibold m-5">
        Acesso Matriz | Perfil: {userData?.perfil} | Total de Pedidos:{" "}
        {pedidos.length}
      </p>
      <br></br>

      {pedidos.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg font-medium">
              Nenhum pedido de estoque encontrado.
            </p>
          </CardContent>
        </Card>
      ) : (
        
        <div className="flex flex-col gap-30 w-full p-5">
          {pedidos.map((pedido) => (
            <Card
              key={pedido.id}
              className="w-full bg-transparent rounded-xl backdrop-blur-md
                       shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
                       dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
                       transition-all duration-300"
            >
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Pedido {pedido.id}
                  </CardTitle>
                  <p className="gap-2 text-lg font-medium flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date(pedido.data_pedido).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-lg font-semibold">
                    Loja:{" "}
                    <strong>{pedido.loja?.nome || `ID ${pedido.loja_id}`}</strong>
                  </p>
                  <p className="text-lg font-semibold">
                    Endereço: <strong>{pedido.loja?.endereco}</strong>
                  </p>
                  <p className="text-lg font-semibold">
                    Solicitado por:{" "}
                    <strong>
                      {pedido.usuario?.nome || `ID ${pedido.usuario_id}`}
                    </strong>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-4 grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-base text-lg font-semibold">
                    Atualizar Status
                  </Label>

                  <br></br>

                  <Select
                    value={pedido.status}
                    onValueChange={(value) =>
                      handleUpdateStatus(pedido.id, value)
                    }
                    disabled={updatingId === pedido.id}
                  >
                    <SelectTrigger className="font-bold text-lg">
                      <SelectValue placeholder={pedido.status} />
                    </SelectTrigger>

                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="font-bold text-lg"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {updatingId === pedido.id && (
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Loader2 className="w-6 h-6 animate-spin" /> 
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <h3 className="text-2xl sm:text-2xl font-bold flex items-center gap-1">
                    <List className="w-5 h-5" /> Itens (
                    {pedido.itens_pedido.length})
                  </h3>

                  <ul className="text-lg sm:text-lg font-semibold divide-y">
                    {pedido.itens_pedido.map((item, index) => (
                      <li key={index} className="py-1 flex gap-5 justify-between">
                        <span>{item.produto_nome}</span>

                        <span className="m-5">
                          Quantidade: <strong>{item.quantidade}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          
          ))}
               <div className="flex justify-center mt-10">
  <Button  className="p-6" onClick={gerarPDFPedidos}>
    <h1 className="font-bold text-lg">Gerar PDF dos seu pedidos</h1>
  </Button>
</div>
        </div>
      )}
    </div>
  );
}
