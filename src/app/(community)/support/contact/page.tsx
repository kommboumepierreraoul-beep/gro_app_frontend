/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Send,
  User,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Headphones,
  Users,
  ThumbsUp,
  TrendingUp,
  Globe,
  Briefcase,
  Calendar,
  MapPin,
  Smartphone,
  Laptop,
  BookOpen,
  Shield,
  Heart,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react";

type ContactSubject = "general" | "missions" | "account" | "payment" | "bug" | "suggestion";

interface SubjectOption {
  value: ContactSubject;
  label: string;
  icon: React.ElementType;
}

const SUBJECTS: SubjectOption[] = [
  { value: "general", label: "Question générale", icon: HelpCircle },
  { value: "missions", label: "Problème avec une mission", icon: Briefcase },
  { value: "account", label: "Problème de compte", icon: Shield },
  { value: "payment", label: "Question sur la rémunération", icon: Globe },
  { value: "bug", label: "Signalement de bug", icon: AlertCircle },
  { value: "suggestion", label: "Suggestion d'amélioration", icon: Star },
];

export default function SupportContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general" as ContactSubject,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler l'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({
        name: "",
        email: "",
        subject: "general",
        message: "",
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ─── HEADER ─── */}
        <div className="rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6 mb-6 ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/missions/support"
                className="inline-flex items-center gap-1.5 text-sm text-[#72796e] hover:text-[#154212] transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Retour à l'aide
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#154212] flex items-center justify-center">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#191c18]">
                    Nous contacter
                  </h1>
                  <p className="text-sm text-[#72796e]">
                    Une question ? Un problème ? Notre équipe est là pour vous aider
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/missions/support"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#c2c9bb]/30 text-[#42493e] hover:bg-[#f9faf2] hover:border-[#154212] transition text-sm font-medium"
              >
                <BookOpen size={16} />
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* ─── STATS RAPIDES ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">24/7</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Disponible</p>
          </div>
          
          <div className="bg-[#d4e8c4] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ThumbsUp className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">96%</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Satisfaction</p>
          </div>
          
          <div className="bg-[#f3f4ed] rounded-xl p-3 text-center border border-[#c2c9bb]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">1,247</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Membres</p>
          </div>
          
          <div className="bg-[#eaf3de] rounded-xl p-3 text-center border border-[#bcf0ae]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Headphones className="w-4 h-4 text-[#154212]" />
              <span className="text-lg font-bold text-[#191c18]">24</span>
            </div>
            <p className="text-xs font-medium text-[#42493e]">Agents</p>
          </div>
        </div>

        {/* ─── FORMULAIRE DE CONTACT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/30 overflow-hidden">
              <div className="p-6 border-b border-[#c2c9bb]/20 bg-[#f9faf2]/50">
                <h2 className="text-lg font-semibold text-[#191c18]">
                  Envoyez-nous un message
                </h2>
                <p className="text-sm text-[#72796e]">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                </p>
              </div>

              <div className="p-6">
                {isSuccess ? (
                  <div className="bg-[#eaf3de] border border-[#bcf0ae] rounded-xl p-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-[#154212] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#191c18] mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-[#42493e] text-sm">
                      Notre équipe vous répondra dans les plus brefs délais.
                      Merci de votre confiance.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#42493e] mb-1.5">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Votre nom"
                          className="w-full px-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition placeholder:text-[#72796e]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#42493e] mb-1.5">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="votre@email.com"
                          className="w-full px-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition placeholder:text-[#72796e]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#42493e] mb-1.5">
                        Sujet
                      </label>
                      <div className="relative">
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition appearance-none"
                        >
                          {SUBJECTS.map((subject) => (
                            <option key={subject.value} value={subject.value}>
                              {subject.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight className="w-4 h-4 text-[#72796e] rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#42493e] mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Décrivez votre demande en détail..."
                        className="w-full px-4 py-2.5 bg-[#f9faf2] border border-[#c2c9bb]/30 rounded-xl text-sm text-[#191c18] outline-none focus:ring-2 focus:ring-[#154212]/20 focus:border-[#154212] transition placeholder:text-[#72796e] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#154212] hover:bg-[#1d5a18] text-white font-semibold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Informations de contact */}
          <div className="space-y-6">
  {/* Autres moyens de contact */}
  <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/30 p-6">
    <h3 className="text-sm font-semibold text-[#191c18] mb-4">
      Autres moyens de contact
    </h3>
    
    <div className="space-y-4">
      <ContactInfo
        icon={<MessageCircle className="w-5 h-5 text-[#154212]" />}
        title="Chat en direct"
        description="Disponible 24/7 pour une assistance immédiate"
        action="Démarrer un chat"
        href="#"
      />
      <ContactInfo
        icon={<Phone className="w-5 h-5 text-[#154212]" />}
        title="Téléphone"
        description="+237 6XX XXX XXX"
        action="Nous appeler"
        href="tel:+2376XXXXXXXX"
      />
      <ContactInfo
        icon={<Mail className="w-5 h-5 text-[#154212]" />}
        title="Email"
        description="agripulse@agripuls.com"
        action="Nous écrire"
        href="mailto:agripulse@agripuls.com"
      />
      <ContactInfo
        icon={<Clock className="w-5 h-5 text-[#154212]" />}
        title="Horaires"
        description="Lun - Ven : 9h - 18h"
        action="Disponible 24/7"
        href="#"
      />
    </div>
  </div>


  {/* FAQ rapide */}
  <div className="bg-[#f9faf2] rounded-2xl border border-[#c2c9bb]/30 p-5">
    <h4 className="text-sm font-semibold text-[#191c18] mb-3">
      Questions fréquentes
    </h4>
    <div className="space-y-2">
      <Link
        href="/missions/support#faq"
        className="flex items-center gap-2 text-sm text-[#42493e] hover:text-[#154212] transition-colors"
      >
        <HelpCircle size={14} className="text-[#72796e]" />
        Comment créer une mission ?
      </Link>
      <Link
        href="/missions/support#faq"
        className="flex items-center gap-2 text-sm text-[#42493e] hover:text-[#154212] transition-colors"
      >
        <HelpCircle size={14} className="text-[#72796e]" />
        Comment postuler à une mission ?
      </Link>
      <Link
        href="/missions/support#faq"
        className="flex items-center gap-2 text-sm text-[#42493e] hover:text-[#154212] transition-colors"
      >
        <HelpCircle size={14} className="text-[#72796e]" />
        Comment gérer mes candidatures ?
      </Link>
    </div>
  </div>
</div>
        </div>

        {/* ─── FOOTER ─── */}
        <div className="mt-6 p-4  rounded-xl border border-[#c2c9bb]/30">
          <p className="text-xs text-[#72796e] text-center">
            Notre équipe s'engage à vous répondre dans les 24 heures suivant votre demande.
            Nous traitons toutes les demandes avec sérieux et confidentialité.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function ContactInfo({
  icon,
  title,
  description,
  action,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f9faf2] transition-colors group border border-transparent hover:border-[#c2c9bb]/20"
    >
      <div className="w-10 h-10 bg-[#eaf3de] rounded-lg flex items-center justify-center flex-shrink-0 border border-[#bcf0ae]/30">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#191c18]">{title}</p>
        <p className="text-xs text-[#72796e]">{description}</p>
        <span className="text-xs font-medium text-[#154212] group-hover:underline">
          {action}
        </span>
      </div>
    </Link>
  );
}