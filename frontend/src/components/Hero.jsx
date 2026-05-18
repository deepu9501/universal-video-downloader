import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clipboard,
  Download,
  Film,
  Layers3,
  Loader2,
  Music2,
  PlayCircle,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";

const previewCards = [
  {
    label: "YouTube Shorts",
    meta: "1080p vertical",
    icon: PlayCircle,
    accent: "from-red-500 to-rose-400",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=420&q=80",
    className: "left-0 top-10 sm:-left-8",
  },
  {
    label: "Instagram Reel",
    meta: "Ready to save",
    icon: Camera,
    accent: "from-fuchsia-500 to-orange-300",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=420&q=80",
    className: "right-0 top-36 sm:-right-8",
  },
  {
    label: "TikTok Clip",
    meta: "Fast stream",
    icon: Music2,
    accent: "from-cyan-300 to-violet-400",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=420&q=80",
    className: "bottom-8 left-8 sm:left-16",
  },
];

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 29) % 92}%`,
  top: `${8 + ((index * 41) % 82)}%`,
  delay: (index % 6) * 0.28,
  duration: 3.8 + (index % 5) * 0.55,
}));

const platformPills = [
  { label: "YT", color: "bg-red-500" },
  { label: "IG", color: "bg-fuchsia-500" },
  { label: "FB", color: "bg-blue-500" },
  { label: "TT", color: "bg-cyan-400" },
  { label: "X", color: "bg-slate-700" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handlePreviewMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      rotateX: y * -8,
      rotateY: x * 10,
    });
  };

  const handleDownload = async (event) => {
    event.preventDefault();
    const videoUrl = url.trim();

    if (!videoUrl) {
      setMessage("Paste a YouTube, Instagram, Facebook, TikTok, or Twitter/X link first.");
      return;
    }

    setLoading(true);
    setMessage("Checking link...");

    try {
      const infoQuery = new URLSearchParams({ url: videoUrl }).toString();
      const response = await fetch(`${API_BASE_URL}/api/info?${infoQuery}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Only YouTube, Instagram, Facebook, TikTok, and Twitter/X links are supported.");
        return;
      }

      setMessage(`Starting download: ${data.title}`);
      const downloadQuery = new URLSearchParams({
        url: videoUrl,
        title: data.title || "video-download",
      }).toString();
      window.location.href = `${API_BASE_URL}/api/download?${downloadQuery}`;
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
            YouTube, Instagram, Facebook, TikTok, and Twitter/X only
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Download videos from the five platforms you actually use.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Paste a YouTube video or Shorts link, an Instagram Reel, a Facebook video, a TikTok URL, or a Twitter/X post and start a clean video download.
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
                  placeholder="Paste YouTube, Instagram, Facebook, TikTok, or Twitter/X URL"
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
            {["Five platforms", "No app install", "Video and audio APIs"].map((item) => (
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
          className="relative mx-auto w-full max-w-xl [perspective:1400px]"
          initial={{ opacity: 0, scale: 0.92, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: "easeOut" }}
        >
          <motion.div
            className="absolute -inset-8 rounded-full bg-gradient-to-br from-violet-500/30 via-cyan-300/20 to-blue-500/30 blur-3xl"
            animate={{ scale: [1, 1.1, 0.96, 1], rotate: [0, 10, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-8 top-8 h-72 rounded-full bg-cyan-300/15 blur-[90px]"
            animate={{ opacity: [0.35, 0.72, 0.35], y: [0, -18, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative min-h-[38rem] rounded-[2.25rem] border border-white/15 bg-white/[0.075] p-4 shadow-[0_50px_160px_rgba(0,0,0,0.55)] backdrop-blur-2xl transform-gpu"
            animate={tilt}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            onMouseMove={handlePreviewMove}
            onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
          >
            <div className="absolute inset-0 rounded-[2.25rem] bg-[linear-gradient(120deg,rgba(255,255,255,0.15),transparent_34%,rgba(34,211,238,0.12)_70%,transparent)]" />
            <div className="absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_25%_10%,rgba(124,58,237,0.28),transparent_34%),radial-gradient(circle_at_88%_30%,rgba(34,211,238,0.22),transparent_32%)]" />

            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute h-1 w-1 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
                style={{ left: particle.left, top: particle.top }}
                animate={{ y: [0, -22, 0], opacity: [0.12, 0.9, 0.12] }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#060914]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.7)]" />
                  <span className="h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.55)]" />
                  <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.55)]" />
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  <Radio className="h-3.5 w-3.5" />
                  Live preview
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                  className="relative min-h-72 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=720&q=80"
                    alt="Video preview"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.08),rgba(3,7,18,0.86)),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.32),transparent_34%)]" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    {platformPills.map((pill) => (
                      <span
                        key={pill.label}
                        className={`grid h-9 w-9 place-items-center rounded-xl ${pill.color} text-xs font-black text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)]`}
                      >
                        {pill.label}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/15 text-white shadow-[0_0_44px_rgba(34,211,238,0.35)] backdrop-blur-xl"
                    aria-label="Preview media"
                  >
                    <PlayCircle className="h-8 w-8" />
                  </button>
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-white">Universal video detected</p>
                        <p className="text-xs text-slate-300">MP4 stream preparing</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">HD</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300"
                        animate={{ width: ["18%", "72%", "46%", "94%"] }}
                        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-4">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                        <Layers3 className="h-4 w-4 text-cyan-200" />
                        Media stack
                      </span>
                      <span className="text-xs font-semibold text-slate-400">5 sources</span>
                    </div>
                    <div className="grid gap-3">
                      {["Metadata", "Thumbnail", "Download stream"].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/25 p-3">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/10 text-xs font-black text-cyan-100">
                            0{index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white">{item}</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-cyan-300"
                                animate={{ width: ["28%", "86%", "56%", "92%"] }}
                                transition={{ duration: 2.8 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="rounded-[1.35rem] border border-cyan-300/15 bg-cyan-300/10 p-4 shadow-[0_0_42px_rgba(34,211,238,0.14)] backdrop-blur-xl"
                    animate={{ boxShadow: ["0 0 28px rgba(34,211,238,0.12)", "0 0 58px rgba(34,211,238,0.28)", "0 0 28px rgba(34,211,238,0.12)"] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
                        <ArrowDownToLine className="h-6 w-6 text-white" />
                      </span>
                      <div>
                        <p className="text-sm font-black text-white">Download ready</p>
                        <p className="text-xs text-slate-300">Clean MP4 output</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {previewCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className={`absolute hidden w-52 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.11] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:block ${card.className}`}
                  animate={{ y: [0, -14, 0], rotateZ: index === 1 ? [2, -1, 2] : [-2, 1, -2] }}
                  transition={{ duration: 4 + index * 0.7, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05, y: -18 }}
                >
                  <div className="relative h-24 overflow-hidden rounded-2xl">
                    <img src={card.image} alt="" className="h-full w-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${card.accent}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">{card.label}</p>
                      <p className="text-xs text-slate-300">{card.meta}</p>
                    </div>
                    <BadgeCheck className="h-5 w-5 shrink-0 text-cyan-200" />
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              className="absolute -right-3 bottom-28 hidden rounded-2xl border border-white/10 bg-black/45 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block"
              animate={{ x: [0, 10, 0], opacity: [0.78, 1, 0.78] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
                <div>
                  <p className="text-xs text-slate-400">Secure session</p>
                  <p className="text-sm font-black text-white">Public link only</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
