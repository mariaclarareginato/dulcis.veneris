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


// Status do ENUM (precisa ser definido no frontend também)
const STATUS_OPTIONS = ["PENDENTE", "EM_PROCESSAMENTO", "ENVIADO", "CANCELADO"];

// Mapeamento de cores para a UI
const STATUS_COLORS = {
    PENDENTE: "text-yellow-600 bg-yellow-100 border-yellow-300",
    EM_PROCESSAMENTO: "text-blue-600 bg-blue-100 border-blue-300",
    ENVIADO: "text-green-600 bg-green-100 border-green-300",
    CANCELADO: "text-red-600 bg-red-100 border-red-300",
};


export default function MatrizPedidosPage() {
    const router = useRouter();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    
    // Rastreia qual pedido está sendo atualizado no momento
    const [updatingId, setUpdatingId] = useState(null);


    // --- FUNÇÃO DE BUSCA DE PEDIDOS (Busca Todos) ---
    const fetchPedidos = async () => {
        setLoading(pedidos.length === 0); 
        setError(null);

        try {
            // Chama o endpoint GET /api/pedidos sem lojaId
            const res = await fetch(`/api/pedidos`); 

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro desconhecido ao buscar pedidos");
            }
            
            const data = await res.json();
            setPedidos(data);
        } catch (err) {
            console.error("Erro ao carregar pedidos:", err);
            toast.error("Falha ao carregar lista de pedidos.");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    // --- AUTENTICAÇÃO E CARREGAMENTO INICIAL ---
    useEffect(() => {
        const user = getLoggedUser();
        
        // **Verificação de Autorização**: Apenas ADMIN
        // Se a lógica de autenticação garante que apenas a Matriz acessa, ótimo.
        // Mas se a Matriz for identificada apenas pelo perfil 'ADMIN', a verificação é essencial.
        if (!user || user.perfil !== 'ADMIN') { 
            router.push("/");
            toast.error("Acesso restrito à Administração.");
            return;
        }
        
        setUserData(user);
        fetchPedidos(); // Inicia a busca
    }, [router]);


    // --- FUNÇÃO DE ATUALIZAÇÃO DE STATUS (Chama o PATCH) ---
    const handleUpdateStatus = async (pedidoId, novoStatus) => {
        if (!userData?.id) return; // Precisa do ID do usuário para a verificação no backend

        setUpdatingId(pedidoId);
        
        try {
            const response = await fetch(`/api/pedidos/${pedidoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: novoStatus,
                    usuario_id: userData.id 
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(`Falha ao atualizar: ${result.error || "Erro desconhecido"}`);
                throw new Error(result.error || "Falha ao enviar o pedido.");
            }

            toast.success(`Pedido #${pedidoId} atualizado para ${novoStatus}!`);
            
            // Atualiza o status na lista local
            setPedidos(prevPedidos => 
                prevPedidos.map(p => 
                    p.id === pedidoId ? { ...p, status: novoStatus } : p
                )
            );

        } catch (err) {
            console.error("Erro na atualização:", err);
        } finally {
            setUpdatingId(null);
        }
    };


    // --- Renderização de Carregamento/Erro ---
    if (loading && !pedidos.length) { 
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                <p className="text-lg">Carregando todos os pedidos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
                <p className="text-lg text-red-500">Erro: {error}</p>
                <Button onClick={fetchPedidos}>Tentar Novamente</Button>
            </div>
        );
    }

    // --- Renderização Principal ---
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mt-10 flex items-center gap-3">
                <List className="w-7 h-7" /> Painel de Pedidos da Matriz
            </h1>

            <small className="block font-semibold mt-1">
                Acesso **Matriz** | Perfil: **{userData?.perfil}** | Total de Pedidos: **{pedidos.length}**
            </small>

            {pedidos.length === 0 ? (
                <Card className="mt-8 border-dashed">
                    <CardContent className="py-10 text-center">
                        <p className="text-lg font-medium text-gray-500">
                            Nenhum pedido de estoque encontrado.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="mt-8 space-y-6">
                    {pedidos.map((pedido) => (
                        <Card key={pedido.id} className="shadow-lg">
                            <CardHeader className="flex flex-row items-start justify-between p-4 pb-2 bg-gray-50 border-b">
                                <div>
                                    <CardTitle className="text-xl">Pedido #**{pedido.id}**</CardTitle>
                                    <p className="text-sm text-gray-700 font-medium flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3"/> {new Date(pedido.data_pedido).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-700">
                                        Loja: {pedido.loja?.nome || `ID ${pedido.loja_id}`}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Solicitado por: {pedido.usuario?.nome || `ID ${pedido.usuario_id}`}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4 grid grid-cols-3 gap-4">
                                
                                {/* Coluna de Status */}
                                <div className="col-span-1 space-y-2">
                                    <Label>Atualizar Status</Label>
                                    <Select 
                                        value={pedido.status}
                                        onValueChange={(value) => handleUpdateStatus(pedido.id, value)}
                                        disabled={updatingId === pedido.id}
                                    >
                                        <SelectTrigger className={`w-full ${STATUS_COLORS[pedido.status]}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {updatingId === pedido.id && (
                                        <p className="text-xs text-blue-500 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin"/> Salvando...
                                        </p>
                                    )}
                                </div>

                                {/* Coluna de Itens */}
                                <div className="col-span-2">
                                    <h3 className="text-md font-semibold mb-1 flex items-center gap-1">
                                        <List className="w-4 h-4"/> Itens ({pedido.itens_pedido.length}):
                                    </h3>
                                    <ul className="list-none pl-0 text-sm space-y-1 max-h-24 overflow-auto border p-2 rounded-md bg-gray-50">
                                        {pedido.itens_pedido.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center text-gray-700 border-b last:border-b-0 py-0.5">
                                                <span className="truncate pr-2">
                                                    {item.produto_nome}
                                                </span>
                                                <span className="text-xs font-bold text-blue-600 flex-shrink-0">
                                                    Qtd: {item.quantidade}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}