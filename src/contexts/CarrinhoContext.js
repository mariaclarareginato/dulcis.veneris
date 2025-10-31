// src/contexts/CarrinhoContext.js

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
// Por favor, garanta que seu helper de autenticação está neste caminho
import { getLoggedUser } from "@/lib/auth-client"; 

const CarrinhoContext = createContext();

export const useCarrinho = () => useContext(CarrinhoContext);

// Função auxiliar para analisar a resposta da API com segurança
const safeFetchJson = async (res) => {
    if (!res.ok) {
        let errorData = { 
            message: "Ocorreu um erro desconhecido no servidor.",
            status: res.status
        };
        try {
            errorData = await res.json(); 
        } catch (e) {
            // Se falhar (corpo vazio, ou não JSON), usa a mensagem genérica.
        }
        // Lança o erro com a mensagem mais informativa disponível
        throw new Error(errorData.message || errorData.error || errorData.details || errorData.details[0]?.message || errorData.message); 
    }
    // Tenta ler o JSON, mas retorna objeto vazio se o corpo for vazio (ex: 204 No Content)
    try {
        return await res.json();
    } catch (e) {
        return {};
    }
};


export function CarrinhoProvider({ children }) {
    const [carrinho, setCarrinho] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loadingProdutos, setLoadingProdutos] = useState(true);
    const [adicionandoId, setAdicionandoId] = useState(null);
    const [isFinalizandoVenda, setIsFinalizandoVenda] = useState(false); 


    // --- Lógica de Autenticação e Usuário ---
    useEffect(() => {
        const user = getLoggedUser();
        if (user) {
            setUserData(user);
        }
        setLoadingProdutos(false); 
    }, []);

    // --- Função para Buscar o Carrinho (Venda Aberta) ---
    const fetchCarrinho = useCallback(async (user = userData) => {
        if (!user) return;

        try {
            const res = await fetch(
                // Usa a sua rota de API que retorna {itens: [...], total: X}
                `/api/carrinho?usuarioId=${user.id}&lojaId=${user.loja_id}` 
            );
            const data = await safeFetchJson(res); 
            setCarrinho(data.itens || []);
        } catch (err) {
            console.error("Erro ao buscar carrinho:", err);
        }
    }, [userData]);

    useEffect(() => {
        if (userData) fetchCarrinho();
    }, [userData, fetchCarrinho]);


    // --- Cálculo do Total ---
    const total = useMemo(() => {
        // Recalcula o total a partir dos itens para garantir que o frontend esteja correto
        return carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    }, [carrinho]);

    
    // 🗑️ Reseta o carrinho (deve ser chamado APÓS a finalização da venda)
    const resetCarrinho = useCallback(async () => {
        if (!userData) {
            setCarrinho([]); // Limpa o estado local
            return; 
        }

        try {
            // Assume que você terá uma rota DELETE para limpar a venda aberta
            const res = await fetch(`/api/carrinho/limpar`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuarioId: userData.id,
                    lojaId: userData.loja_id,
                }),
            });
            await safeFetchJson(res); 
            setCarrinho([]); // Limpa o estado local após sucesso no backend
        } catch (err) {
            console.error("Erro ao limpar carrinho:", err);
            // Avisa o usuário, mas não reseta o estado local
            alert("Erro ao limpar carrinho após venda. Recarregue a tela do caixa."); 
        }
    }, [userData]);


    // 💰 Finaliza a venda (Chama o endpoint que registra no DB)
    const finalizarVenda = useCallback(async (tipoPagamento, detalhesPagamento) => {
        if (!userData || !carrinho.length) {
            throw new Error("Usuário ou carrinho inválido para finalização.");
        }
        
        const totalVenda = total; // Puxa o total calculado

        const payload = {
            caixaId: userData.caixa_id || null, // O caixa ID deve vir do userData
            usuarioId: userData.id, 
            lojaId: userData.loja_id,
            tipoPagamento: tipoPagamento, 
            valorTotal: totalVenda,
            detalhesPagamento: detalhesPagamento,
            // Mapeia os itens (o nome dos campos deve corresponder ao esperado pela API)
            itensCarrinho: carrinho.map(item => ({
                produto_id: item.produto_id || item.produto?.id || item.produtoId, // Adapte o acesso ao ID do produto
                quantidade: item.quantidade, 
                preco_unitario: item.preco_unitario || item.produto.preco_venda, 
            }))
        };
        
        setIsFinalizandoVenda(true);

        try {
            const res = await fetch('/api/venda/finalizar', { // Sua rota final de venda
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await safeFetchJson(res);
            
            if (data.codigoTransacao) {
                // SUCESSO! Limpa o carrinho e retorna o código da venda
                await resetCarrinho(); 
                return data.codigoTransacao;
            } else {
                throw new Error("Backend não retornou o código da transação.");
            }
        } catch (error) {
            throw new Error(error.message || "Falha ao processar pagamento e finalizar venda.");
        } finally {
            setIsFinalizandoVenda(false);
        }
    }, [userData, carrinho, total, resetCarrinho]);

    // As outras funções de carrinho (adicionar, remover, alterar quantidade) devem ser mantidas aqui...
    // ... (suas funções adicionarAoCarrinho, alterarQuantidade, removerDoCarrinho) ...
    // Eu as removi para manter este snippet focado, mas elas devem estar aqui.


    const value = {
        carrinho,
        total,
        userData, 
        adicionandoId,
        // ... (suas funções de manipulação de carrinho) ...
        fetchCarrinho, 
        loadingCarrinho: loadingProdutos,
        resetCarrinho, 
        finalizarVenda,
        isFinalizandoVenda,
    };

    return (
        <CarrinhoContext.Provider value={value}>
            {children}
        </CarrinhoContext.Provider>
    );
}