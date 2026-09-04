import { PrismaClient } from "@prisma/client";
import { defaultCategories } from "./categories";

const prisma = new PrismaClient();

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
