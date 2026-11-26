"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpRight, Sparkles } from "lucide-react";

type ModelItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  modelType: string;
  contextWindow: number;
  releaseDate: string;
  isOpenSource: boolean;
  capabilities: string[];
  minInputPrice: number | null;
  minOutputPrice: number | null;
  lab: { name: string; slug: string };
  providers: { provider: { name: string; slug: string } }[];
};

export default function ModelDiscovery() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lab, setLab] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("release_desc");

  useEffect(() => {
    const controller = new AbortController();
    const fetchModels = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (lab) params.set("lab", lab);
      if (type) params.set("type", type);
      params.set("sort", sort);

      try {
        const res = await fetch(`/api/models?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setModels(json.data ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchModels, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, lab, type, sort]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" /> AI Model Intelligence
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Discover & Compare AI Models
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Explore pricing, context windows, capabilities, and benchmarks across frontier and open-weights models.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search models or labs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={lab}
          onChange={(e) => setLab(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All AI Labs</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google DeepMind</option>
          <option value="meta">Meta</option>
          <option value="deepseek">DeepSeek</option>
          <option value="mistral">Mistral AI</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Model Types</option>
          <option value="chat">Chat</option>
          <option value="reasoning">Reasoning</option>
          <option value="coding">Coding</option>
        </select>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-zinc-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="release_desc">Newest First</option>
            <option value="price_asc">Lowest Price</option>
            <option value="price_desc">Highest Price</option>
            <option value="context_desc">Largest Context</option>
          </select>
        </div>
      </div>

      {/* Model Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-400">
          No models match your current filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/models/${m.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all hover:border-indigo-500/60 hover:bg-zinc-900/80"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-indigo-400">{m.lab.name}</span>
                    <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300">
                      {m.name}
                    </h2>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{m.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
                    {m.modelType}
                  </span>
                  {m.isOpenSource && (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      Open Weights
                    </span>
                  )}
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                    {(m.contextWindow / 1000).toLocaleString()}k ctx
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                <span>
                  Input:{" "}
                  <strong className="text-white">
                    {m.minInputPrice !== null ? `$${m.minInputPrice.toFixed(2)}/1M` : "N/A"}
                  </strong>
                </span>
                <span>
                  Output:{" "}
                  <strong className="text-white">
                    {m.minOutputPrice !== null ? `$${m.minOutputPrice.toFixed(2)}/1M` : "N/A"}
                  </strong>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}