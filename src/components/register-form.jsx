"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RegisterForm({ currentUser }) {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [perfil, setPerfil] = useState("CAIXA")
  const [lojaId, setLojaId] = useState("")
  const [lojas, setLojas] = useState([])
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    // Buscar lojas ativas para popular o select
    async function fetchLojas() {
      try {
        const res = await fetch("/api/lojas")
        const data = await res.json()
        setLojas(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchLojas()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, email, senha, perfil, lojaId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.message || "Erro ao registrar usuário")
      } else {
        setFeedback("Usuário criado com sucesso!")
        setNome("")
        setCpf("")
        setEmail("")
        setSenha("")
        setPerfil("CAIXA")
        setLojaId("")
      }
    } catch (err) {
      setFeedback("Erro de conexão com servidor")
    }
  }

  return (
    <Card className="w-[400px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Criar Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {/* Seleção de perfil */}
          <Select value={perfil} onValueChange={setPerfil}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              {currentUser.perfil === "ADMIN" && <SelectItem value="ADMIN">Admin</SelectItem>}
              {(currentUser.perfil === "ADMIN" || currentUser.perfil === "GERENTE") && <SelectItem value="GERENTE">Gerente</SelectItem>}
              <SelectItem value="CAIXA">Caixa</SelectItem>
            </SelectContent>
          </Select>

          {/* Seleção de loja - apenas para CAIXA e GERENTE */}
          {perfil !== "ADMIN" && (
            <Select
              value={lojaId}
              onValueChange={setLojaId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {lojas.map((loja) => (
                  <SelectItem key={loja.id} value={String(loja.id)}>
                    {loja.nome} - {loja.cidade}/{loja.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button type="submit" className="w-full">
            Criar
          </Button>
        </form>

        {feedback && (
          <p className="text-center mt-2 text-sm text-red-500">{feedback}</p>
        )}
      </CardContent>
    </Card>
  )
}
