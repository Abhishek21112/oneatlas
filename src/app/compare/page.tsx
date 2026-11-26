"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ModelSummary = { slug: string; name: string; lab: { name: string } };
type FullModel = {
  id: string;
  name: string;
  slug: string;
  modelType: string;
  contextWindow: number;
  maxOutputTokens: number | null;
  isOpenSource: boolean;
  modalities: string[];
  capabilities: string[];
  lab: { name: string };
  providers: { inputPricePer1M: number; outputPricePer1M: number }[];
  benchmarks: { score: number; benchmark: { name: string; slug: string } }[];
};

function CompareContent() {
  const searchParams = useSearchParams();
  const [allModels, setAllModels] = useState<ModelSummary[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    "gemini-2-5-pro",
    "claude-3-7-sonnet",
    "deepseek-r1",
  ]);
  const [compared, setCompared] = useState<FullModel[]>([]);

  useEffect(() => {
    const initial = searchParams.get("slugs");
    if (initial) {
      const parsed = initial.split(",").filter(Boolean);
      if (parsed.length === 1) {
        setSelectedSlugs([parsed[0], parsed[0] === "gpt-4o" ? "claude-3-7-sonnet" : "gpt-4o", ""]);
      } else if (parsed.length >= 2) {
        setSelectedSlugs([parsed[0], parsed[1], parsed[2] || ""]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/models?limit=50")
      .then((r) => r.json())
      .then((j) => setAllModels(j.data ?? []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const active = selectedSlugs.filter(Boolean);
    if (active.length === 0) {
      setCompared([]);
      return;
    }
    fetch(`/api/compare?slugs=${active.join(",")}`)
      .then((r) => r.json())
      .then((j) => setCompared(j.data ?? []))
      .catch(console.error);
  }, [selectedSlugs]);

  const updateSlot = (index: number, slug: string) => {
    setSelectedSlugs((prev) => {
      const next = [...prev];
      next[index] = slug;
      return next;
    });
  };

  const benchmarkNames = Array.from(
    new Set(compared.flatMap((m) => m.benchmarks.map((b) => b.benchmark.name)))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Compare AI Models</h1>
        <p className="mt-1 text-zinc-400">
          Select up to 3 models to compare pricing, context windows, capabilities, and benchmarks side by side.
        </p>
      </div>

      {/* Model Selectors */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((idx) => (
          <select
            key={idx}
            value={selectedSlugs[idx] || ""}
            onChange={(e) => updateSlot(idx, e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">-- Select Model {idx + 1} --</option>
            {allModels.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.lab.name} — {m.name}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Comparison Matrix */}
      {compared.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              <tr>
                <th className="w-48 px-4 py-4 text-xs uppercase text-zinc-400">Metric</th>
                {compared.map((m) => (
                  <th key={m.id} className="px-4 py-4">
                    <div className="text-xs font-normal text-indigo-400">{m.lab.name}</div>
                    <div className="text-base font-semibold text-white">{m.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Type</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 capitalize text-zinc-200">{m.modelType}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Open Weights</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 text-zinc-200">
                    {m.isOpenSource ? "Yes" : "Proprietary"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Context Window</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 font-medium text-white">
                    {m.contextWindow.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Lowest Input / 1M</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 font-medium text-emerald-400">
                    {m.providers[0] ? `$${m.providers[0].inputPricePer1M.toFixed(2)}` : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Lowest Output / 1M</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 font-medium text-emerald-400">
                    {m.providers[0] ? `$${m.providers[0].outputPricePer1M.toFixed(2)}` : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-zinc-400">Modalities</td>
                {compared.map((m) => (
                  <td key={m.id} className="px-4 py-3 capitalize text-zinc-300">
                    {m.modalities.join(", ")}
                  </td>
                ))}
              </tr>
              {benchmarkNames.map((bName) => (
                <tr key={bName}>
                  <td className="px-4 py-3 font-medium text-zinc-400">{bName}</td>
                  {compared.map((m) => {
                    const found = m.benchmarks.find((b) => b.benchmark.name === bName);
                    return (
                      <td key={m.id} className="px-4 py-3 font-semibold text-indigo-300">
                        {found ? `${found.score.toFixed(1)}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-zinc-400">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}