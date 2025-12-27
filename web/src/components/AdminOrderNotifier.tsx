'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bell, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminOrderNotifier() {
  const [notification, setNotification] = useState<{ message: string, visible: boolean }>({ message: '', visible: false })
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log('🔌 Initializing Realtime Subscription...')
    
    const channel = supabase
      .channel('admin-orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('🔔 NEW ORDER RECEIVED:', payload)
          
          // 1. Play Sound
          playNotificationSound()
          
          // 2. Refresh Data
          router.refresh()
          
          // 3. Show Notification
          setNotification({ message: 'New Order Received!', visible: true })
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }))
          }, 5000)
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription Status:', status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    return () => {
      console.log('Cleaning up subscription...')
      supabase.removeChannel(channel)
    }
  }, [router])

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(e => console.log('Audio play failed (user interaction needed first)', e))
    } catch (e) {
      console.error('Error playing sound', e)
    }
  }

  // Status Indicator (Bottom Right)
  if (!notification.visible) {
    if (isConnected) {
      return (
        <div className="fixed bottom-4 right-4 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-medium border border-green-200 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Updates Active
        </div>
      )
    }
    return null
  }

  // Active Notification Toast
  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
      <div className="bg-white/20 p-2 rounded-full animate-bounce">
        <Bell size={24} />
      </div>
      <div>
        <p className="font-bold">{notification.message}</p>
        <p className="text-xs opacity-90">Dashboard updated automatically</p>
      </div>
      <button 
        onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
        className="ml-2 p-1 hover:bg-white/20 rounded-full transition"
      >
        <X size={16} />
      </button>
    </div>
  )
}

