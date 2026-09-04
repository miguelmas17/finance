import { prisma } from "@/lib/db";
import { CategoriesClient } from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <p className="text-muted">
          Organiza tus gastos en ramas y subramas para tener un control más fino.
        </p>
      </div>
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
