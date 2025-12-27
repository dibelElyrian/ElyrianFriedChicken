'use client'

import { useState } from 'react'
import { login } from '../actions'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground">Enter the secret password</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl bg-muted border-transparent focus:bg-card focus:border-primary focus:ring-0 transition-all outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
