import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { children: { orderBy: { name: "asc" } } },
  });
  const tree = categories.filter((c) => c.parentId === null);
  return NextResponse.json(tree);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, icon, color, kind, parentId } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "El nombre de la categoría es obligatorio." },
      { status: 400 },
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      icon: icon || "💰",
      color: color || "#6b7280",
      kind: kind || "EXPENSE",
      parentId: parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
