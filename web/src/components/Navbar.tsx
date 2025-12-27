'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ShoppingBag } from 'lucide-react'

export default function Navbar() {
  const { cartCount } = useCart()

  return (
    <nav className="bg-card border-b border-border text-foreground p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Elyrian's Fried Chicken
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm hover:text-primary transition-colors">
            Admin
          </Link>
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
