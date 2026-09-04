import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const budgets = await prisma.budget.findMany({
    include: { category: true },
  });
  return NextResponse.json(budgets);
}

// Crea o actualiza el presupuesto mensual de una categoría (upsert por
// categoryId). Un importe <= 0 elimina el presupuesto.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { categoryId, amount } = body;

  if (!categoryId || typeof categoryId !== "string") {
    return NextResponse.json(
      { error: "Falta la categoría." },
      { status: 400 },
    );
  }

  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    await prisma.budget.deleteMany({ where: { categoryId } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  const budget = await prisma.budget.upsert({
    where: { categoryId },
    update: { amount: numericAmount },
    create: { categoryId, amount: numericAmount },
    include: { category: true },
  });

  return NextResponse.json(budget);
}
