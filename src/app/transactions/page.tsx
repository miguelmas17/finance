import { prisma } from "@/lib/db";
import { TransactionsTable } from "./TransactionsTable";

export default async function TransactionsPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Movimientos</h1>
        <p className="text-muted">
          Todos tus gastos e ingresos importados, con su categoría asignada.
        </p>
      </div>
      <TransactionsTable categories={categories} />
    </div>
  );
}
