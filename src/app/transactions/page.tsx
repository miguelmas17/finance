import { prisma } from "@/lib/db";
import { TransactionsTable } from "./TransactionsTable";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  const [categories, params] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" } } },
    }),
    searchParams,
  ]);
  const guardados = Number(params.guardados ?? 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Movimientos</h1>
        <p className="text-muted">
          Todos tus gastos e ingresos importados, con su categoría asignada.
        </p>
      </div>
      {guardados > 0 && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          Se {guardados === 1 ? "ha" : "han"} guardado {guardados}{" "}
          {guardados === 1 ? "movimiento" : "movimientos"} correctamente.
        </div>
      )}
      <TransactionsTable categories={categories} />
    </div>
  );
}
