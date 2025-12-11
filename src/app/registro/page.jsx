"use client";

import RegisterForm from "@/components/register-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLoggedUser } from "@/lib/auth-client"; 

export default function RegistroPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
  });

  //  Verifica login e perfil
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Restrição: apenas GERENTE pode acessar esta página
    if (user.perfil !== "GERENTE") {
      router.push("/404"); // redireciona se não for GERENTE
      return;
    }

    setUserData(user);
  }, [router]);

  //  Função real de buscar usuários
  async function fetchUsuarios() {
    if (!userData) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/usuarios/caixas?lojaId=${userData.loja_id}`);
      if (!res.ok) throw new Error("Erro ao buscar usuários");

      const data = await res.json();

      setUsuarios(Array.isArray(data) ? data : data.usuarios || []);
    } catch (e) {
      setError("Erro ao carregar dados dos usuários");
    } finally {
      setLoading(false);
    }
  }

  //  Busca usuários quando userData carregar
  useEffect(() => {
    fetchUsuarios();
  }, [userData]);

  //  Excluir usuário
  async function excluirUsuario(id) {
    if (!confirm("Deseja realmente deletar este usuário?")) return;

    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    fetchUsuarios();
  }

  //  Abrir edição
  function abrirEdicao(user) {
    setEditandoId(user.id);
    setEditForm({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf || "",
      telefone: user.telefone || "",
    });
  }

  //  Salvar edição
  async function salvarEdicao(id) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setEditandoId(null);
    fetchUsuarios();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      
      {/* ⬅ Botão voltar */}
      <div className="absolute left-10 top-20">
        <Button
          variant="ghost"
          onClick={() => router.push("/gerencia")}
          className="rounded-full p-3 text-lg font-extrabold mt-40"
        >
          ←
        </Button>
      </div>
      
      <h1 className="mt-13 font-bold text-lg">
        <p className="font-extrabold text-2xl text-center">Atenção!</p>
        Gerentes só podem criar e gerenciar caixas.
      </h1>

      {/* Form criar usuário */}
      <RegisterForm />

      {/* LISTA DE USUÁRIOS */}
      <div className="mt-20 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4">Caixas cadastrados</h2>

        {loading && 
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
          </div>
        }

        {error && <p className="text-red-600">{error}</p>}

        {!loading && usuarios.length === 0 && !error && (
          <p className="font-bold text-center text-lg mt-6">Nenhum usuário encontrado.</p>
        )}

        <div className="space-y-3">
          {usuarios.map((user) => (
            <div key={user.id} className="sm:p-4 p-3 border rounded-xl shadow">
              {editandoId !== user.id ? (
                //  MODO NORMAL
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xl">{user.nome}</p>
                    <p className="text-m font-semibold">{user.email}</p>
                  </div>

                  <div className="flex gap-2 m-3">
                    <Button className="text-md font-bold" onClick={() => abrirEdicao(user)}>
                      Editar
                    </Button>

                    <Button
                      className="text-md font-bold"
                      variant="destructive"
                      onClick={() => excluirUsuario(user.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : (
                //  MODO DE EDIÇÃO
                <div className="space-y-3">
                  <h1 className="font-semibold text-lg">Nome</h1>
                  <input
                    className="border text-lg font-semibold w-full p-2 rounded"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />

                  <h1 className="font-semibold text-lg">Email</h1>
                  <input
                    className="border text-lg font-semibold w-full p-2 rounded"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />

                  <h1 className="font-semibold text-lg">CPF</h1>
                  <input
                    className="border text-lg font-semibold w-full p-2 rounded"
                    value={editForm.cpf}
                    onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                  />

                  <h1 className="font-semibold text-lg">Telefone</h1>
                  <input
                    className="border text-lg font-semibold w-full p-2 rounded"
                    value={editForm.telefone}
                    onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                  />

                  <div className="flex mt-3 gap-2 justify-end">
                    <Button className="text-lg font-bold" onClick={() => setEditandoId(null)}>
                      Cancelar
                    </Button>

                    <Button
                      variant="destructive"
                      className="text-lg font-bold"
                      onClick={() => salvarEdicao(user.id)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
