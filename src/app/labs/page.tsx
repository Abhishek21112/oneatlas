"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";

type LabItem = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  country: string | null;
  foundedYear: number | null;
  models: { id: string; name: string; slug: string; modelType: string }[];
};

export default function LabsPage() {
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/labs")
      .then((r) => r.json())
      .then((json) => setLabs(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400">
          <Building2 className="h-4 w-4" /> Research Organizations
        </div>
        <h1 className="mt-1 text-3xl font-bold text-white">AI Labs Directory</h1>
        <p className="mt-1 text-zinc-400">
          Explore the research labs and companies building frontier and open-weights AI models.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{lab.name}</h2>
                    <p className="text-xs text-zinc-400">
                      {[lab.country, lab.foundedYear ? `Founded ${lab.foundedYear}` : null]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  {lab.website && (
                    <a
                      href={lab.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {lab.description && (
                  <p className="mt-3 text-sm text-zinc-400">{lab.description}</p>
                )}
              </div>

              <div className="mt-5 border-t border-zinc-800 pt-3">
                <div className="mb-2 text-xs font-medium uppercase text-zinc-500">
                  Models ({lab.models.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {lab.models.map((m) => (
                    <Link
                      key={m.id}
                      href={`/models/${m.slug}`}
                      className="rounded-md border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:border-indigo-500 hover:text-white"
                    >
                      {m.name}
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