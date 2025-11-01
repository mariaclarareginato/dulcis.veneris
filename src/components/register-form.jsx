"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";


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

  // 🔹 Puxa as lojas do backend
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

  // 🔹 Atualiza os campos do formulário
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // 🔹 Envia o cadastro
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validação simples
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

    console.log("Form data:", form); // ✅ Debug: veja no console se está certo

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Importante: envia o token do login
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          cpf: form.cpf,
          telefone: form.telefone,
          perfil: form.perfil,
          loja_id: Number(form.lojaId), // backend espera "loja_id" número
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

   const inputClass = "w-full border rounded-lg px-3 py-2 font-semibold";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 rounded-2xl shadow-lg space-y-4"
      >
        <h1 className="text-4xl font-bold text-center mb-19 w-full">
          Registro de Usuário
        </h1>

        {error && (
          <p className="p-2 text-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="p-2 text-sm">
            {success}
          </p>
        )}


    <input
      type="text"
      name="nome"
      placeholder="Nome completo"
      value={form.nome}
      onChange={handleChange}
      className={inputClass}
    />

    <input
      type="text"
      name="cpf"
      placeholder="CPF"
      value={form.cpf}
      onChange={handleChange}
      className={inputClass}
    />

    <input
      type="text"
      name="telefone"
      placeholder="Telefone"
      value={form.telefone}
      onChange={handleChange}
      className={inputClass}
    />

    <input
      type="email"
      name="email"
      placeholder="E-mail"
      value={form.email}
      onChange={handleChange}
      className={inputClass}
    />

    <input
      type="password"
      name="senha"
      placeholder="Senha"
      value={form.senha}
      onChange={handleChange}
      className={inputClass}
    />

    <div className=" p-10">

    <DropdownMenu>
      <DropdownMenuTrigger className={inputClass + " flex justify-between items-center opacity-60"}>
        {form.perfil ? form.perfil : "Selecione o Perfil"}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border">
        {["CAIXA", "GERENTE", "ADMIN"].map((perfil) => (
          <DropdownMenuItem key={perfil} onClick={() => setForm({ ...form, perfil })}>
            {perfil.charAt(0) + perfil.slice(1).toLowerCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    <br></br>

    <DropdownMenu>
      <DropdownMenuTrigger className={inputClass + " flex justify-between items-center opacity-60"}>
        {form.lojaId ? lojas.find((l) => l.id === form.lojaId)?.nome : "Selecione a Loja"}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border overflow-y-auto">
        {lojas.map((loja) => (
          <DropdownMenuItem key={loja.id} onClick={() => setForm({ ...form, lojaId: Number(loja.id) })}>
            {loja.nome} - {loja.cidade}/{loja.estado}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    </div>




        <Button
          type="submit"
          className="w-full rounded-lg py-2 font-semibold transition"
        >
          Criar Usuário
        </Button>
      </form>
    </div>
  );
}
