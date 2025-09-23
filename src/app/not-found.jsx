export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-brown-50">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="mt-2 text-gray-600">
        Ops! Parece que você se perdeu no caminho.
      </p>

      <a
        href="/"
        className="mt-6 px-6 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
      >
        Voltar para Home
      </a>
    </div>
  )
}
