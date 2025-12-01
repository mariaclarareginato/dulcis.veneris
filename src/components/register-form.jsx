"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    telefone: "",
    perfil: "",
    lojaId: null,
  });

  const [lojas, setLojas] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchLojas() {
      try {
        const res = await fetch("/api/lojas", { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setLojas(data);
        } else {
          console.error("Erro ao buscar lojas:", data.message);
        }
      } catch (err) {
        console.error("Erro ao carregar lojas:", err);
      }
    }
    fetchLojas();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.nome ||
      !form.email ||
      !form.senha ||
      !form.cpf ||
      !form.telefone ||
      !form.perfil ||
      !form.lojaId
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          cpf: form.cpf,
          telefone: form.telefone,
          perfil: form.perfil,
          loja_id: Number(form.lojaId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao criar usuário.");
      }

      setSuccess("Usuário criado com sucesso!");
      setForm({
        nome: "",
        email: "",
        senha: "",
        cpf: "",
        telefone: "",
        perfil: "",
        lojaId: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  const inputClass = "w-full border text-lg bg-transparent rounded-lg px-3 py-2 font-semibold";

  return (
    <div className="flex flex-col mt-20 items-center justify-center min-h-screen px-4">
      
      <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
        
        <CardHeader>
          <br></br>
          <CardTitle className="text-center text-3xl font-bold">
            Registro de Usuário
          </CardTitle>
          <CardDescription className="text-center text-lg font-semibold m-4">
            Preencha os dados para criar um novo usuário no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <p className="p-2 text-sm text-red-500 text-center font-bold">
                {error}
              </p>
            )}

            {success && (
              <p className="p-2 text-lg text-green-600 dark:text-green-500 text-center font-bold">
                {success}
              </p>
            )}

            <Input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
              className={inputClass}
            />

            <Input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={form.cpf}
              onChange={handleChange}
              className={inputClass}
            />

            <Input
              type="text"
              name="telefone"
              placeholder="Telefone"
              value={form.telefone}
              onChange={handleChange}
              className={inputClass}
            />

            <Input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />

            <Input
              type="password"
              name="senha"
              placeholder="Senha"
              value={form.senha}
              onChange={handleChange}
              className={inputClass}
            />

            {/* PERÍODO - DROPDOWNS */}
            <div className="mt-6">

              {/* PERFIL */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`${inputClass} flex justify-between items-center opacity-60`}
                >
                  {form.perfil || "Selecione o Perfil"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {["CAIXA", "GERENTE", "ADMIN"].map((perfil) => (
                    <DropdownMenuItem
                      key={perfil}
                      onClick={() => setForm({ ...form, perfil })}
                      className="text-lg font-semibold"
                    >
                      {perfil}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <br />

              {/* LOJA */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`${inputClass} flex justify-between items-center opacity-60`}
                >
                  {form.lojaId
                    ? lojas.find((l) => l.id === form.lojaId)?.nome
                    : "Selecione a Loja"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="max-h-48 text-lg font-semibold overflow-y-auto">
                  {lojas.map((loja) => (
                    <DropdownMenuItem
                      key={loja.id}
                      className="text-lg font-semibold"
                      onClick={() =>
                        setForm({ ...form, lojaId: Number(loja.id) })
                  
                      }
                    >
                      {loja.nome} - {loja.cidade}/{loja.estado}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button type="submit" className="w-full text-lg font-bold p-6 mt-6">
              Criar Usuário
            </Button>
          </form>
        </CardContent>
        <br></br>
      </Card>

    </div>
  );
}
