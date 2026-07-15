"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Leaf, LogIn, Rocket } from "lucide-react";

const checks = [
  "Communauté et messagerie intégrées",
  "Marketplace avec espace vendeur",
  "Wallet, litiges et modération",
  "Missions, agenda et notifications",
];

export function CTASection() {
  return (
    <section className="bg-[#f8faf4] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2rem] border border-[#154212]/15 bg-[#154212] shadow-2xl shadow-[#154212]/18"
        >
          <div className="grid gap-8 p-6 text-white sm:p-8 lg:grid-cols-[1fr_0.72fr] lg:p-10">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3.5 py-2">
                <Rocket className="h-4 w-4 text-[#bcf0ae]" />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#bcf0ae]">
                  Prêt pour le terrain
                </span>
              </div>
              <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Lancez l’expérience AgriPulse et passez de l’échange à l’action.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                Une landing claire pour une application complète : elle explique
                ce que fait le produit, donne envie d’entrer et garde la même
                identité que l’app.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#154212] shadow-xl shadow-black/10 transition hover:bg-[#bcf0ae] active:scale-[0.98]"
                >
                  Créer un compte
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/10 px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/16"
                >
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/12 bg-white/10 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bcf0ae] text-[#154212]">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black">Inclus dans l’app</p>
                  <p className="text-xs text-white/62">
                    Les modules importants sont couverts.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {checks.map((check) => (
                  <div
                    key={check}
                    className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3"
                  >
                    <Check className="h-4 w-4 text-[#bcf0ae]" />
                    <span className="text-sm font-semibold text-white/88">
                      {check}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
