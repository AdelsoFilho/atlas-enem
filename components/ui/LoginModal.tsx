"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, LogIn, Eye, UserPlus, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type Tab = "login" | "register"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signUp } = useAuth()

  const [tab, setTab]         = useState<Tab>("login")
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [name, setName]       = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function reset() {
    setEmail(""); setPassword(""); setName("")
    setError(null); setSuccess(null); setLoading(false)
  }

  function handleClose() { reset(); onClose() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (tab === "login") {
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(
          err.message.includes("Invalid login")
            ? "E-mail ou senha incorretos."
            : err.message
        )
        setLoading(false)
      } else {
        handleClose()
      }
    } else {
      const { error: err } = await signUp(email, password, name)
      if (err) {
        setError(err.message)
        setLoading(false)
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar.")
        setLoading(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm rounded-2xl bg-[#0d1117] border border-neutral-800 p-8 shadow-2xl pointer-events-auto"
              style={{ boxShadow: "0 0 60px #3b82f615, 0 25px 50px rgba(0,0,0,0.8)" }}
            >
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" suppressHydrationWarning />
              </button>

              {/* Icon */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950 border border-blue-900">
                <User className="h-7 w-7 text-blue-400" suppressHydrationWarning />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 rounded-lg bg-neutral-900 border border-neutral-800 p-1 mb-6">
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); reset() }}
                    className={[
                      "flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-widest transition-all",
                      tab === t
                        ? "bg-[#388bfd] text-white"
                        : "text-neutral-500 hover:text-neutral-300",
                    ].join(" ")}
                  >
                    {t === "login" ? "Entrar" : "Criar Conta"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === "register" && (
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#388bfd]/50 transition-colors"
                  />
                )}
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#388bfd]/50 transition-colors"
                />
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#388bfd]/50 transition-colors"
                />

                {/* Error / Success */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-800/50 px-3 py-2">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" suppressHydrationWarning />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-950/40 border border-green-800/50 px-3 py-2">
                    <p className="text-xs text-green-300">{success}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !!success}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    boxShadow: "0 0 18px #3b82f625",
                    minHeight: 48,
                  }}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" suppressHydrationWarning />
                  ) : tab === "login" ? (
                    <><LogIn className="h-4 w-4" suppressHydrationWarning /> Entrar</>
                  ) : (
                    <><UserPlus className="h-4 w-4" suppressHydrationWarning /> Criar Conta</>
                  )}
                </button>
              </form>

              {/* Visitor mode */}
              <div className="mt-4 pt-4 border-t border-neutral-900">
                <button
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 text-xs text-neutral-600 hover:text-neutral-400 transition-colors py-1"
                >
                  <Eye className="h-3 w-3" suppressHydrationWarning />
                  Continuar como Visitante
                  <span className="text-neutral-700">· histórico não salvo</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
