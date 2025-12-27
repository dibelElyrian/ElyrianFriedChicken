'use client'

import { MenuItem } from '@/types'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import Image from 'next/image'
import { Plus } from 'lucide-react'

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddToCart = () => {
    addToCart(item)
    showToast(`Added ${item.name} to cart`, 'success')
  }

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
      <div className="relative h-56 w-full bg-muted overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
            <span className="text-sm">No Image Available</span>
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Sold Out</span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-foreground leading-tight">{item.name}</h3>
          <span className="text-lg font-bold text-primary whitespace-nowrap ml-4">₱{item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">{item.description}</p>
        
        <button
          onClick={handleAddToCart}
          disabled={!item.is_available}
          className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            item.is_available
              ? 'bg-primary text-white hover:bg-red-700 active:bg-red-800'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Plus size={18} />
          {item.is_available ? 'Add to Order' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}
