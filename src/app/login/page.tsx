'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const { data } = await api.post('/auth/login', {
        email:    form.get('email'),
        password: form.get('password'),
      })
      localStorage.setItem('token', data.token)
      router.push('/')
    } catch {
      setError('Email ou senha incorretos.')
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="email"    placeholder="Email" type="email" required />
        <input name="password" placeholder="Senha" type="password" required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem conta? <a href="/register">Criar conta</a></p>
    </main>
  )
}