'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  FaGoogle, 
  FaMicrosoft, 
  FaApple, 
  FaAmazon,
  FaFacebook,
  FaSpotify,
  FaUber,
  FaAirbnb,
  FaSlack,
  FaShopify,
  FaDropbox,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa'
import { 
  SiNvidia,
  SiSalesforce,
  SiZoom,
  SiAsana,
  SiNotion,
  SiNetflix,
  SiAdobe,
  SiTesla
} from 'react-icons/si'
interface FloatingCompany {
  id: number
  Icon: React.ComponentType<any>
  name: string
  x: number
  y: number
  size: number
  duration: number
  delay: number
}
const companies = [
  { Icon: FaGoogle, name: 'Google' },
  { Icon: FaMicrosoft, name: 'Microsoft' },
  { Icon: FaApple, name: 'Apple' },
  { Icon: FaAmazon, name: 'Amazon' },
  { Icon: FaFacebook, name: 'Meta' },
  { Icon: SiNetflix, name: 'Netflix' },
  { Icon: FaSpotify, name: 'Spotify' },
  { Icon: FaUber, name: 'Uber' },
  { Icon: FaAirbnb, name: 'Airbnb' },
  { Icon: FaSlack, name: 'Slack' },
  { Icon: FaShopify, name: 'Shopify' },
  { Icon: FaDropbox, name: 'Dropbox' },
  { Icon: SiAdobe, name: 'Adobe' },
  { Icon: SiTesla, name: 'Tesla' },
  { Icon: FaLinkedin, name: 'LinkedIn' },
  { Icon: SiNvidia, name: 'Nvidia' },
  { Icon: SiSalesforce, name: 'Salesforce' },
  { Icon: SiZoom, name: 'Zoom' },
  { Icon: SiAsana, name: 'Asana' },
  { Icon: SiNotion, name: 'Notion' },
  { Icon: FaTwitter, name: 'Twitter' },
  { Icon: FaInstagram, name: 'Instagram' },
  { Icon: FaYoutube, name: 'YouTube' },
]
const FloatingIcons: React.FC = () => {
  const [companyIcons, setCompanyIcons] = useState<FloatingCompany[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const updateDimensions = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }, [])
  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [updateDimensions])
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return
    const generateIcons = () => {
      const newIcons: FloatingCompany[] = []
      const iconCount = Math.min(12, Math.floor(dimensions.width / 200) + 6)
      for (let i = 0; i < iconCount; i++) {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)]
        const margin = 80
        const x = margin + Math.random() * (dimensions.width - 2 * margin)
        const y = margin + Math.random() * (dimensions.height - 2 * margin)
        newIcons.push({
          id: i,
          Icon: randomCompany.Icon,
          name: randomCompany.name,
          x,
          y,
          size: 24 + Math.random() * 16, // 24-40px
          duration: 25 + Math.random() * 20, // 25-45s
          delay: Math.random() * 10, // 0-10s delay
        })
      }
      setCompanyIcons(newIcons)
    }
    generateIcons()
  }, [dimensions])
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {companyIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute"
          style={{
            left: 0,
            top: 0,
          }}
          animate={{
            x: [
              icon.x,
              icon.x + (Math.random() - 0.5) * 200,
              icon.x + (Math.random() - 0.5) * 150,
              icon.x + (Math.random() - 0.5) * 100,
              icon.x
            ],
            y: [
              icon.y,
              icon.y + (Math.random() - 0.5) * 150,
              icon.y + (Math.random() - 0.5) * 200,
              icon.y + (Math.random() - 0.5) * 100,
              icon.y
            ],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: icon.delay,
          }}
        >
          <motion.div
            whileHover={{ 
              scale: 1.4, 
              opacity: 1,
              transition: { duration: 0.2 }
            }}
            className="cursor-pointer pointer-events-auto"
            style={{
              fontSize: `${icon.size}px`,
              opacity: 0.15,
              color: '#6B7280',
            }}
            title={icon.name}
          >
            <icon.Icon />
          </motion.div>
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 pointer-events-none" />
    </div>
  )
}
export default FloatingIcons
