import { motion } from "framer-motion";
import { Camera, Music2, Play, Share2 } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const platforms = [
  { name: "YouTube", icon: Play, accent: "from-red-500 to-rose-400" },
  { name: "Instagram", icon: Camera, accent: "from-fuchsia-500 to-orange-300" },
  { name: "Facebook", icon: Share2, accent: "from-blue-500 to-cyan-300" },
  { name: "TikTok", icon: Music2, accent: "from-slate-100 to-cyan-300" },
];

export default function Platforms() {
  return (
    <section id="platforms" className="relative px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Supported platforms"
          title="Focused support for four video platforms."
          description="Paste a public YouTube, Instagram, Facebook, or TikTok link. Other platforms are intentionally rejected."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.article
                key={platform.name}
                className="group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:border-cyan-300/35 hover:bg-white/[0.09]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <div className={`mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${platform.accent} shadow-[0_0_30px_rgba(34,211,238,0.2)]`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Public video links only.
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
