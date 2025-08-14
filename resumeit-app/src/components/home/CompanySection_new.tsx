'use client'
import React from 'react'
import Image from 'next/image'
const CompanySection: React.FC = () => {
  const companies = [
    { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', careers: 'https://www.amazon.jobs/' },
    { name: 'Apple', logo: 'https://logo.clearbit.com/apple.com', careers: 'https://jobs.apple.com/' },
    { name: 'Google', logo: 'https://logo.clearbit.com/google.com', careers: 'https://careers.google.com/' },
    { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', careers: 'https://careers.microsoft.com/' },
    { name: 'Meta', logo: 'https://logo.clearbit.com/facebook.com', careers: 'https://www.metacareers.com/' },
    { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', careers: 'https://jobs.netflix.com/' },
    { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com', careers: 'https://www.tesla.com/careers' },
    { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com', careers: 'https://www.uber.com/us/en/careers/' },
    { name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', careers: 'https://careers.airbnb.com/' },
    { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com', careers: 'https://www.lifeatspotify.com/' },
    { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com', careers: 'https://adobe.wd5.myworkdayjobs.com/' },
    { name: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com', careers: 'https://careers.salesforce.com/' },
    { name: 'Oracle', logo: 'https://logo.clearbit.com/oracle.com', careers: 'https://www.oracle.com/careers/' },
    { name: 'IBM', logo: 'https://logo.clearbit.com/ibm.com', careers: 'https://www.ibm.com/careers' },
    { name: 'Intel', logo: 'https://logo.clearbit.com/intel.com', careers: 'https://jobs.intel.com/' },
    { name: 'Nvidia', logo: 'https://logo.clearbit.com/nvidia.com', careers: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'PayPal', logo: 'https://logo.clearbit.com/paypal.com', careers: 'https://www.paypal.com/us/webapps/mpp/jobs' },
    { name: 'LinkedIn', logo: 'https://logo.clearbit.com/linkedin.com', careers: 'https://careers.linkedin.com/' },
    { name: 'Twitter', logo: 'https://logo.clearbit.com/twitter.com', careers: 'https://careers.twitter.com/' },
    { name: 'Dropbox', logo: 'https://logo.clearbit.com/dropbox.com', careers: 'https://jobs.dropbox.com/' },
    { name: 'Slack', logo: 'https://logo.clearbit.com/slack.com', careers: 'https://slack.com/careers' },
    { name: 'Zoom', logo: 'https://logo.clearbit.com/zoom.us', careers: 'https://careers.zoom.us/' },
    { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', careers: 'https://www.shopify.com/careers' },
    { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', careers: 'https://stripe.com/jobs' },
    { name: 'Discord', logo: 'https://logo.clearbit.com/discord.com', careers: 'https://discord.com/jobs' },
    { name: 'GitHub', logo: 'https://logo.clearbit.com/github.com', careers: 'https://github.com/about/careers' },
    { name: 'GitLab', logo: 'https://logo.clearbit.com/gitlab.com', careers: 'https://about.gitlab.com/jobs/' },
    { name: 'Atlassian', logo: 'https://logo.clearbit.com/atlassian.com', careers: 'https://www.atlassian.com/company/careers' },
    { name: 'Figma', logo: 'https://logo.clearbit.com/figma.com', careers: 'https://www.figma.com/careers/' },
    { name: 'Notion', logo: 'https://logo.clearbit.com/notion.so', careers: 'https://www.notion.so/careers' },
  ]
  const handleCompanyClick = (careersUrl: string) => {
    window.open(careersUrl, '_blank', 'noopener,noreferrer')
  }
  return (
    <div>
      <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Leading Companies
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of companies that use ResumeIT to find exceptional talent faster and more efficiently.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-200">Active Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500K+</div>
              <div className="text-blue-200">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-200">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-200">Successful Hires</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {companies.slice(0, 15).map((company, index) => (
              <div
                key={company.name}
                onClick={() => handleCompanyClick(company.careers)}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 mb-4 bg-white rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=6366f1&color=fff&size=48`;
                      }}
                    />
                  </div>
                  <span className="text-white font-medium text-sm text-center">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Ready to Join These Industry Leaders?
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Start using ResumeIT today and discover why leading companies trust us to find their next great hires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
export default CompanySection
