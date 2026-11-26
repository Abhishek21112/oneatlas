"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Server, ExternalLink } from "lucide-react";

type ProviderItem = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  modelProviders: {
    id: string;
    inputPricePer1M: number;
    outputPricePer1M: number;
    model: { name: string; slug: string; lab: { name: string } };
  }[];
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then((json) => setProviders(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
          <Server className="h-4 w-4" /> Inference Infrastructure
        </div>
        <h1 className="mt-1 text-3xl font-bold text-white">Provider Directory</h1>
        <p className="mt-1 text-zinc-400">
          Discover API gateways and cloud inference providers along with their supported models and pricing.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-semibold text-white">{p.name}</h2>
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {p.description && <p className="mt-2 text-sm text-zinc-400">{p.description}</p>}
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-3">
                <div className="mb-2 text-xs font-medium uppercase text-zinc-500">
                  Supported Models ({p.modelProviders.length})
                </div>
                <div className="space-y-2">
                  {p.modelProviders.map((mp) => (
                    <Link
                      key={mp.id}
                      href={`/models/${mp.model.slug}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs hover:border-indigo-500/60"
                    >
                      <span className="font-medium text-white">
                        {mp.model.name}{" "}
                        <span className="text-zinc-500">({mp.model.lab.name})</span>
                      </span>
                      <span className="text-emerald-400">
                        ${mp.inputPricePer1M.toFixed(2)} / ${mp.outputPricePer1M.toFixed(2)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}