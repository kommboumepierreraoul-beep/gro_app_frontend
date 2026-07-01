/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { ArrowRight, Play, Leaf, Sprout, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#154212] via-[#2d5a27] to-[#1a3d16] min-h-[90vh] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(188,240,174,0.3) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, rgba(188,240,174,0.2) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Animated leaves decoration */}
      <div className="absolute left-10 top-20 opacity-20 animate-float">
        <Leaf size={60} className="text-[#bcf0ae]" />
      </div>
      <div className="absolute right-20 bottom-20 opacity-20 animate-float-delayed">
        <Sprout size={50} className="text-[#bcf0ae]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bcf0ae]/20 backdrop-blur-sm border border-[#bcf0ae]/30 mb-6">
              <Shield className="w-4 h-4 text-[#bcf0ae]" />
              <span className="text-xs font-medium text-[#bcf0ae] tracking-wider uppercase">
                Communauté agricole GRO
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Cultivez votre <br />
              <span className="text-[#bcf0ae]">avenir agricole</span>
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
              Agripulse connecte les agriculteurs, les experts et les acteurs du
              monde rural. Échangez, apprenez et développez vos projets
              agricoles.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#bcf0ae] text-[#154212] font-semibold rounded-xl hover:bg-[#a1d494] transition-all hover:scale-[1.02] shadow-lg shadow-[#bcf0ae]/20"
              >
                Commencer gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                <Play size={18} />
                Voir la démo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#154212] bg-gradient-to-br from-[#bcf0ae] to-[#a1d494] flex items-center justify-center text-[10px] font-bold text-[#154212]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">2,500+</p>
                <p className="text-xs text-white/50">Agriculteurs actifs</p>
              </div>
              <div>
                <p className="text-white font-semibold">150+</p>
                <p className="text-xs text-white/50">Communautés</p>
              </div>
            </div>
          </motion.div>

          {/* Right content - Hero image / preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="aspect-[16/10] bg-[#2d5a27] flex items-center justify-center">
                <div className="text-center p-8">
                  <Leaf className="w-16 h-16 text-[#bcf0ae] mx-auto mb-4" />
                  <p className="text-white/40 text-sm">
                    Aperçu de l'application
                  </p>
                  <p className="text-white/20 text-xs mt-2">
                    Interface de démonstration
                  </p>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#bcf0ae] rounded-full opacity-20 animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#bcf0ae] rounded-full opacity-15 animate-pulse-delayed" />
            </div>

            {/* Stats floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#154212] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#bcf0ae]" />
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
        .animate-pulse-delayed {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
