<div align="center">

# 🌐 OneAtlas
### AI Model Discovery, Comparison & Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-oneatlas--d4b8.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://oneatlas-d4b8.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

**Discover, compare, and benchmark frontier and open-weights AI models across research labs and inference providers in one unified workspace.**

[Explore Live App](https://oneatlas-d4b8.vercel.app) · [Report a Bug](https://github.com/Abhishek21112/oneatlas/issues) · [Request a Feature](https://github.com/Abhishek21112/oneatlas/issues)

</div>

---

## 💡 Why OneAtlas?

Choosing the right LLM for production isn't just about picking the smartest model—it's about balancing **intelligence, context window, token cost, and inference speed**. A single open-weights model like *DeepSeek R1* or *Llama 3.3 70B* can have dramatically different pricing and latency depending on whether you call it through Groq, Together AI, Fireworks, or OpenRouter.

**OneAtlas** brings all of that scattered data into a fast, database-driven interface so developers and researchers can evaluate models side by side without digging through dozens of pricing pages and leaderboard spreadsheets.

---

## ✨ Core Features

- **🔍 Real-Time Model Discovery (`/`)**
  - Debounced full-text search across model names and research labs.
  - Multi-facet filtering by **AI Lab** (OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, Mistral AI) and **Model Category** (`Chat`, `Reasoning`, `Coding`).
  - Dynamic sorting by newest release, context window size, or lowest/highest input token cost.
- **📊 Deep-Dive Model Profiles (`/models/[slug]`)**
  - Technical specifications including context window limits, max output tokens, release dates, and open-weights badges.
  - Supported modalities (`Text`, `Image`, `Audio`, `Code`) and core capabilities (`Tool Use`, `JSON Mode`, `Extended Thinking`, etc.).
  - Live **Provider Pricing & Latency Table** comparing input/output cost per 1M tokens, latency (`ms`), and throughput (`tok/s`).
  - Visual benchmark breakdown with normalized score bars.
- **⚖️ Side-by-Side Comparison Matrix (`/compare`)**
  - Compare up to **3 AI models** simultaneously across specs, modalities, lowest available provider pricing, and benchmark performance.
- **🏆 Interactive Benchmark Leaderboards (`/rankings`)**
  - Filterable rankings across industry-standard evaluations (**MMLU-Pro**, **HumanEval**, **GPQA Diamond**, **MATH-500**) with category filtering.
- **🏢 Labs & Inference Provider Directories (`/labs`, `/providers`)**
  - Dedicated ecosystem directories mapping research organizations and inference hosts directly to every model they create or serve.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server & client rendering, route handlers, Turbopack |
| **Language** | TypeScript | End-to-end type safety across UI, API, and DB queries |
| **Styling** | TailwindCSS + Lucide Icons | Responsive dark-mode UI and clean visual hierarchy |
| **Database** | PostgreSQL (Neon) | Serverless cloud Postgres with connection pooling |
| **ORM** | Prisma | Type-safe schema modeling, migrations, and seeding |
| **Validation** | Zod | Runtime query parameter validation and coercion |
| **Deployment** | Vercel | Continuous deployment and edge/serverless hosting |

---

## 🗄️ Database Architecture

The relational schema (`prisma/schema.prisma`) is normalized to separate **who built a model** from **who hosts it**:

```text
  ┌─────────┐       1:N       ┌─────────┐       1:N       ┌──────────────────┐
  │   Lab   │────────────────▶│  Model  │◀────────────────│  ModelBenchmark  │
  └─────────┘                 └────┬────┘                 └────────┬─────────┘
                                   │                               │
                                  1:N                             N:1
                                   │                               │
                                   ▼                               ▼
                           ┌───────────────┐               ┌───────────────┐
                           │ ModelProvider │               │   Benchmark   │
                           └───────┬───────┘               └───────────────┘
                                   │
                                  N:1
                                   │
                                   ▼
                            ┌────────────┐
                            │  Provider  │
                            └────────────┘
```

- **`Lab` & `Provider`**: Decouples model creators from inference hosts.
- **`Model`**: Stores core specs, supported modalities/capabilities arrays, and database indexes (`@@index`) on `labId`, `modelType`, and `releaseDate` for fast filtering and sorting.
- **`ModelProvider`**: Join table capturing provider-specific metrics (`inputPricePer1M`, `outputPricePer1M`, `latencyMs`, `throughputTps`) with a composite unique constraint (`@@unique([modelId, providerId])`).
- **`Benchmark` & `ModelBenchmark`**: Tracks standardized evaluation definitions (`maxScore`, `category`) and model scores.

---

## 🔌 API Reference

All endpoints live under `src/app/api/` and return structured JSON responses:

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/models` | `search`, `lab`, `provider`, `capability`, `type`, `openSource`, `sort`, `page`, `limit` | Paginated model discovery with Zod validation and transactional count |
| `GET` | `/api/models/[slug]` | — | Full model profile, providers ordered by price, and benchmark scores |
| `GET` | `/api/compare` | `slugs` *(comma-separated, up to 3)* | Side-by-side comparison payload for selected models |
| `GET` | `/api/rankings` | `benchmark`, `type` | Ordered leaderboard standings for a specific benchmark |
| `GET` | `/api/labs` | — | List of AI research labs and their released models |
| `GET` | `/api/providers` | — | List of inference providers and hosted model pricing |

---

## 🧠 Engineering Highlights & Decisions

1. **Next.js 16 Cache Components & `<Suspense>` Boundaries**
   - In Next.js 16, Client Components reading runtime URL state (`usePathname`, `useParams`, `useSearchParams`) require explicit `<Suspense>` boundaries so static shells can prerender cleanly during `next build` while dynamic data streams in on the client.
2. **Serverless Connection Management**
   - `src/lib/prisma.ts` implements a global `PrismaClient` singleton to prevent hot-reloads in development and serverless invocations on Vercel from exhausting Neon's connection pool.
3. **Strict Runtime Input Validation**
   - Every query parameter hitting `/api/models` is parsed and coerced via **Zod** before reaching Prisma, preventing malformed filters and returning clear `400 Bad Request` error payloads.
4. **Transactional Pagination**
   - `/api/models` executes `prisma.model.findMany` and `prisma.model.count` inside a single `prisma.$transaction` call so list results and pagination metadata stay consistent.

---

## 📁 Project Structure

```text
oneatlas/
├── prisma/
│   ├── migrations/          # SQL migration history
│   ├── schema.prisma        # Normalized PostgreSQL data model
│   └── seed.ts              # Deterministic seed script (labs, models, providers, benchmarks)
├── src/
│   ├── app/
│   │   ├── api/             # RESTful Next.js Route Handlers
│   │   │   ├── compare/
│   │   │   ├── labs/
│   │   │   ├── models/
│   │   │   ├── providers/
│   │   │   └── rankings/
│   │   ├── compare/         # Side-by-side model comparison page
│   │   ├── labs/            # AI labs directory page
│   │   ├── models/[slug]/   # Dynamic model detail page
│   │   ├── providers/       # Inference providers directory page
│   │   ├── rankings/        # Interactive benchmark leaderboards
│   │   ├── layout.tsx       # Root layout with Suspense-wrapped Navbar
│   │   └── page.tsx         # Home model discovery view
│   ├── components/
│   │   ├── ModelDiscovery.tsx
│   │   └── Navbar.tsx
│   └── lib/
│       └── prisma.ts        # Global PrismaClient singleton
├── .env.example             # Environment variable template
└── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** `18.18+` (or `20+` recommended)
- A **PostgreSQL** database (local instance or free tier on [Neon](https://neon.tech))

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhishek21112/oneatlas.git
   cd oneatlas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and add your PostgreSQL connection string:
   ```bash
   cp .env.example .env
   ```
   ```env
   DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
   ```

4. **Push database schema & seed sample data:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👨‍💻 Author

**Abhishek Kumar**
- GitHub: [@Abhishek21112](https://github.com/Abhishek21112)
- Live Project: [oneatlas-d4b8.vercel.app](https://oneatlas-d4b8.vercel.app)

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Prisma, and Neon PostgreSQL.</sub>
</div>