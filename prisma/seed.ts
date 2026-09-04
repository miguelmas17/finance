import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { defaultCategories } from "./categories";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("Ya existen categorías, se omite el seed.");
    return;
  }

  for (const cat of defaultCategories) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        kind: cat.kind,
      },
    });

    for (const child of cat.children ?? []) {
      await prisma.category.create({
        data: {
          name: child.name,
          icon: child.icon ?? cat.icon,
          color: cat.color,
          kind: cat.kind,
          parentId: parent.id,
        },
      });
    }
  }

  console.log("Categorías por defecto creadas.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
