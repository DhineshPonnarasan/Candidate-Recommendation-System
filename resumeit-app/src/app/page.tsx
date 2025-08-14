import Hero from '@/components/home/Hero'
import CompanySection from '@/components/home/CompanySection'
import ContentSection from '@/components/home/ContentSection'
import YouTubeVideos from '@/components/home/YouTubeVideos'
import Reviews from '@/components/home/Reviews'
export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CompanySection />
      <ContentSection />
      <YouTubeVideos />
      <Reviews />
    </div>
  )
}
