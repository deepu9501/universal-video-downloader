import { Download, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <a href="#" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/10">
            <Sparkles className="h-5 w-5 text-cyan-200" />
          </span>
          <span className="font-bold">ClipFlux</span>
        </a>
        <p>Copyright 2026 ClipFlux. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-5">
          <a className="transition hover:text-white" href="#platforms">
            Platforms
          </a>
          <a className="transition hover:text-white" href="#features">
            Features
          </a>
          <a className="inline-flex items-center gap-2 transition hover:text-white" href="#download">
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    </footer>
  );
}
