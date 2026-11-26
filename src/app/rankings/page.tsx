"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

type BenchmarkInfo = { id: string; name: string; slug: string; category: string; maxScore: number };
type RankingRow = {
  id: string;
  score: number;
  benchmark: BenchmarkInfo;
  model: {
    id: string;
    name: string;
    slug: string;
    modelType: string;
    contextWindow: number;
    isOpenSource: boolean;
    lab: { name: string };
    providers: { inputPricePer1M: number; outputPricePer1M: number }[];
  };
};

export default function RankingsPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkInfo[]>([]);
  const [selectedBenchmark, setSelectedBenchmark] = useState("mmlu-pro");
  const [modelType, setModelType] = useState("");
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ benchmark: selectedBenchmark });
    if (modelType) params.set("type", modelType);

    fetch(`/api/rankings?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.benchmarks) setBenchmarks(json.benchmarks);
        setRows(json.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBenchmark, modelType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400">
            <Trophy className="h-4 w-4" /> Model Leaderboards
          </div>
          <h1 className="mt-1 text-3xl font-bold text-white">Rankings & Benchmarks</h1>
          <p className="mt-1 text-zinc-400">
            Compare top-performing AI models across standardized reasoning, coding, and math evaluations.
          </p>
        </div>

        <select
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="chat">Chat</option>
          <option value="reasoning">Reasoning</option>
          <option value="coding">Coding</option>
        </select>
      </div>

      {/* Benchmark Tabs */}
      <div className="flex flex-wrap gap-2">
        {benchmarks.map((b) => (
          <button
            key={b.slug}
            onClick={() => setSelectedBenchmark(b.slug)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedBenchmark === b.slug
                ? "bg-indigo-600 text-white"
                : "border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
            <tr>
              <th className="w-16 px-4 py-3">Rank</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Lab</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Lowest Input / 1M</th>
              <th className="w-64 px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Loading rankings...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  No models found for this filter.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const pct = Math.min(100, (row.score / row.benchmark.maxScore) * 100);
                return (
                  <tr key={row.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3.5 font-bold text-zinc-300">#{index + 1}</td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/models/${row.model.slug}`}
                        className="font-semibold text-white hover:text-indigo-400"
                      >
                        {row.model.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">{row.model.lab.name}</td>
                    <td className="px-4 py-3.5 capitalize text-zinc-300">{row.model.modelType}</td>
                    <td className="px-4 py-3.5 text-emerald-400">
                      {row.model.providers[0]
                        ? `$${row.model.providers[0].inputPricePer1M.toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-indigo-300">
                          {row.score.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}