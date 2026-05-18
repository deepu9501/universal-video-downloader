import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Menu, Sparkles, X } from "lucide-react";

const links = [
  { label: "Platforms", href: "#platforms" },
  { label: "Features", href: "#features" },
  { label: "Steps", href: "#how-it-works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05060a]/70 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_0_32px_rgba(34,211,238,0.2)]">
            <Sparkles className="h-5 w-5 text-cyan-200 transition group-hover:rotate-12" />
          </span>
          <span className="text-lg font-bold tracking-tight">ClipFlux</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-[0_0_28px_rgba(34,211,238,0.28)] transition hover:scale-[1.03] hover:shadow-[0_0_42px_rgba(139,92,246,0.42)]"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div
          className="mx-5 mb-5 rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          <div className="grid gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}
