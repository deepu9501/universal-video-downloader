import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clipboard,
  Download,
  Film,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const floatingCards = [
  { icon: Film, label: "Shorts ready", value: "9:16", className: "left-2 top-32 sm:left-10" },
  { icon: Zap, label: "Processing", value: "0.8s", className: "right-2 top-48 sm:right-16" },
  { icon: ShieldCheck, label: "Private", value: "SSL", className: "bottom-20 left-8 sm:left-24" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDownload = async (event) => {
    event.preventDefault();
    const videoUrl = url.trim();

    if (!videoUrl) {
      setMessage("Paste a YouTube, Instagram, Facebook, or TikTok link first.");
      return;
    }

    setLoading(true);
    setMessage("Checking link...");

    try {
      const query = new URLSearchParams({ url: videoUrl }).toString();
      const response = await fetch(`${API_BASE_URL}/api/info?${query}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Only YouTube, Instagram, Facebook, and TikTok links are supported.");
        return;
      }

      setMessage(`Starting download: ${data.title}`);
      window.location.href = `${API_BASE_URL}/api/download?${query}`;
    } catch (_error) {
      setMessage("Unable to reach the download server. Please start the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="download"
      className="relative isolate min-h-[92vh] px-5 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.34),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.2),transparent_26%),linear-gradient(135deg,#05060a_0%,#0a0d16_48%,#070914_100%)]" />
      <motion.div
        className="blob blob-one"
        animate={{ x: [0, 22, -12, 0], y: [0, -18, 18, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob blob-two"
        animate={{ x: [0, -28, 20, 0], y: [0, 20, -16, 0], scale: [1, 0.94, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
            YouTube, Instagram, Facebook, and TikTok only
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Download videos from the four platforms you actually use.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Paste a YouTube video or Shorts link, an Instagram Reel, a Facebook video, or a TikTok URL and start a clean video download.
          </p>

          <form
            onSubmit={handleDownload}
            className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="group flex min-h-16 items-center gap-3 rounded-3xl border border-white/10 bg-black/30 px-5 transition focus-within:border-cyan-300/60 focus-within:shadow-[0_0_38px_rgba(34,211,238,0.18)]">
                <Clipboard className="h-5 w-5 shrink-0 text-cyan-200" />
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="Paste YouTube, Instagram, Facebook, or TikTok URL"
                  className="h-full w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                />
              </label>
              <motion.button
                type="submit"
                className="relative inline-flex min-h-16 items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 px-7 text-base font-black text-white shadow-[0_0_44px_rgba(34,211,238,0.3)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="button-shine" />
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {loading ? "Fetching" : "Download Now"}
              </motion.button>
            </div>
            {message && (
              <p className="px-4 pb-2 pt-4 text-sm font-medium text-cyan-100">
                {message}
              </p>
            )}
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            {["Four platforms", "No app install", "Video only"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2"
              >
                <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-lg"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
        >
          <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-500/30 to-cyan-300/25 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080b13] p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300" />
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  Preview
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="h-52 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(124,58,237,0.8),rgba(37,99,235,0.6),rgba(34,211,238,0.55))] p-4">
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-white/20 bg-black/20 p-4">
                    <Film className="h-10 w-10 text-white" />
                    <div>
                      <div className="mb-3 h-3 w-2/3 rounded-full bg-white/50" />
                      <div className="h-3 w-1/2 rounded-full bg-white/25" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="skeleton h-4 w-5/6 rounded-full" />
                  <div className="skeleton h-4 w-2/3 rounded-full" />
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3">
                    <ArrowDownToLine className="h-5 w-5 text-cyan-200" />
                    <div className="min-w-0 flex-1">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
                          animate={{ width: ["22%", "86%", "48%", "92%"] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-100">HD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {floatingCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                className={`absolute hidden rounded-2xl border border-white/10 bg-white/[0.09] px-4 py-3 shadow-2xl backdrop-blur-xl sm:block ${card.className}`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3 + index, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-cyan-200" />
                  <div>
                    <p className="text-xs text-slate-400">{card.label}</p>
                    <p className="text-sm font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
