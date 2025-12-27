'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bell } from 'lucide-react'

export default function AdminOrderNotifier() {
  const [newOrders, setNewOrders] = useState<number>(0)

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('New order received!', payload)
          setNewOrders((prev) => prev + 1)
          playNotificationSound()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(e => console.log('Audio play failed', e))
    } catch (e) {
      console.error('Error playing sound', e)
    }
  }

  if (newOrders === 0) return null

  return (
    <div 
      className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer animate-bounce"
      onClick={() => {
        setNewOrders(0)
        window.location.reload()
      }}
    >
      <div className="bg-white/20 p-2 rounded-full">
        <Bell size={24} />
      </div>
      <div>
        <p className="font-bold">{newOrders} New Order{newOrders > 1 ? 's' : ''}!</p>
        <p className="text-xs opacity-90">Click to refresh</p>
      </div>
    </div>
  )
}
