# OneAtlas — AI Model Discovery & Intelligence Platform

A full-stack AI model intelligence platform built with **Next.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL (Neon)** that helps developers and researchers discover, compare, and benchmark AI models across labs and inference providers.

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React, TypeScript, TailwindCSS, Lucide Icons
- **Backend:** Next.js Route Handlers, Zod schema validation
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Deployment:** Vercel

## Architecture & Database Design
The relational schema (`prisma/schema.prisma`) normalizes model metadata, multi-provider pricing, and benchmark evaluations:
- **`Lab` & `Provider`**: Separate entities for model creators (OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, Mistral) and inference hosts (OpenRouter, AWS Bedrock, Groq, Together AI, Fireworks AI).
- **`Model`**: Stores core specs (`modelType`, `contextWindow`, `maxOutputTokens`, `releaseDate`, `isOpenSource`, `modalities`, `capabilities`) with indexes on filter and sort columns.
- **`ModelProvider`**: Join table tracking per-provider `inputPricePer1M`, `outputPricePer1M`, `latencyMs`, and `throughputTps`.
- **`Benchmark` & `ModelBenchmark`**: Stores standardized evaluations (MMLU-Pro, HumanEval, GPQA Diamond, MATH-500) and model scores.

## API Endpoints
- `GET /api/models` — Search, filter (`lab`, `provider`, `capability`, `type`, `openSource`), sort (`release_desc`, `price_asc`, `price_desc`, `context_desc`), and paginate models with Zod validation.
- `GET /api/models/[slug]` — Full model specifications, provider pricing breakdown, and benchmark scores.
- `GET /api/compare?slugs=...` — Side-by-side multi-model comparison payload.
- `GET /api/rankings?benchmark=...&type=...` — Ordered benchmark leaderboards with category filtering.
- `GET /api/labs` & `GET /api/providers` — Research lab and inference provider directories with supported models.

## Local Setup
1. **Install dependencies:**
   ```bash
   npm install