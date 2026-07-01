"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Maximize,
  Volume2,
  VolumeX,
  Clock,
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
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f9faf2]">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[#3b6934] text-xs tracking-widest uppercase font-semibold mb-2">
            Découvrez Agripulse
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191c18] mb-4">
            Voyez comment ça fonctionne
          </h2>
          <p className="text-[#72796e] max-w-2xl mx-auto">
            Une démonstration interactive de la plateforme Agripulse en action.
          </p>
        </motion.div>

        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#c2c9bb]/20 bg-black"
        >
          {/* Video */}
          <div className="aspect-video relative bg-gradient-to-br from-[#154212] to-[#2d5a27]">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/images/demo-poster.jpg"
              onTimeUpdate={handleTimeUpdate}
              playsInline
            >
              <source src="/videos/demo.mp4" type="video/mp4" />
            </video>

            {/* Overlay UI Demo */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#154212] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#bcf0ae]">
                      A
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">
                      Agripulse
                    </p>
                    <p className="text-white/40 text-[8px]">
                      Communauté agricole
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-[8px] text-white font-medium">
                      DÉMO
                    </span>
                  </div>
                </div>
              </div>

              {/* Center elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-64">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                    <Users className="w-6 h-6 text-[#bcf0ae] mx-auto" />
                    <p className="text-white text-xs font-semibold text-center mt-1">
                      250+
                    </p>
                    <p className="text-white/40 text-[8px] text-center">
                      Membres
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                    <MessageCircle className="w-6 h-6 text-[#bcf0ae] mx-auto" />
                    <p className="text-white text-xs font-semibold text-center mt-1">
                      120
                    </p>
                    <p className="text-white/40 text-[8px] text-center">
                      Messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom bar - live indicators */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-[10px] font-medium">
                    LIVE
                  </span>
                  <span className="text-white/40 text-[8px]">• 12:34</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#bcf0ae]" />
                    <span className="text-white/40 text-[8px]">2.4k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Play button overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-all border border-white/20">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/95 backdrop-blur-sm p-3 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-[#f3f4ed] transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#191c18]" />
              ) : (
                <Play className="w-4 h-4 text-[#191c18] ml-0.5" />
              )}
            </button>

            <div className="flex-1 h-1 bg-[#e7e9e1] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-[#154212] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-[#f3f4ed] transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#191c18]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#191c18]" />
              )}
            </button>

            <button className="p-2 rounded-full hover:bg-[#f3f4ed] transition-colors">
              <Maximize className="w-4 h-4 text-[#191c18]" />
            </button>
          </div>
        </motion.div>

        {/* Demo features list */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Search, label: "Recherche avancée" },
            { icon: Filter, label: "Filtres intelligents" },
            { icon: Plus, label: "Création rapide" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#c2c9bb]/20"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f3f4ed] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#72796e]" />
                </div>
                <span className="text-xs font-medium text-[#42493e]">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
