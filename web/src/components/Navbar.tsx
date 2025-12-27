'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { ShoppingBag, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { cartCount } = useCart()
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="bg-card border-b border-border text-foreground p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Elyrian's Fried Chicken
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 mr-2">
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full hover:bg-orange-200 transition">
                <span>🍗</span>
                <span>{profile?.points || 0} pts</span>
                {profile?.full_name && (
                  <span className="border-l border-orange-300 dark:border-orange-700 pl-2 ml-1 font-bold">
                    {profile.full_name}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => signOut()}
                className="text-sm text-muted-foreground hover:text-red-500 transition flex items-center gap-1"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 mr-2">
              <User size={16} />
              Login
            </Link>
          )}
          
          <div className="h-6 w-px bg-border mx-1"></div>

          <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
