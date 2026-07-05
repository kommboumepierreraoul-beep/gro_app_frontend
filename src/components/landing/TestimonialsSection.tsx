"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jean-Pierre Martin",
    role: "Agriculteur bio",
    content:
      "Agripulse a transforme mon exploitation. J'ai trouve des partenaires locaux et des formations qui ont fait la difference.",
    avatar: "JM",
    rating: 5,
  },
  {
    name: "Marie Dubois",
    role: "Ingenieure agronome",
    content:
      "La plateforme est intuitive et parfaitement adaptee aux besoins de la communaute agricole. Je recommande vivement !",
    avatar: "MD",
    rating: 5,
  },
  {
    name: "Pierre Lefevre",
    role: "Eleveur",
    content:
      "Grace a Agripulse, j'ai pu echanger avec d'autres eleveurs et ameliorer mes pratiques. Une communaute exceptionnelle.",
    avatar: "PL",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-[#f9faf2] px-4 py-12 sm:px-6 lg:px-8">
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
              Temoignages
            </p>
            <h2 className="text-3xl font-bold text-[#191c18] sm:text-4xl">
              Ce qu&apos;en disent nos membres
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-[#72796e] sm:text-base">
            Des retours courts et faciles a scanner, dans le meme style de
            cartes que les espaces communaute.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-[#c2c9bb]/30 bg-white/70 p-5 backdrop-blur-sm transition-all hover:border-[#bcf0ae]/70 hover:shadow-lg hover:shadow-[#154212]/5"
            >
              <Quote className="mb-4 h-6 w-6 text-[#154212] opacity-35" />
              <p className="mb-5 text-sm leading-relaxed text-[#42493e]">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#154212] to-[#2d5a27] text-xs font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#191c18]">
                    {testimonial.name}
                  </p>
                  <p className="truncate text-xs text-[#72796e]">
                    {testimonial.role}
                  </p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < testimonial.rating
                          ? "fill-[#ff9800] text-[#ff9800]"
                          : "text-[#e7e9e1]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
