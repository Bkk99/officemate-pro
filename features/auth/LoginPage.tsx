// pages/login.tsx หรือ components/LoginPage.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard') // ✅ ไปหน้านี้เมื่อ login สำเร็จ
    }
  }

  return (
    <form onSubmit={handleLogin}>
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Email"
  required
/>

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">เข้าสู่ระบบ</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
