'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight, UserPlus, Users } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    email: false,
    password: false,
    passwordConfirmation: false,
    gender: false,
  });

  const validateName = (name: string) => !name.trim() ? "Ce champ est obligatoire." : "";
  const validateEmail = (email: string) => {
    if (!email.trim()) return "L'email est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Format d'email invalide.";
    return "";
  };
  const validatePassword = (pwd: string) => {
    if (!pwd) return "Le mot de passe est obligatoire.";
    if (pwd.length < 8) return "Minimum 8 caractères.";
    return "";
  };
  const validatePasswordConfirmation = (pwd: string, confirm: string) => {
    if (!confirm) return "La confirmation est obligatoire.";
    if (pwd !== confirm) return "Les mots de passe ne correspondent pas.";
    return "";
  };
  const validateGender = (g: string) => !g ? "Veuillez choisir un sexe." : "";

  const isFormValid = () => {
    return (
      validateName(firstname) === "" &&
      validateName(lastname) === "" &&
      validateEmail(email) === "" &&
      validatePassword(password) === "" &&
      validatePasswordConfirmation(password, passwordConfirmation) === "" &&
      validateGender(gender) === ""
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({
      firstname: true,
      lastname: true,
      email: true,
      password: true,
      passwordConfirmation: true,
      gender: true,
    });

    if (!isFormValid()) return;

    try {
      await register({
        firstname,
        lastname,
        email,
        phone: phone || undefined,
        gender,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (registerError: unknown) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Erreur lors de l'inscription.",
      );
    }
  };

  const getFirstnameError = () => touched.firstname ? validateName(firstname) : "";
  const getLastnameError = () => touched.lastname ? validateName(lastname) : "";
  const getEmailError = () => touched.email ? validateEmail(email) : "";
  const getPasswordError = () => touched.password ? validatePassword(password) : "";
  const getConfirmError = () => touched.passwordConfirmation ? validatePasswordConfirmation(password, passwordConfirmation) : "";
  const getGenderError = () => touched.gender ? validateGender(gender) : "";

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/images/maison.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#006c49] via-[#006c49]/70 to-transparent"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300 border border-white/20">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-md">
              <UserPlus className="w-10 h-10 text-emerald-700" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900">Créer un compte</h2>
          <p className="text-sm text-center text-gray-500 mb-8">Rejoignez la révolution agricole technologique</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  onBlur={() => setTouched({ ...touched, lastname: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                  required
                />
                {getLastnameError() && <p className="text-red-500 text-xs mt-1">{getLastnameError()}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  onBlur={() => setTouched({ ...touched, firstname: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="John"
                  required
                />
                {getFirstnameError() && <p className="text-red-500 text-xs mt-1">{getFirstnameError()}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="6 XX XX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="john@agritech.com"
                    required
                  />
                </div>
                {getEmailError() && <p className="text-red-500 text-xs mt-1">{getEmailError()}</p>}
              </div>
            </div>

            {/* Champ Sexe modernisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  onBlur={() => setTouched({ ...touched, gender: true })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 appearance-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="">Choisir...</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
                {/* Flèche personnalisée */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {getGenderError() && <p className="text-red-500 text-xs mt-1">{getGenderError()}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getPasswordError() && <p className="text-red-500 text-xs mt-1">{getPasswordError()}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  onBlur={() => setTouched({ ...touched, passwordConfirmation: true })}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getConfirmError() && <p className="text-red-500 text-xs mt-1">{getConfirmError()}</p>}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création...
                </>
              ) : (
                <>
                  Valider <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500">Se connecter si déjà inscrit ?</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Page de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}