'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await api.post('/auth/register', {
        name:     form.get('name'),
        email:    form.get('email'),
        password: form.get('password'),
      })
      router.push('/login')
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="name"     placeholder="Nome"  required />
        <input name="email"    placeholder="Email" type="email" required />
        <input name="password" placeholder="Senha" type="password" required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Criar conta</button>
      </form>
      <p>Já tem conta? <a href="/login">Entrar</a></p>
    </main>
  )
}