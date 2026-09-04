import "dotenv/config";
import { defineConfig } from "prisma/config";

// No usamos el helper `env()` de Prisma aquí porque valida y lanza en el
// momento en que se carga este archivo, incluso para comandos como
// `prisma generate` que no necesitan conexión a la base de datos (esto
// rompía el paso `postinstall` en Vercel antes de que las variables de
// entorno del build estuvieran disponibles). `migrate`/`db seed` sí fallan
// igualmente, y con un error claro, si DATABASE_URL falta cuando de verdad
// hace falta conectar.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
