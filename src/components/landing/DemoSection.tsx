/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Maximize,
  Volume2,
  VolumeX,
  Users,
  MessageCircle,
  Search,
  Filter,
  Plus,
} from "lucide-react";

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;

    setProgress(
      (videoRef.current.currentTime / videoRef.current.duration) * 100,
    );
  };

  return (
    <section id="demo" className="bg-[#f3f4ed]/40 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#3b6934]">
              Decouvrez Agripulse
            </p>
            <h2 className="text-3xl font-bold text-[#191c18] sm:text-4xl">
              Voyez comment ca fonctionne
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#72796e] sm:text-base">
            Une demonstration interactive de la plateforme Agripulse en action,
            presentee dans une surface claire comme le reste de l'application.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-white/80 shadow-xl shadow-[#154212]/5 backdrop-blur-sm"
          >
            <div className="relative aspect-video bg-gradient-to-br from-[#154212] to-[#2d5a27]">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                poster="/images/demo-poster.jpg"
                onTimeUpdate={handleTimeUpdate}
                playsInline
              >
                <source src="/videos/demo.mp4" type="video/mp4" />
              </video>

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f9faf2]">
                      <span className="text-[10px] font-bold text-[#154212]">
                        A
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Agripulse
                      </p>
                      <p className="text-[8px] text-white/50">
                        Communaute agricole
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <span className="text-[8px] font-medium text-white">
                      DEMO
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid w-64 grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                      <Users className="mx-auto h-6 w-6 text-[#bcf0ae]" />
                      <p className="mt-1 text-center text-xs font-semibold text-white">
                        250+
                      </p>
                      <p className="text-center text-[8px] text-white/50">
                        Membres
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                      <MessageCircle className="mx-auto h-6 w-6 text-[#bcf0ae]" />
                      <p className="mt-1 text-center text-xs font-semibold text-white">
                        120
                      </p>
                      <p className="text-center text-[8px] text-white/50">
                        Messages
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-medium text-white">
                      LIVE
                    </span>
                    <span className="text-[8px] text-white/50">12:34</span>
                  </div>
                  <span className="text-[8px] text-white/50">2.4k vues</span>
                </div>
              </div>

              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/40"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-sm transition-all hover:scale-105">
                    <Play className="ml-1 h-8 w-8 text-white" />
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 bg-white/95 p-3 backdrop-blur-sm">
              <button
                onClick={togglePlay}
                className="rounded-xl p-2 text-[#191c18] transition-colors hover:bg-[#f3f4ed]"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" />
                )}
              </button>

              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e7e9e1]">
                <div
                  className="h-full rounded-full bg-[#154212] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                onClick={toggleMute}
                className="rounded-xl p-2 text-[#191c18] transition-colors hover:bg-[#f3f4ed]"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              <button className="rounded-xl p-2 text-[#191c18] transition-colors hover:bg-[#f3f4ed]">
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Search, label: "Recherche avancee" },
              { icon: Filter, label: "Filtres intelligents" },
              { icon: Plus, label: "Creation rapide" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f4ed]">
                    <Icon className="h-4 w-4 text-[#154212]" />
                  </div>
                  <span className="text-sm font-medium text-[#42493e]">
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
