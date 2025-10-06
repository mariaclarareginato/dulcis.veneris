export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-brown-50">

      {/* Imagem */}
      <img
      src="/logos/logo.png"

    />
      <h1 className="text-9xl font-extrabold text-red-500 drop-shadow-lg z-10 animate-bounce">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="mt-2 text-red-400 font-bold">
        Poxa! Parece que você se perdeu.
      </p>

      <a
        href="/"
        className="mt-6 px-6 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
      >
        Voltar para o Login
      </a>
    </div>
  )
}
