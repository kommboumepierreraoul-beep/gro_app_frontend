/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { ArrowRight, Play, Leaf, Sprout, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f9faf2] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="absolute inset-0 opacity-70">
        <div
          className="absolute inset-x-0 top-0 h-64"
          style={{
            background:
              "linear-gradient(180deg, rgba(188,240,174,0.32) 0%, rgba(249,250,242,0) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 16% 18%, rgba(188,240,174,0.22) 0%, transparent 32%), radial-gradient(circle at 86% 28%, rgba(244,187,146,0.16) 0%, transparent 30%)",
          }}
        />
      </div>

      <div className="absolute left-8 top-16 hidden opacity-20 sm:block animate-float">
        <Leaf size={48} className="text-[#154212]" />
      </div>
      <div className="absolute bottom-16 right-12 hidden opacity-20 lg:block animate-float-delayed">
        <Sprout size={44} className="text-[#3b6934]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="grid items-center gap-8 rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-4 shadow-[0_16px_40px_rgba(21,66,18,0.08)] backdrop-blur-sm sm:p-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bcf0ae]/50 bg-[#eaf3de] px-3.5 py-2">
              <Shield className="h-4 w-4 text-[#154212]" />
              <span className="text-xs font-medium text-[#3b6934] tracking-wider uppercase">
                Communaute agricole GRO
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold leading-tight text-[#191c18] sm:text-5xl lg:text-[56px]">
              Cultivez votre avenir agricole
              <span className="block text-[#154212]">avec la communaute</span>
            </h1>

            <p className="mb-6 max-w-xl text-base leading-relaxed text-[#42493e] sm:text-lg">
              Agripulse connecte les agriculteurs, les experts et les acteurs du
              monde rural. Echangez, apprenez et developpez vos projets
              agricoles.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#154212] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#154212]/15 transition-all hover:bg-[#2d5a27] active:scale-[0.98]"
              >
                Commencer gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c2c9bb]/50 bg-white/70 px-5 py-3 text-sm font-semibold text-[#42493e] transition-all hover:border-[#bcf0ae] hover:bg-[#eaf3de]"
              >
                <Play size={18} />
                Voir la demo
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5 border-t border-[#c2c9bb]/30 pt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f9faf2] bg-gradient-to-br from-[#bcf0ae] to-[#eaf3de] text-[10px] font-bold text-[#154212]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-[#191c18]">2,500+</p>
                <p className="text-xs text-[#72796e]">Agriculteurs actifs</p>
              </div>
              <div>
                <p className="font-semibold text-[#191c18]">150+</p>
                <p className="text-xs text-[#72796e]">Communautes</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-[#f3f4ed]/80 shadow-xl">
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-[#f9faf2] via-[#eaf3de] to-[#dce8d3]">
                <div className="p-8 text-center">
                  <Leaf className="mx-auto mb-4 h-14 w-14 text-[#154212]" />
                  <p className="text-sm font-semibold text-[#42493e]">
                    Apercu de l'application
                  </p>
                  <p className="mt-2 text-xs text-[#72796e]">
                    Interface de demonstration
                  </p>
                </div>
              </div>
              <div className="absolute right-4 top-4 rounded-full border border-[#bcf0ae]/40 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#154212]">
                Live
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-[#c2c9bb]/30 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#154212]">
                  <Users className="h-5 w-5 text-[#bcf0ae]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#191c18]">+1,200</p>
                  <p className="text-[10px] text-[#72796e]">Nouveaux membres</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
