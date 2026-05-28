'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { OtpInput } from '@/components/ui/OtpIput'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
 
function ResetPasswordOtpForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') ?? ''
 
  const [otp,       setOtp]       = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')
  const [resending, setResending] = useState(false)
  const [timer,     setTimer]     = useState(900) // 15 minutes
 
  // ── Compte à rebours ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() =>
      setTimer((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [])
 
  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
 
  // ── Valider le code OTP (sans encore reset le mdp) ────────────────────
  // On passe juste à l'étape 2 avec email + code en query params
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setError('Entrez les 6 chiffres du code.')
      return
    }
    // Redirige vers l'étape 2 avec email + code dans l'URL
    router.push(
      `/new-password?email=${encodeURIComponent(email)}&code=${code}`
    )
  }
 
  // ── Renvoyer un nouveau code ──────────────────────────────────────────
  const handleResend = async () => {
    if (!email) return toast.error('Email manquant. Recommencez depuis le début.')
    setResending(true)
    try {
      await authService.forgotPassword(email)
      toast.success('Nouveau code envoyé !')
      setTimer(900)
      setOtp(Array(6).fill(''))
      setError('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setResending(false)
    }
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/50 p-8 text-center">
 
          {/* Stepper visuel */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold shadow">
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-200" />
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-sm font-bold">
              2
            </div>
          </div>
 
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mb-4">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
 
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrez le code reçu</h1>
          <p className="text-gray-500 text-sm mb-1">
            Code envoyé à{' '}
            <span className="font-semibold text-gray-800">{email || 'votre email'}</span>
          </p>
 
          {/* Timer */}
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
            timer > 300 ? 'bg-green-100 text-green-700' :
            timer > 0   ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
          }`}>
            {timer > 0 ? `⏱ Expire dans ${formatTimer(timer)}` : '⚠️ Code expiré'}
          </div>
 
          {error && <div className="mb-4 text-left"><Alert type="error" message={error} /></div>}
 
          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpInput value={otp} onChange={setOtp} />
 
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              disabled={timer === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Valider le code →
            </Button>
          </form>
 
          {/* Renvoyer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Vous n&apos;avez pas reçu le code ?</p>
            <button
              onClick={handleResend}
              disabled={resending || timer > 840}
              className="text-sm text-purple-600 font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
          </div>
 
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/forgot-password" className="text-gray-400 hover:text-gray-600 hover:underline text-xs">
              ← Changer d&apos;adresse email
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
 
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordOtpForm />
    </Suspense>
  )
}