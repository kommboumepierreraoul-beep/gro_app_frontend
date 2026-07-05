/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[#f3f4ed]/40 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#c2c9bb]/30 bg-white/75 p-5 shadow-[0_16px_40px_rgba(21,66,18,0.08)] backdrop-blur-sm sm:p-7 lg:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bcf0ae]/50 bg-[#eaf3de] px-3.5 py-2">
                <Sparkles className="h-4 w-4 text-[#154212]" />
                <span className="text-xs font-medium uppercase tracking-wider text-[#3b6934]">
                  Rejoignez la communaute
                </span>
              </div>

              <h2 className="mb-3 text-3xl font-bold text-[#191c18] sm:text-4xl">
                Pret a cultiver votre avenir agricole ?
              </h2>

              <p className="text-sm leading-relaxed text-[#72796e] sm:text-base">
                Rejoignez des milliers d'agriculteurs et d'experts qui utilisent
                Agripulse pour grandir ensemble.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#154212]/15 transition-all hover:bg-[#2d5a27] active:scale-[0.98]"
              >
                Commencer maintenant
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-xl border border-[#c2c9bb]/50 bg-white/70 px-5 py-3 text-sm font-semibold text-[#42493e] transition-all hover:border-[#bcf0ae] hover:bg-[#eaf3de]"
              >
                Explorer la communaute
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-2 border-t border-[#c2c9bb]/30 pt-5 sm:grid-cols-3">
            {["Gratuit", "Sans engagement", "Communaute active"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl bg-[#f3f4ed]/70 px-3 py-2 text-sm text-[#42493e]"
                >
                  <Leaf className="h-4 w-4 text-[#154212]" />
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
