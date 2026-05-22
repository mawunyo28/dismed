'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const signIn = () => {
    setError(null)
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    startTransition(async () => {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(
            authError.message.includes('Invalid login')
                ? 'Incorrect email or password.'
                : authError.message
        )
        return
      }

      if (data.session) {
        // Check if user has a device — if not, send them to setup
        const { data: device } = await supabase
            .from('devices')
            .select('id')
            .eq('owner_id', data.session.user.id)
            .limit(1)
            .maybeSingle()

        router.push(device ? '/dashboard' : '/devices')
        router.refresh()
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') signIn()
  }

  return (
      <div className="flex min-h-screen bg-background">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-background">
              <Activity className="size-5 text-foreground" />
            </div>
            <span className="text-lg font-semibold text-background">PillDispenser</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-background">
              Your medication,<br />on schedule.
            </h1>
            <p className="text-background/70 text-lg leading-relaxed max-w-sm">
              Smart automated dispensing with real-time caregiver alerts and a direct line to your ESP32 device.
            </p>

            <div className="space-y-4 pt-4">
              {[
                'Automated 3-compartment dispensing',
                'Missed dose notifications',
                'Caregiver access controls',
              ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="size-1.5 rounded-full bg-background/60" />
                    <span className="text-background/80 text-sm">{f}</span>
                  </div>
              ))}
            </div>
          </div>

          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} Smart Pill Dispenser Portal
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
              <Activity className="size-5 text-background" />
            </div>
            <span className="text-lg font-semibold">PillDispenser</span>
          </div>

          <div className="w-full max-w-sm space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your health portal</p>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
            )}

            <div className="space-y-4">
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
                      onKeyDown={handleKeyDown}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30',
                          'transition-all placeholder:text-muted-foreground/60',
                          error && 'border-red-300'
                      )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                          'w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm outline-none',
                          'focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30',
                          'transition-all placeholder:text-muted-foreground/60',
                          error && 'border-red-300'
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
              </div>

              {/* Submit */}
              <button
                  onClick={signIn}
                  disabled={isPending}
                  className={cn(
                      'w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background',
                      'hover:bg-foreground/90 active:scale-[0.99] transition-all',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      'flex items-center justify-center gap-2'
                  )}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? 'Signing in…' : 'Sign In'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-foreground hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}
