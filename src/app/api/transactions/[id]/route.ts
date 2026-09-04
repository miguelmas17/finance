import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { date, description, merchant, amount, currency, categoryId, notes } =
    body;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(merchant !== undefined ? { merchant } : {}),
      ...(amount !== undefined ? { amount: Number(amount) } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { category: { include: { parent: true } } },
  });

  return NextResponse.json(transaction);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
