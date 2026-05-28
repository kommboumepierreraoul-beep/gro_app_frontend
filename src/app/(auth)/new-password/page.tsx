'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
 
function NewPasswordForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''
  const code         = searchParams.get('code')  ?? ''
 
  const [form, setForm] = useState({
    password: '',
    password_confirmation: '',
  })
  const [showPwd,    setShowPwd]    = useState(false)
  const [showConfirm,setShowConfirm]= useState(false)
  const [isLoading,  setIsLoading]  = useState(false)
  const [error,      setError]      = useState('')
 
  // ── Indicateur de force du mot de passe ──────────────────────────────
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8)              score++
    if (/[A-Z]/.test(pwd))            score++
    if (/[0-9]/.test(pwd))            score++
    if (/[^A-Za-z0-9]/.test(pwd))     score++
    return score
  }
 
  const strength      = getStrength(form.password)
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][strength]
 
  // ── Vérification locale avant envoi ──────────────────────────────────
  const validate = (): string | null => {
    if (!email || !code) return 'Lien invalide. Recommencez depuis le début.'
    if (form.password.length < 8)    return 'Le mot de passe doit contenir au moins 8 caractères.'
    if (form.password !== form.password_confirmation) return 'Les mots de passe ne correspondent pas.'
    return null
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
 
    setIsLoading(true)
    setError('')
    try {
      await authService.resetPassword({
        email,
        code,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      })
      toast.success('Mot de passe réinitialisé avec succès !')
      router.push('/login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réinitialisation')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-8">
 
          {/* Stepper visuel */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-200 text-purple-600 text-sm font-bold">
              ✓
            </div>
            <div className="w-12 h-0.5 bg-purple-300" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold shadow">
              2
            </div>
          </div>
 
          {/* Icône */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
            <p className="text-gray-500 text-sm mt-1">
              Compte : <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>
 
          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
 
          <form onSubmit={handleSubmit} className="space-y-4">
 
            {/* Nouveau mot de passe */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 caractères"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPwd ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
 
              {/* Barre de force */}
              {form.password.length > 0 && (
                <div className="mt-1 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= level ? strengthColor : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength <= 1 ? 'text-red-500' :
                    strength === 2 ? 'text-orange-500' :
                    strength === 3 ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>
                    Force : {strengthLabel}
                  </p>
                </div>
              )}
            </div>
 
            {/* Confirmation */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Répétez le mot de passe"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:bg-white ${
                    form.password_confirmation.length > 0
                      ? form.password === form.password_confirmation
                        ? 'border-emerald-400 bg-emerald-50 focus:ring-emerald-100 focus:border-emerald-500'
                        : 'border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-500'
                      : 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:ring-purple-100'
                  }`}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Indicateur correspondance */}
              {form.password_confirmation.length > 0 && (
                <p className={`text-xs font-medium mt-0.5 ${
                  form.password === form.password_confirmation
                    ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {form.password === form.password_confirmation
                    ? '✓ Les mots de passe correspondent'
                    : '✗ Les mots de passe ne correspondent pas'}
                </p>
              )}
            </div>
 
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              className="bg-purple-600 hover:bg-purple-700 mt-2"
            >
              Réinitialiser mon mot de passe
            </Button>
          </form>
 
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/reset-password" className="text-gray-400 hover:text-gray-600 hover:underline text-xs">
              ← Retour à la saisie du code
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
 
export default function NewPasswordPage() {
  return (
    <Suspense>
      <NewPasswordForm />
    </Suspense>
  )
}