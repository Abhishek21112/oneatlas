import { Suspense } from "react";
import ModelDiscovery from "@/components/ModelDiscovery";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-zinc-400">Loading models...</div>}>
      <ModelDiscovery />
    </Suspense>
  );
}