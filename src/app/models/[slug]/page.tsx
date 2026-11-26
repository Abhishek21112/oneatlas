"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitCompare, Cpu, Layers, Calendar, CheckCircle2 } from "lucide-react";

type ModelDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  modelType: string;
  contextWindow: number;
  maxOutputTokens: number | null;
  releaseDate: string;
  isOpenSource: boolean;
  modalities: string[];
  capabilities: string[];
  lab: { name: string; slug: string; website: string | null };
  providers: {
    id: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    latencyMs: number | null;
    throughputTps: number | null;
    provider: { name: string; slug: string; website: string | null };
  }[];
  benchmarks: {
    id: string;
    score: number;
    benchmark: { name: string; slug: string; category: string; maxScore: number };
  }[];
};

function ModelDetailContent() {
  const params = useParams<{ slug: string }>();
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/models/${params.slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setModel(json?.data ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />;
  }

  if (!model) {
    return (
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
        <p className="text-zinc-400">Model not found.</p>
        <Link href="/" className="text-sm text-indigo-400 hover:underline">
          ← Back to all models
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Models
        </Link>

        <Link
          href={`/compare?slugs=${model.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <GitCompare className="h-4 w-4" /> Compare Model
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-zinc-800 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-indigo-400">{model.lab.name}</span>
          <span className="text-zinc-600">•</span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs capitalize text-zinc-300">
            {model.modelType}
          </span>
          {model.isOpenSource && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
              Open Weights
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{model.name}</h1>
        <p className="max-w-3xl text-zinc-400">{model.description}</p>
      </div>

      {/* Spec Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Layers className="h-4 w-4 text-indigo-400" /> Context Window
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">
            {model.contextWindow.toLocaleString()} tokens
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Cpu className="h-4 w-4 text-indigo-400" /> Max Output
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">
            {model.maxOutputTokens ? `${model.maxOutputTokens.toLocaleString()} tokens` : "N/A"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="h-4 w-4 text-indigo-400" /> Release Date
          </div>
          <p className="mt-1 text-2xl font-semibold text-white">
            {new Date(model.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Modalities & Capabilities */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Supported Modalities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {model.modalities.map((mod) => (
              <span
                key={mod}
                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs capitalize text-zinc-200"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Capabilities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {model.capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Providers & Pricing Table */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Available Providers & Pricing</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Input / 1M</th>
                <th className="px-4 py-3">Output / 1M</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {model.providers.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium text-white">{p.provider.name}</td>
                  <td className="px-4 py-3 text-emerald-400">${p.inputPricePer1M.toFixed(2)}</td>
                  <td className="px-4 py-3 text-emerald-400">${p.outputPricePer1M.toFixed(2)}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {p.latencyMs ? `${p.latencyMs} ms` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {p.throughputTps ? `${p.throughputTps} tok/s` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Benchmark Performance</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {model.benchmarks.map((b) => {
            const pct = Math.min(100, (b.score / b.benchmark.maxScore) * 100);
            return (
              <div key={b.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">{b.benchmark.name}</span>
                  <span className="font-semibold text-indigo-400">{b.score.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ModelDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
      }
    >
      <ModelDetailContent />
    </Suspense>
  );
}