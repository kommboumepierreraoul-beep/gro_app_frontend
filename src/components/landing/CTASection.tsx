/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#154212]">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bcf0ae]/10 border border-[#bcf0ae]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#bcf0ae]" />
            <span className="text-xs font-medium text-[#bcf0ae] tracking-wider uppercase">
              Rejoignez la communauté
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Prêt à cultiver votre <br />
            <span className="text-[#bcf0ae]">avenir agricole</span> ?
          </h2>

          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Rejoignez des milliers d'agriculteurs et d'experts qui utilisent
            Agripulse pour grandir ensemble.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#bcf0ae] text-[#154212] font-semibold rounded-xl hover:bg-[#a1d494] transition-all hover:scale-[1.02] shadow-lg shadow-[#bcf0ae]/20"
            >
              Commencer maintenant
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Explorer la communauté
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#bcf0ae]" />
              <span className="text-sm text-white/50">Gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#bcf0ae]" />
              <span className="text-sm text-white/50">Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#bcf0ae]" />
              <span className="text-sm text-white/50">Communauté active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
