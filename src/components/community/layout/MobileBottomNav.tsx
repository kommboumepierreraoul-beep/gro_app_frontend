'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCommunityStore } from '@/store/community.store'
 
export function MobileBottomNav() {
  const pathname       = usePathname()
  const unreadNotifs   = useCommunityStore((s) => s.unreadNotifs)
  const unreadMessages = useCommunityStore((s) => s.unreadMessages)
 
  const links = [
    { href: '/community',     label: 'Accueil',   icon: '🏠' },
    { href: '/messages',      label: 'Messages',  icon: '💬', badge: unreadMessages },
    { href: '/announcements', label: 'Annonces',  icon: '📣' },
    { href: '/notifications', label: 'Notifs',    icon: '🔔', badge: unreadNotifs },
    { href: '/profile',       label: 'Profil',    icon: '👤' },
  ]
 
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-gray-50 border-t border-gray-100 md:hidden">
      <div className="flex">
        {links.map(({ href, label, icon, badge }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center py-2 transition ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}>
              <div className="relative">
                <span className="text-xl">{icon}</span>
                {badge! > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge! > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
 