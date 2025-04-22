"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Users, BarChart2, Settings, Menu, X } from "lucide-react"
import { AuthProvider } from "@/lib/context/AuthContext"
import { NotificationProvider } from "@/lib/context/NotificationContext"
import NotificationPanel from "@/components/notifications/notification-panel"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname() || ""

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  const navItems = [
    {
      name: "Equipment",
      href: "/equipment",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex h-screen">
          {/* Mobile menu button */}
          <button
            className="fixed top-4 left-4 z-50 block lg:hidden bg-white p-2 rounded-md shadow-lg"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Sidebar */}
          <div
            className={`w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 transition-transform duration-200 ease-in-out z-30`}
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold">Equipment Manager</h1>
            </div>
            <nav className="mt-6">
              <ul>
                {navItems.map((item) => (
                  <li key={item.name} className="px-6 py-2">
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                        pathname.includes(item.href)
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={closeMenu}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:ml-64 flex flex-col">
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50">
              <NotificationPanel />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
} 