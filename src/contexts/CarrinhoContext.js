
// src/contexts/CarrinhoContext.js

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
// Assumindo que seu helper de autenticação está neste caminho
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
            // Tenta ler o JSON de erro do backend
            errorData = await res.json(); 
        } catch (e) {
            // Se falhar (corpo vazio, ou não JSON), usa a mensagem genérica.
        }
        // Lança o erro com a mensagem mais informativa disponível
        throw new Error(errorData.message || errorData.error || errorData.details || errorData.message); 
    }
    // Se for 2xx, tenta ler o JSON (o corpo pode ser vazio se o backend retornar 204 No Content)
    try {
        return await res.json();
    } catch (e) {
        // Retorna um objeto vazio se não houver corpo (ex: DELETE bem-sucedido)
        return {};
    }
};


export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [adicionandoId, setAdicionandoId] = useState(null);

  // --- Lógica de Autenticação e Usuário ---
  useEffect(() => {
    const user = getLoggedUser();
    if (user) {
      setUserData(user);
    }
    // Remove o loading assim que a autenticação for resolvida (mesmo que sem usuário)
    setLoadingProdutos(false); 
  }, []);

  // --- Função para Buscar o Carrinho (reutilizável) ---
  const fetchCarrinho = useCallback(async (user = userData) => {
    if (!user) return;

    // Não precisamos de setLoading aqui, pois queremos que a busca seja rápida e não bloqueie a UI
    try {
      const res = await fetch(
        `/api/carrinho?usuarioId=${user.id}&lojaId=${user.loja_id}`
      );
      // Usando safeFetchJson para garantir que a resposta seja tratada corretamente
      const data = await safeFetchJson(res); 
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
      // Você pode optar por não mostrar um alerta aqui, apenas no console, para UX
    }
  }, [userData]);

  useEffect(() => {
    if (userData) fetchCarrinho();
  }, [userData, fetchCarrinho]);

  // --- Funções de Manipulação do Carrinho (Com lógica de API) ---

  // ➕ Adiciona produto ao carrinho
  const adicionarAoCarrinho = async (produto) => {
    if (!userData) return alert("Usuário não autenticado.");

    if (produto.quantidade <= 0) {
      alert("Produto sem estoque disponível!");
      return;
    }

    try {
      setAdicionandoId(produto.id);

      const res = await fetch(`/api/carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userData.id,
          lojaId: userData.loja_id,
          produtoId: produto.id,
          quantidade: 1, // Sempre adiciona 1 unidade
        }),
      });

      await safeFetchJson(res); // Trata a resposta e lança erro se houver
      
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      fetchCarrinho(); // Atualiza o estado global
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao adicionar produto");
    } finally {
      setAdicionandoId(null);
    }
  };

  // 🔄 Alterar quantidade
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) {
        await removerDoCarrinho(itemId);
        return;
    }

    try {
      const res = await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });

      await safeFetchJson(res);
      fetchCarrinho(); // Atualiza o estado global
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao atualizar quantidade");
    }
  };

  // ❌ Remover item
  const removerDoCarrinho = async (itemId) => {
    if (!window.confirm("Tem certeza que deseja remover este item?")) return;
    
    try {
      const res = await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      await safeFetchJson(res);
      fetchCarrinho(); // Atualiza o estado global
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao remover item");
    }
  };

  // --- Cálculo do Total ---
  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  const value = {
    carrinho,
    total,
    userData, 
    adicionandoId,
    adicionarAoCarrinho,
    alterarQuantidade,
    removerDoCarrinho,
    fetchCarrinho, 
    loadingCarrinho: loadingProdutos // Indica se a autenticação inicial terminou
  };

  return (
    <CarrinhoContext.Provider value={value}>
      {children}
    </CarrinhoContext.Provider>
  );
}