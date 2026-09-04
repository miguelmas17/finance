# Mis Finanzas

Aplicación de finanzas personales: sube capturas de pantalla de los
movimientos de tu cuenta bancaria, una IA (Claude) los extrae y sugiere una
categoría, y la app te permite organizarlos en "ramas" (categorías y
subcategorías) para llevar el control de tus gastos. Está pensada para ir
creciendo hacia el seguimiento de inversiones.

Usa una única base de datos compartida (no una por dispositivo), para que
veas los mismos movimientos tanto si subes la captura desde el móvil como
desde el PC.

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
- Interfaz responsive, pensada para usarse igual de bien desde el móvil
  (donde subirás las capturas) que desde el PC.

## Stack técnico

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) con PostgreSQL como base de datos
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) (Claude,
  con visión) para analizar las capturas de pantalla
- [Recharts](https://recharts.org) para los gráficos

## Puesta en marcha en local (desarrollo)

Necesitas acceso a una base de datos PostgreSQL (puede ser local o ya la
misma de Neon que uses en producción, ver más abajo).

1. Copia las variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Rellena `ANTHROPIC_API_KEY` (consíguela en
   <https://console.anthropic.com/>) y `DATABASE_URL` con tu cadena de
   conexión de Postgres.

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea las tablas y siembra las categorías por defecto:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre <http://localhost:3000>.

## Desplegar en producción (acceso desde cualquier dispositivo)

Para usar la app desde el móvil y el PC sin depender de tu ordenador
encendido, despliega la base de datos y la app en la nube. Las dos partes
tienen plan gratuito y no requieren tarjeta de crédito para este uso:

### 1. Base de datos: Neon (PostgreSQL gratis)

1. Crea una cuenta en <https://neon.tech> (puedes entrar con GitHub).
2. Crea un proyecto nuevo. Neon te da una cadena de conexión del tipo:
   `postgresql://usuario:contraseña@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Guarda esa cadena — es tu `DATABASE_URL` de producción.

### 2. App: Vercel

1. Crea una cuenta en <https://vercel.com> (puedes entrar con GitHub) e
   importa este repositorio (`miguelmas17/finance`).
2. En la configuración del proyecto, añade las variables de entorno:
   - `DATABASE_URL`: la cadena de conexión de Neon del paso anterior.
   - `ANTHROPIC_API_KEY`: tu clave de la API de Anthropic.
3. Despliega. El propio build de Vercel ejecuta
   `prisma migrate deploy` automáticamente (ver el script `build` en
   `package.json`), así que las tablas se crean solas en cada despliegue —
   no hace falta ejecutar nada a mano ni tener Node instalado en ningún
   sitio para esto. Al terminar, Vercel te da una URL pública (tipo
   `https://finance-tuusuario.vercel.app`) accesible desde cualquier
   dispositivo.

### 3. Sembrar las categorías por defecto (solo la primera vez)

Las categorías iniciales sí hay que crearlas una vez, desde un entorno con
acceso a la base de datos (tu ordenador, no sirve este sandbox de
Claude Code). Con `DATABASE_URL` apuntando a Neon en tu `.env`:

```bash
npm run db:seed
```

Los cambios de esquema futuros no necesitan ningún paso manual: se aplican
solos en el siguiente despliegue de Vercel.

## Scripts

- `npm run dev` – servidor de desarrollo
- `npm run build` / `npm run start` – build y arranque en producción
- `npm run lint` – linter
- `npm run db:seed` – vuelve a sembrar las categorías por defecto si la
  tabla está vacía
- `npx prisma studio` – explorador visual de la base de datos
- `npx prisma migrate deploy` – aplica migraciones pendientes sin generar
  nuevas (para producción)

## Notas

- El análisis de capturas requiere `ANTHROPIC_API_KEY`; sin ella, la
  subida de gastos fallará (el resto de la app funciona igual).
- `DATABASE_URL` debe ser una cadena de conexión de PostgreSQL válida.
