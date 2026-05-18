import { motion } from "framer-motion";
import {
  Gauge,
  Infinity,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  UserRoundX,
  Video,
} from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const features = [
  { title: "Fast Download", text: "Lean interface states and crisp feedback for a near-instant flow.", icon: Gauge },
  { title: "HD Quality", text: "Premium quality badges and format-ready cards for clean exports.", icon: Video },
  { title: "No Signup", text: "Keep visitors moving with zero account friction.", icon: UserRoundX },
  { title: "Unlimited Downloads", text: "Designed for repeated use without visual clutter.", icon: Infinity },
  { title: "Mobile Friendly", text: "Responsive spacing, tap targets, and layouts across screens.", icon: MonitorSmartphone },
  { title: "Secure Downloads", text: "Privacy-forward UI language with trust-building security cues.", icon: ShieldCheck },
];

export default function Features() {
  return (
    <section id="features" className="relative px-5 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-24 -z-10 h-80 bg-cyan-400/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Premium features"
          title="Everything users expect from a modern downloader."
          description="High contrast, polished motion, and strong interaction states make the product feel fast before the download even starts."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-white/[0.085]"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl transition group-hover:bg-cyan-300/20" />
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-black/25">
                  <Icon className="h-6 w-6 text-cyan-200" />
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:max-w-md"
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Lock className="h-5 w-5 text-cyan-200" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
              animate={{ x: ["-80%", "110%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "55%" }}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Ready</span>
        </motion.div>
      </div>
    </section>
  );
}
