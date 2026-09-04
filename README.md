# Mis Finanzas

Aplicación de finanzas personales: sube capturas de pantalla de los
movimientos de tu cuenta bancaria, una IA (Claude) los extrae y sugiere una
categoría, y la app te permite organizarlos en "ramas" (categorías y
subcategorías) para llevar el control de tus gastos. Está pensada para ir
creciendo hacia el seguimiento de inversiones.

## Funcionalidades

- **Subir gasto**: arrastra una captura de tu app/web bancaria y la IA
  extrae fecha, descripción, comercio, importe y una categoría sugerida.
  Puedes revisar y corregir cada movimiento antes de guardarlo, y ves un
  aviso claro si falta configurar la clave de Anthropic.
- **Resumen**: gastos e ingresos del mes, progreso de tus presupuestos
  mensuales por categoría, gráfico de gastos por categoría y evolución
  mensual.
- **Movimientos**: listado filtrable por texto y categoría, edición
  completa en línea (fecha, descripción, importe y categoría), borrado y
  exportación a CSV.
- **Categorías**: gestiona el árbol de ramas y subramas de gasto/ingreso, y
  define un presupuesto mensual opcional por rama principal.
- **Inversión**: sección preparada para el futuro seguimiento de carteras.

## Stack técnico

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) con SQLite como base de datos
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) (Claude,
  con visión) para analizar las capturas de pantalla
- [Recharts](https://recharts.org) para los gráficos

## Puesta en marcha

1. Copia las variables de entorno y añade tu clave de la API de Anthropic:

   ```bash
   cp .env.example .env
   # Edita .env y rellena ANTHROPIC_API_KEY
   ```

   Puedes conseguir una clave en <https://console.anthropic.com/>.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea la base de datos y siembra las categorías por defecto:

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre <http://localhost:3000>.

## Scripts

- `npm run dev` – servidor de desarrollo
- `npm run build` / `npm run start` – build y arranque en producción
- `npm run lint` – linter
- `npm run db:seed` – vuelve a sembrar las categorías por defecto si la
  tabla está vacía
- `npx prisma studio` – explorador visual de la base de datos

## Notas

- El análisis de capturas requiere `ANTHROPIC_API_KEY`; sin ella, la
  subida de gastos fallará (el resto de la app funciona igual).
- La base de datos SQLite se guarda en `prisma/dev.db` y no se versiona en
  git.
