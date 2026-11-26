import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { name: "asc" },
      include: {
        modelProviders: {
          include: { model: { include: { lab: true } } },
          orderBy: { inputPricePer1M: "asc" },
        },
      },
    });
    return NextResponse.json({ data: providers });
  } catch (error) {
    console.error("GET /api/providers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}