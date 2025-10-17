"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  Waves,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Target,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Get singleton Supabase client once
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Success - redirect to home (middleware will handle session)
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black dark">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-8 flex items-center justify-center space-x-3">
            <Waves className="h-7 w-7 text-white" />
            <span className="text-2xl font-semibold tracking-tight text-white">
              Alphatide.ai
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Your Edge in Options Trading
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl font-normal text-gray-400">
            Navigate the options market with clarity and confidence.
            Alphatide.ai harnesses advanced AI to deliver real-time insights.
          </p>

          {/* Login Form */}
          <div className="mx-auto max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input fields row */}
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="email" className="text-left text-gray-200">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    className={`h-12 bg-gray-900 text-white transition-all placeholder:text-gray-500 ${
                      error
                        ? "border-red-500 focus:border-red-400"
                        : "border-gray-700 focus:border-white"
                    }`}
                    required
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="password" className="text-left text-gray-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError(null)
                      }}
                      className={`h-12 bg-gray-900 pr-12 text-white transition-all placeholder:text-gray-500 ${
                        error
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-700 focus:border-white"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Button and error message row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Error message area */}
                <div className="flex-1 sm:order-1">
                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                        <p className="text-sm font-medium text-red-500">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Button */}
                <div className="sm:order-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="group h-12 w-full whitespace-nowrap px-8 font-medium sm:w-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-black border-gray-600"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </header>

        {/* Main Content */}
        <main className="mb-16 grid gap-12 md:grid-cols-2">
          {/* Left Column */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">
              Master the Market&apos;s Pulse
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              Options trading demands precision. Our AI analyzes critical market
              signals—volatility, Greeks, volume, and more—distilling complex
              data into clear, actionable insights. Stay ahead of the curve with
              a tool designed to give you an edge.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="mt-1 h-5 w-5 flex-shrink-0 text-white" />
                <div>
                  <h3 className="font-semibold text-white">
                    Real-Time Analysis
                  </h3>
                  <p className="text-gray-400">
                    Instant insights from live market data.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="mt-1 h-5 w-5 flex-shrink-0 text-white" />
                <div>
                  <h3 className="font-semibold text-white">
                    Simplified Technicals
                  </h3>
                  <p className="text-gray-400">
                    Understand key metrics without the overwhelm.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="mt-1 h-5 w-5 flex-shrink-0 text-white" />
                <div>
                  <h3 className="font-semibold text-white">
                    Trader-Centric Design
                  </h3>
                  <p className="text-gray-400">
                    Built for options traders, by experts who get it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Take Control Today
            </h2>
            <p className="mb-6 text-lg text-gray-400">
              Access Alphatide.ai now and elevate your trading with AI-powered
              insights that give you the competitive edge in options markets.
            </p>
            <div className="mb-8 space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Real-time market analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Advanced options flow tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>AI-powered trading signals</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="h-2 w-2 rounded-full bg-white"></div>
                <span>Professional-grade analytics</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                size="lg"
                disabled
                className="h-12 w-full cursor-not-allowed font-medium opacity-80"
              >
                Join Waitlist
              </Button>
              <p className="text-center text-sm text-gray-500">
                We are currently in invite-only mode as we scale up. Waitlist
                will be available mid Sept 2025.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 pt-8 text-center">
          <p className="mx-auto max-w-2xl text-sm text-gray-500">
            <strong className="text-gray-400">Disclaimer:</strong> Alphatide.ai
            is not financial or investment advice. Our AI provides insights, but
            decisions are yours. Always verify data, as AI can make errors.
          </p>
        </footer>
      </div>
    </div>
  )
}
