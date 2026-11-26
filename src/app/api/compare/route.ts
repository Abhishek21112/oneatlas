import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const slugsParam = req.nextUrl.searchParams.get("slugs");
    if (!slugsParam) {
      return NextResponse.json({ error: "Provide ?slugs=slug1,slug2" }, { status: 400 });
    }

    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

    const models = await prisma.model.findMany({
      where: { slug: { in: slugs } },
      include: {
        lab: true,
        providers: { include: { provider: true }, orderBy: { inputPricePer1M: "asc" } },
        benchmarks: { include: { benchmark: true } },
      },
    });

    return NextResponse.json({ data: models });
  } catch (error) {
    console.error("GET /api/compare error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}