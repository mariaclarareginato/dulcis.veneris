import "dotenv/config"; // <-- Adicione esta linha no topo
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  generator: {
    client: {
      provider: "prisma-client-js",
      output: "./node_modules/@prisma/client",
    },
  },
  seed: {
    command: "node prisma/seed.js",
  },
});
