"use client";

import RegisterForm from "@/components/register-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getLoggedUser } from "@/lib/auth-client"; 

export default function MatrizRegistroPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
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

    // Restrição: apenas ADMIN pode acessar esta página
    if (user.perfil !== "ADMIN") {
      router.push("/404"); // ou outra página de fallback
      return;
    }
  }, [router]);

  async function carregarUsuarios() {
    try {
      const res = await fetch(`/api/usuarios`);
      const data = await res.json();
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function excluirUsuario(id) {
    if (!confirm("Deseja realmente deletar este usuário?")) return;

    await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
    carregarUsuarios();
  }

  function abrirEdicao(user) {
    setEditandoId(user.id);
    setEditForm({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf || "",
      telefone: user.telefone || "",
    });
  }

  async function salvarEdicao(id) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setEditandoId(null);
    carregarUsuarios();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Voltar */}
      <div className="absolute left-10 top-20">
        <Button
          variant="ghost"
          onClick={() => router.push("/matriz")}
          className="rounded-full p-3 text-lg font-extrabold mt-40"
        >
          ←
        </Button>
      </div>

      {/* Form de criar usuário */}
      <RegisterForm />

      {/* LISTA DE USUÁRIOS */}
      <div className="mt-20 w-full max-w-3xl px-4 sm:px-0">
        <h2 className="text-3xl font-extrabold mb-6 text-center sm:text-left">
          Usuários cadastrados
        </h2>

        {usuarios.length === 0 ? (
          <p className="text-lg font-bold text-center mt-6">Nenhum usuário encontrado.</p>
        ) : (
          <div className="space-y-4">
            {usuarios.map((user) => (
              <div
                key={user.id}
                className="p-5 border rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                {/* Se NÃO está editando */}
                {editandoId !== user.id ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-2xl break-words">{user.nome}</p>
                      <p className="text-xl font-medium text-muted-foreground break-words">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex gap-3 self-end sm:self-center">
                      <Button
                        className="text-lg font-bold px-4 py-2"
                        onClick={() => abrirEdicao(user)}
                      >
                        Editar
                      </Button>

                      <Button
                        className="text-lg font-bold px-4 py-2"
                        variant="destructive"
                        onClick={() => excluirUsuario(user.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ) : (
                  // MODO DE EDIÇÃO INLINE
                  <div className="space-y-5">
                    <div>
                      <h1 className="font-semibold text-lg mb-1">Nome</h1>
                      <input
                        className="border text-lg font-semibold w-full p-3 rounded-xl focus:ring-2 focus:ring-red-800 outline-none"
                        value={editForm.nome}
                        onChange={(e) =>
                          setEditForm({ ...editForm, nome: e.target.value })
                        }
                        placeholder="Nome"
                      />
                    </div>

                    <div>
                      <h1 className="font-semibold text-lg mb-1">Email</h1>
                      <input
                        className="border text-lg font-semibold w-full p-3 rounded-xl focus:ring-2 focus:ring-red-800 outline-none"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <h1 className="font-semibold text-lg mb-1">CPF</h1>
                      <input
                        className="border text-lg font-semibold w-full p-3 rounded-xl focus:ring-2 focus:ring-red-800 outline-none"
                        value={editForm.cpf}
                        onChange={(e) =>
                          setEditForm({ ...editForm, cpf: e.target.value })
                        }
                        placeholder="CPF"
                      />
                    </div>

                    <div>
                      <h1 className="font-semibold text-lg mb-1">Telefone</h1>
                      <input
                        className="border w-full text-lg font-semibold p-3 rounded-xl outline-none"
                        value={editForm.telefone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, telefone: e.target.value })
                        }
                        placeholder="Telefone"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                      <Button
                        className="text-lg font-bold px-4 py-2"
                        onClick={() => setEditandoId(null)}
                      >
                        Cancelar
                      </Button>

                      <Button
                        variant="destructive"
                        className="text-lg font-bold px-4 py-2"
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
        )}
      </div>
    </div>
  );
}
