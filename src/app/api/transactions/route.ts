import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("q");

  const transactions = await prisma.transaction.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search } },
              { merchant: { contains: search } },
            ],
          }
        : {}),
    },
    include: { category: { include: { parent: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];

  if (items.length === 0) {
    return NextResponse.json({ error: "No hay movimientos que guardar." }, {
      status: 400,
    });
  }

  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.transaction.create({
        data: {
          date: new Date(item.date),
          description: item.description,
          merchant: item.merchant ?? null,
          amount: Number(item.amount),
          currency: item.currency ?? "EUR",
          categoryId: item.categoryId ?? null,
          uploadId: item.uploadId ?? null,
          notes: item.notes ?? null,
        },
      }),
    ),
  );

  return NextResponse.json(created, { status: 201 });
}
