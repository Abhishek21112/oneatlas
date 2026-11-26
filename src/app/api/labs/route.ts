import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const labs = await prisma.lab.findMany({
      orderBy: { name: "asc" },
      include: {
        models: {
          orderBy: { releaseDate: "desc" },
          include: { providers: { orderBy: { inputPricePer1M: "asc" }, take: 1 } },
        },
      },
    });
    return NextResponse.json({ data: labs });
  } catch (error) {
    console.error("GET /api/labs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}