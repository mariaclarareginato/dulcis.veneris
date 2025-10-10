"use client"

import React, { use, useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function CategoriaPage({ params }) {
  const { categoria } = use(params) 
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/produtos")
      .then(res => res.json())
      .then(data => {
        setProdutos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const categoriaNormalizada = decodeURIComponent(categoria).toLowerCase()
  const produtosFiltrados = produtos.filter(
    (p) => p.categoria.toLowerCase() === categoriaNormalizada
  )

  if (loading) { 
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rouded-full animate-spin"></div>
      </div>
    ) 
  };


  if (produtosFiltrados.length === 0) {
    return <h2 className="text-2xl font-bold mb-6">
      Nenhum produto encontrado em "{categoria}"
    </h2>
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 capitalize">{categoria}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto) => (
          <Card key={produto.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{produto.nome}</CardTitle>
              <CardDescription>{produto.sku}</CardDescription>
            </CardHeader>
            <CardContent>
              {produto.img && (
                <div className="relative w-full h-72 mb-4">
                  <Image
                    src={produto.img}
                    alt={produto.nome}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                {produto.descricao || "Sem descrição"}
              </p>

              <div className="flex justify-between font-semibold">
                <span>Preço:</span>
                <span>R$ {produto.preco_venda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Custo:</span>
                <span>R$ {produto.custo.toFixed(2)}</span>
              </div>
              <br></br>
              <Button className="w-full" onClick={() => adicionarAoCarrinho(produto)}>
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
