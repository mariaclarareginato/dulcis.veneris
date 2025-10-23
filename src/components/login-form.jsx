"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [feedback, setFeedback] = useState("")
  const router = useRouter() 

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback("")

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANTE: Adicionar 'credentials: "include"' é uma boa prática
        // quando você está enviando/recebendo cookies.
        // credentials: "include", 
        body: JSON.stringify({ email, senha }),
      })

      // data ainda contém { user: {...} } e a mensagem
      const data = await res.json() 

      if (!res.ok) {
        // A API de login corrigida deve enviar status 401 ou 404 em caso de falha.
        setFeedback(data.message || "Erro ao fazer login")
      } else {
        // 3. CORREÇÃO DE SESSÃO: REMOVIDO localStorage.setItem("token", data.token)
        // O token é salvo automaticamente pelo navegador via Set-Cookie do backend.
        
        // 4. NAVEGAÇÃO: O redirecionamento é seguro, pois o Cookie já está no navegador.
        if (data.user.perfil === "CAIXA") router.push("/caixa")
        else if (data.user.perfil === "GERENTE") router.push("/loja")
        else if (data.user.perfil === "ADMIN") router.push("/matriz")
        // Se o perfil não for reconhecido, redirecione para uma rota padrão ou login.
        else router.push("/caixa") 
      }
    } catch (err) {
      setFeedback("Erro de conexão com servidor")
    }
  }

  return (
    <div className="px-4">
      <Card className="w-full max-w-[400px] mx-auto mt-10 sm:p-8">
        <div className="justify-center flex">
          <img className="w-40 h-auto" src="logos/logo2.png" alt="Logo" />
        </div>

        <CardHeader>
          <CardTitle className="text-center text-red-500 font-bold text-[30px]">Bem vindo!</CardTitle>
          <CardDescription>
            Digite suas informações para acessar nosso site de caixa e gerenciamento de lojas:
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          <p className="text-center mt-2 text-sm">
            Não tem uma conta?{" "}
            <Link href="/registro" className="text-red-500 font-bold hover:underline">
              Registre-se
            </Link>
          </p>

          {feedback && (
            <p className="text-center mt-2 text-sm text-red-500">{feedback}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}