"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jean-Pierre Martin",
    role: "Agriculteur bio",
    content:
      "Agripulse a transformé mon exploitation. J'ai trouvé des partenaires locaux et des formations qui ont fait la différence.",
    avatar: "JM",
    rating: 5,
  },
  {
    name: "Marie Dubois",
    role: "Ingénieure agronome",
    content:
      "La plateforme est intuitive et parfaitement adaptée aux besoins de la communauté agricole. Je recommande vivement !",
    avatar: "MD",
    rating: 5,
  },
  {
    name: "Pierre Lefèvre",
    role: "Éleveur",
    content:
      "Grâce à Agripulse, j'ai pu échanger avec d'autres éleveurs et améliorer mes pratiques. Une communauté exceptionnelle.",
    avatar: "PL",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[#3b6934] text-xs tracking-widest uppercase font-semibold mb-2">
            Témoignages
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191c18] mb-4">
            Ce qu'en disent nos membres
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-[#c2c9bb]/20 hover:border-[#bcf0ae]/40 transition-all hover:shadow-lg group"
            >
              <Quote className="w-6 h-6 text-[#bcf0ae] mb-4 opacity-50" />
              <p className="text-[#42493e] text-sm leading-relaxed mb-4">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#154212] to-[#2d5a27] flex items-center justify-center text-white font-semibold text-xs">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#191c18]">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-[#72796e]">{testimonial.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < testimonial.rating
                          ? "text-[#ff9800] fill-[#ff9800]"
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
