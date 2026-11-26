import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  lab: z.string().optional(),
  provider: z.string().optional(),
  capability: z.string().optional(),
  type: z.string().optional(),
  openSource: z.enum(["true", "false"]).optional(),
  sort: z
    .enum(["release_desc", "release_asc", "context_desc", "price_asc", "price_desc"])
    .default("release_desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = querySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { search, lab, provider, capability, type, openSource, sort, page, limit } = parsed.data;

    const where: Prisma.ModelWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { lab: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (lab) where.lab = { slug: lab };
    if (provider) where.providers = { some: { provider: { slug: provider } } };
    if (capability) where.capabilities = { has: capability };
    if (type) where.modelType = type;
    if (openSource) where.isOpenSource = openSource === "true";

    const orderBy: Prisma.ModelOrderByWithRelationInput =
      sort === "release_asc"
        ? { releaseDate: "asc" }
        : sort === "context_desc"
        ? { contextWindow: "desc" }
        : { releaseDate: "desc" };

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lab: true,
          providers: { include: { provider: true } },
          benchmarks: { include: { benchmark: true } },
        },
      }),
      prisma.model.count({ where }),
    ]);

    // Compute lowest input price per model and sort in-memory if sorting by price
    const enriched = models.map((m) => {
      const minInputPrice = m.providers.length
        ? Math.min(...m.providers.map((p) => p.inputPricePer1M))
        : null;
      const minOutputPrice = m.providers.length
        ? Math.min(...m.providers.map((p) => p.outputPricePer1M))
        : null;
      return { ...m, minInputPrice, minOutputPrice };
    });

    if (sort === "price_asc") {
      enriched.sort((a, b) => (a.minInputPrice ?? Infinity) - (b.minInputPrice ?? Infinity));
    } else if (sort === "price_desc") {
      enriched.sort((a, b) => (b.minInputPrice ?? -1) - (a.minInputPrice ?? -1));
    }

    return NextResponse.json({
      data: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/models error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}