import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding OneAtlas database...");

  // Clear existing data so the seed script can be re-run cleanly
  await prisma.modelBenchmark.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  // 1. Seed Labs
  const labsData = [
    { name: "OpenAI", slug: "openai", website: "https://openai.com", country: "USA", foundedYear: 2015, description: "AI research and deployment company building frontier reasoning and multimodal models." },
    { name: "Anthropic", slug: "anthropic", website: "https://anthropic.com", country: "USA", foundedYear: 2021, description: "AI safety and research company behind the Claude model family." },
    { name: "Google DeepMind", slug: "google", website: "https://deepmind.google", country: "USA/UK", foundedYear: 2010, description: "Google's AI research lab developing the Gemini multimodal model series." },
    { name: "Meta", slug: "meta", website: "https://ai.meta.com", country: "USA", foundedYear: 2013, description: "Leading open-weights AI research lab behind the Llama series." },
    { name: "DeepSeek", slug: "deepseek", website: "https://deepseek.com", country: "China", foundedYear: 2023, description: "AI lab specializing in high-efficiency open-weights reasoning and coding models." },
    { name: "Mistral AI", slug: "mistral", website: "https://mistral.ai", country: "France", foundedYear: 2023, description: "European AI lab building fast, open and commercial frontier models." },
  ];

  const labs: Record<string, string> = {};
  for (const lab of labsData) {
    const created = await prisma.lab.create({ data: lab });
    labs[lab.slug] = created.id;
  }

  // 2. Seed Providers
  const providersData = [
    { name: "OpenRouter", slug: "openrouter", website: "https://openrouter.ai", description: "Unified API gateway routing across 300+ AI models and providers." },
    { name: "AWS Bedrock", slug: "aws-bedrock", website: "https://aws.amazon.com/bedrock", description: "Enterprise serverless inference on AWS infrastructure." },
    { name: "Together AI", slug: "together-ai", website: "https://together.ai", description: "High-speed cloud platform for running open-source AI models." },
    { name: "Groq", slug: "groq", website: "https://groq.com", description: "Ultra-low latency LPU inference engine for open models." },
    { name: "Fireworks AI", slug: "fireworks-ai", website: "https://fireworks.ai", description: "Fast, production-grade inference for generative AI models." },
  ];

  const providers: Record<string, string> = {};
  for (const provider of providersData) {
    const created = await prisma.provider.create({ data: provider });
    providers[provider.slug] = created.id;
  }

  // 3. Seed Benchmarks
  const benchmarksData = [
    { name: "MMLU-Pro", slug: "mmlu-pro", category: "general", maxScore: 100, description: "Broad multi-task language understanding across 14 domains." },
    { name: "HumanEval", slug: "humaneval", category: "coding", maxScore: 100, description: "Python code generation and functional correctness benchmark." },
    { name: "GPQA Diamond", slug: "gpqa-diamond", category: "reasoning", maxScore: 100, description: "PhD-level science reasoning questions." },
    { name: "MATH-500", slug: "math-500", category: "math", maxScore: 100, description: "Competition-level mathematical problem solving." },
  ];

  const benchmarks: Record<string, string> = {};
  for (const b of benchmarksData) {
    const created = await prisma.benchmark.create({ data: b });
    benchmarks[b.slug] = created.id;
  }

  // 4. Seed Models, Provider Pricing & Benchmark Scores
  const modelsData = [
    {
      name: "GPT-4o",
      slug: "gpt-4o",
      labSlug: "openai",
      description: "Flagship multimodal model balancing speed, intelligence, and vision capabilities.",
      modelType: "chat",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      releaseDate: new Date("2024-05-13"),
      isOpenSource: false,
      modalities: ["text", "image", "audio"],
      capabilities: ["function-calling", "json-mode", "vision", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 2.5, output: 10.0, latency: 420, tps: 95 },
      ],
      scores: { "mmlu-pro": 74.8, "humaneval": 90.2, "gpqa-diamond": 53.6, "math-500": 76.6 },
    },
    {
      name: "o3-mini",
      slug: "o3-mini",
      labSlug: "openai",
      description: "Cost-efficient reasoning model optimized for STEM, coding, and logical deduction.",
      modelType: "reasoning",
      contextWindow: 200000,
      maxOutputTokens: 100000,
      releaseDate: new Date("2025-01-31"),
      isOpenSource: false,
      modalities: ["text"],
      capabilities: ["reasoning", "function-calling", "json-mode", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 1.1, output: 4.4, latency: 680, tps: 120 },
      ],
      scores: { "mmlu-pro": 80.3, "humaneval": 92.4, "gpqa-diamond": 77.0, "math-500": 95.8 },
    },
    {
      name: "Claude 3.7 Sonnet",
      slug: "claude-3-7-sonnet",
      labSlug: "anthropic",
      description: "Hybrid reasoning model excelling at software engineering, agentic workflows, and nuanced writing.",
      modelType: "coding",
      contextWindow: 200000,
      maxOutputTokens: 64000,
      releaseDate: new Date("2025-02-24"),
      isOpenSource: false,
      modalities: ["text", "image"],
      capabilities: ["reasoning", "function-calling", "vision", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 3.0, output: 15.0, latency: 490, tps: 85 },
        { providerSlug: "aws-bedrock", input: 3.0, output: 15.0, latency: 510, tps: 80 },
      ],
      scores: { "mmlu-pro": 82.1, "humaneval": 93.8, "gpqa-diamond": 78.2, "math-500": 88.4 },
    },
    {
      name: "Gemini 2.5 Pro",
      slug: "gemini-2-5-pro",
      labSlug: "google",
      description: "Frontier thinking model with a 1M+ token context window and native multimodal understanding.",
      modelType: "reasoning",
      contextWindow: 1000000,
      maxOutputTokens: 65536,
      releaseDate: new Date("2025-03-25"),
      isOpenSource: false,
      modalities: ["text", "image", "audio", "video"],
      capabilities: ["reasoning", "function-calling", "json-mode", "vision", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 1.25, output: 10.0, latency: 530, tps: 110 },
      ],
      scores: { "mmlu-pro": 84.0, "humaneval": 92.6, "gpqa-diamond": 84.0, "math-500": 93.2 },
    },
    {
      name: "Llama 3.3 70B Instruct",
      slug: "llama-3-3-70b-instruct",
      labSlug: "meta",
      description: "High-efficiency open-weights model delivering strong multilingual and instruction-following performance.",
      modelType: "chat",
      contextWindow: 128000,
      maxOutputTokens: 8192,
      releaseDate: new Date("2024-12-06"),
      isOpenSource: true,
      modalities: ["text"],
      capabilities: ["function-calling", "json-mode", "streaming"],
      pricing: [
        { providerSlug: "groq", input: 0.59, output: 0.79, latency: 180, tps: 310 },
        { providerSlug: "together-ai", input: 0.88, output: 0.88, latency: 320, tps: 140 },
        { providerSlug: "fireworks-ai", input: 0.9, output: 0.9, latency: 290, tps: 155 },
      ],
      scores: { "mmlu-pro": 68.9, "humaneval": 88.4, "gpqa-diamond": 50.5, "math-500": 77.0 },
    },
    {
      name: "DeepSeek R1",
      slug: "deepseek-r1",
      labSlug: "deepseek",
      description: "Open-weights reasoning model rivaling top proprietary models on math, code, and logic.",
      modelType: "reasoning",
      contextWindow: 128000,
      maxOutputTokens: 32768,
      releaseDate: new Date("2025-01-20"),
      isOpenSource: true,
      modalities: ["text"],
      capabilities: ["reasoning", "json-mode", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 0.55, output: 2.19, latency: 620, tps: 75 },
        { providerSlug: "together-ai", input: 3.0, output: 7.0, latency: 410, tps: 115 },
        { providerSlug: "fireworks-ai", input: 3.0, output: 8.0, latency: 390, tps: 125 },
      ],
      scores: { "mmlu-pro": 84.0, "humaneval": 91.5, "gpqa-diamond": 71.5, "math-500": 97.3 },
    },
    {
      name: "Mistral Large 2",
      slug: "mistral-large-2",
      labSlug: "mistral",
      description: "123B parameter flagship model built for complex multilingual reasoning and code generation.",
      modelType: "coding",
      contextWindow: 128000,
      maxOutputTokens: 16384,
      releaseDate: new Date("2024-07-24"),
      isOpenSource: true,
      modalities: ["text"],
      capabilities: ["function-calling", "json-mode", "streaming"],
      pricing: [
        { providerSlug: "openrouter", input: 2.0, output: 6.0, latency: 440, tps: 90 },
        { providerSlug: "aws-bedrock", input: 2.0, output: 6.0, latency: 470, tps: 85 },
      ],
      scores: { "mmlu-pro": 70.1, "humaneval": 89.0, "gpqa-diamond": 48.2, "math-500": 71.5 },
    },
  ];

  for (const m of modelsData) {
    const model = await prisma.model.create({
      data: {
        name: m.name,
        slug: m.slug,
        labId: labs[m.labSlug],
        description: m.description,
        modelType: m.modelType,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        releaseDate: m.releaseDate,
        isOpenSource: m.isOpenSource,
        modalities: m.modalities,
        capabilities: m.capabilities,
      },
    });

    for (const p of m.pricing) {
      await prisma.modelProvider.create({
        data: {
          modelId: model.id,
          providerId: providers[p.providerSlug],
          inputPricePer1M: p.input,
          outputPricePer1M: p.output,
          latencyMs: p.latency,
          throughputTps: p.tps,
        },
      });
    }

    for (const [bSlug, score] of Object.entries(m.scores)) {
      await prisma.modelBenchmark.create({
        data: {
          modelId: model.id,
          benchmarkId: benchmarks[bSlug],
          score,
        },
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });