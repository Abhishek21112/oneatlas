"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, GitCompare, Trophy, Building2, Server } from "lucide-react";

const navItems = [
  { href: "/", label: "Models", icon: Compass },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/labs", label: "Labs", icon: Building2 },
  { href: "/providers", label: "Providers", icon: Server },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm">
            OA
          </span>
          <span className="text-lg">OneAtlas</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}