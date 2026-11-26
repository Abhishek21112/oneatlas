import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const benchmarkSlug = req.nextUrl.searchParams.get("benchmark") || "mmlu-pro";
    const category = req.nextUrl.searchParams.get("type"); // optional: chat, reasoning, coding

    const [benchmarks, scores] = await Promise.all([
      prisma.benchmark.findMany({ orderBy: { name: "asc" } }),
      prisma.modelBenchmark.findMany({
        where: {
          benchmark: { slug: benchmarkSlug },
          ...(category ? { model: { modelType: category } } : {}),
        },
        orderBy: { score: "desc" },
        include: {
          benchmark: true,
          model: {
            include: {
              lab: true,
              providers: { orderBy: { inputPricePer1M: "asc" }, take: 1 },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ benchmarks, data: scores });
  } catch (error) {
    console.error("GET /api/rankings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}