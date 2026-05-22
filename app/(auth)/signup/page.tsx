'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak', color: 'bg-red-400' },
    2: { label: 'Fair', color: 'bg-amber-400' },
    3: { label: 'Good', color: 'bg-blue-400' },
    4: { label: 'Strong', color: 'bg-green-500' },
  }
  return { score, ...(map[score] ?? { label: '', color: '' }) }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const strength = passwordStrength(password)
  const mismatch = confirm.length > 0 && confirm !== password

  const signUp = () => {
    setError(null)

    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (!agreed) { setError('Please agree to the Terms of Service to continue.'); return }

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() },
          // After email verification the user lands on device linking.
          emailRedirectTo: `${location.origin}/devices`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Show the "check your email" screen
      setDone(true)
    })
  }

  // ── Email sent state ────────────────────────────────────────────────────────

  if (done) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Check your inbox</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to verify your
                account — you'll be taken straight to device linking.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't get it? Check your spam folder, or{' '}
              <button
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                  onClick={() => setDone(false)}
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  return (
      <div className="flex min-h-screen bg-background">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-background">
              <Activity className="size-5 text-foreground" />
            </div>
            <span className="text-lg font-semibold text-background">PillDispenser</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-background">
              Set up in<br />three steps.
            </h1>
            <p className="text-background/70 text-lg max-w-sm leading-relaxed">
              Create your account, verify your email, then link your ESP32 dispenser. You'll be dispensing in minutes.
            </p>

            <ol className="space-y-4 pt-4">
              {[
                'Create your account',
                'Verify your email',
                'Link your dispenser & configure compartments',
              ].map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background/20 text-xs font-bold text-background">
                      {i + 1}
                    </div>
                    <span className="text-background/80 text-sm">{step}</span>
                  </li>
              ))}
            </ol>
          </div>

          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} Smart Pill Dispenser Portal
          </p>
        </div>

        {/* Right panel */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
              <Activity className="size-5 text-background" />
            </div>
            <span className="text-lg font-semibold">PillDispenser</span>
          </div>

          <div className="w-full max-w-sm space-y-7">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">Takes less than a minute</p>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
            )}

            <div className="space-y-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all',
                          'placeholder:text-muted-foreground/60'
                      )}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all',
                          'placeholder:text-muted-foreground/60'
                      )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all',
                          'placeholder:text-muted-foreground/60'
                      )}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    'h-1 flex-1 rounded-full transition-all duration-300',
                                    i <= strength.score ? strength.color : 'bg-muted'
                                )}
                            />
                        ))}
                      </div>
                      {strength.label && (
                          <p className="text-xs text-muted-foreground">{strength.label} password</p>
                      )}
                    </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all',
                          'placeholder:text-muted-foreground/60',
                          mismatch && 'border-red-300 focus:ring-red-200'
                      )}
                  />
                  <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mismatch && (
                    <p className="text-xs text-red-600">Passwords don't match</p>
                )}
                {confirm.length > 0 && !mismatch && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="size-3" /> Passwords match
                    </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div
                    onClick={() => setAgreed(!agreed)}
                    className={cn(
                        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                        agreed ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'
                    )}
                >
                  {agreed && (
                      <svg viewBox="0 0 10 8" className="size-3 fill-none stroke-background stroke-2 stroke-round">
                        <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                  <Link href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-foreground underline underline-offset-4 hover:text-foreground/80">Privacy Policy</Link>
              </span>
              </label>

              {/* Submit */}
              <button
                  onClick={signUp}
                  disabled={isPending}
                  className={cn(
                      'w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background',
                      'hover:bg-foreground/90 active:scale-[0.99] transition-all',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      'flex items-center justify-center gap-2'
                  )}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Creating account…' : 'Create Account'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}
