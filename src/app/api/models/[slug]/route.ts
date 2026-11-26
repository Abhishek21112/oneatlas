import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const model = await prisma.model.findUnique({
      where: { slug },
      include: {
        lab: true,
        providers: {
          include: { provider: true },
          orderBy: { inputPricePer1M: "asc" },
        },
        benchmarks: {
          include: { benchmark: true },
          orderBy: { score: "desc" },
        },
      },
    });

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({ data: model });
  } catch (error) {
    console.error("GET /api/models/[slug] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}