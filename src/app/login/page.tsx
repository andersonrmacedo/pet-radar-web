'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.get('email'),
        password: form.get('password'),
      })
      localStorage.setItem('token', data.token)
      router.push('/map')
    } catch {
      setError('Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3 text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-[#F59E0B] transition-colors"

  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#30363D]">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl">🐾</span>
          <span className="text-[#F59E0B] font-bold text-base tracking-tight">Pet Radar</span>
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#E6EDF3]">Bem-vindo de volta</h1>
            <p className="text-[#7D8590] text-sm mt-1">Entre na sua conta para reportar animais</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[#7D8590] text-sm mb-2 block font-medium">Email</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                inputMode="email"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[#7D8590] text-sm mb-2 block font-medium">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 text-[#0D1117] font-bold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-[#7D8590] text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-[#F59E0B] hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}