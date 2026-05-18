import { motion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, description }) {
  return (
    <motion.div
      className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
    </motion.div>
  );
}
