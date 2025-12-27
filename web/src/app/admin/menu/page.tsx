import { getMenuItems } from './actions'
import MenuManager from './MenuManager'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

export default async function MenuPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('admin_session')?.value === 'true'

  if (!isLoggedIn) {
    redirect('/admin/login')
  }

  const items = await getMenuItems()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">Add, edit, or remove items from your menu.</p>
      </div>
      
      <MenuManager initialItems={items} />
    </div>
  )
}
