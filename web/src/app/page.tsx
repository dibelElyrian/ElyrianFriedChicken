import { supabase } from '@/lib/supabaseClient'
import MenuGrid from '@/components/MenuGrid'
import Image from 'next/image'

export const revalidate = 0

export default async function Home() {
  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching menu:', error)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-gray-600">Could not load the menu. Please try again later.</p>
        <p className="text-sm text-gray-400 mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-12 bg-muted border border-border">
        <div className="absolute inset-0 opacity-60">
          <Image
            src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop"
            alt="Fried Chicken Banner"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Elyrian's Fried Chicken
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Crispy, juicy, and delivered straight to your desk every morning.
            Fuel your code with the best chicken in the office.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Morning Menu</h2>
          <span className="text-sm text-muted-foreground">Order before 9:00 AM</span>
        </div>

        {menuItems && menuItems.length > 0 ? (
          <MenuGrid items={menuItems} />
        ) : (
          <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-lg">No menu items available right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
