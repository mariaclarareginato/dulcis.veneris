"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link" // importa o Link do Next.js

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFeedback(data.message || "Erro ao fazer login")
      } else {
        setFeedback("Login bem-sucedido!")

        // 🔹 redireciona de acordo com o perfil do usuário
        if (data.user.perfil === "CAIXA") {
          window.location.href = "/caixa"
        } else if (data.user.perfil === "GERENTE") {
          window.location.href = "/loja"
        } else if (data.user.perfil === "ADMIN") {
          window.location.href = "/matriz"
        }
      }
    } catch (err) {
      setFeedback("Erro de conexão com servidor")
    }
  }

  return (
    <Card className="w-[400px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
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

          <Button type="submit" className="w-full">Entrar</Button>
        </form>

        <p className="text-center mt-2 text-sm">
          Não tem uma conta?{" "}
          <Link href="/registro" className="text-blue-500 hover:underline">
            Registre-se
          </Link>
        </p>

        {feedback && (
          <p className="text-center mt-2 text-sm text-red-500">{feedback}</p>
        )}
      </CardContent>
    </Card>
  )
}
