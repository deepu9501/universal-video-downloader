import { motion } from "framer-motion";
import { ClipboardPaste, DownloadCloud, MousePointerClick } from "lucide-react";
import SectionHeader from "./SectionHeader.jsx";

const steps = [
  { title: "Paste Link", icon: ClipboardPaste, text: "Drop a public video or shorts URL into the glowing input." },
  { title: "Click Download", icon: MousePointerClick, text: "Trigger the fetch state with one clear, high-contrast action." },
  { title: "Save Video", icon: DownloadCloud, text: "Choose the prepared format and keep the content locally." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps, no account wall."
          description="The flow is intentionally simple, with enough motion and feedback to feel premium without slowing the user down."
        />

        <div className="relative grid gap-5 lg:grid-cols-3">
          <div className="absolute left-1/2 top-14 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent lg:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-7 text-center backdrop-blur-xl"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_38px_rgba(34,211,238,0.28)]">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="mx-auto mb-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/35 text-sm font-black text-cyan-100">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
