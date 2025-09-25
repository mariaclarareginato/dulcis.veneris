// prisma.config.js
import { defineConfig } from "@prisma/config"

export default defineConfig({
  // Caminho para o schema principal
  schema: "./prisma/schema.prisma",

  // Geração do client Prisma
  generator: {
    client: {
      provider: "prisma-client-js",
      output: "./node_modules/@prisma/client",
    },
  },

  // Script de seed (em JS normal)
  seed: {
    command: "node prisma/seed.js",
  },
})
