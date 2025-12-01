"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"


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
 // credentials: "include", // Boas práticas para lidar com cookies
 body: JSON.stringify({ email, senha }),
})

 // data ainda contém { user: {...} } e a mensagem
const data = await res.json()

if (!res.ok) {
 setFeedback(data.message || "Erro ao fazer login")
} else {
 //  Salvar os dados do usuário no sessionStorage
        // O token é salvo via Cookie HTTP pelo backend. 
        // Salvamos 'user' aqui para que getLoggedUser() possa recuperar os dados no front.
        sessionStorage.setItem('user', JSON.stringify(data.user)); 

 // NAVEGAÇÃO: O Cookie (token) e o SessionStorage (user) agora estão presentes.
if (data.user.perfil === "CAIXA") router.push("/caixa")
else if (data.user.perfil === "GERENTE") router.push("/gerencia")
else if (data.user.perfil === "ADMIN") router.push("/matriz")
 else router.push("/caixa")
 }
} catch (err) {
 setFeedback("Erro de conexão com servidor")
 }
}

 return (
<div className="">
  <Card
   className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300"
  >
    <br></br>
    <div className="flex justify-center items-center">
      <img className="w-60" src="logos/logo2.png" alt="Logo" />
    </div>

    <CardHeader className="text-center">
      <CardTitle className="dark:text-red-700 text-red-900 font-bold text-5xl italic">
        Bem vindo!
      </CardTitle>
      <CardDescription className="text-xl w-full font-semibold mt-5">
        Digite suas informações para acessar o sistema gerenciador das nossas filiais, matriz e caixas:
      </CardDescription>
    </CardHeader>
    <br></br>

    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          className="font-bold text-lg"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          className="font-bold text-lg"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            className="w-full font-bold text-lg"
          >
            Entrar
          </Button>
        </div>
      </form>

      {feedback && (
        <p className="text-center mt-3 text-lg font-semibold text-red-500">
          {feedback}
        </p>
      )}
      <br></br>
    </CardContent>
  </Card>
</div>

 )
}