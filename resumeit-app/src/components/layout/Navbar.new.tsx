'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'AI Demo', path: '/ai-recommendation' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-secondary-200/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                ResumeIT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === item.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                }`}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-100 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors group"
                >
                  <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Profile
                </Link>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 text-secondary-600 hover:text-danger-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors group"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-secondary-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-glow hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-secondary-200/50 rounded-b-2xl shadow-soft">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.path}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        pathname === item.path
                          ? 'text-primary-600 bg-primary-50 border border-primary-200'
                          : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-secondary-200">
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-xl text-base font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-danger-600 hover:bg-danger-50 rounded-xl text-base font-medium transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-center text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-xl text-base font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-3 text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-base font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
