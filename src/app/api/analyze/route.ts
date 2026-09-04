import { NextRequest, NextResponse } from "next/server";
import { analyzeStatementImage } from "@/lib/anthropic";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No se ha recibido ninguna imagen." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mediaType = file.type || "image/png";

  const upload = await prisma.statementUpload.create({
    data: {
      fileName: file.name,
      imageData: `data:${mediaType};base64,${base64}`,
      status: "PENDING",
    },
  });

  try {
    const transactions = await analyzeStatementImage(base64, mediaType);

    await prisma.statementUpload.update({
      where: { id: upload.id },
      data: {
        status: "PROCESSED",
        rawResponse: JSON.stringify(transactions),
      },
    });

    return NextResponse.json({ uploadId: upload.id, transactions });
  } catch (err) {
    await prisma.statementUpload.update({
      where: { id: upload.id },
      data: { status: "FAILED" },
    });
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
