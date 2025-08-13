'use client'

import React from 'react'
import Image from 'next/image'

const CompanySection: React.FC = () => {
  // 30 major companies with their logos
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
    { name: 'NVIDIA', logo: 'https://logo.clearbit.com/nvidia.com', careers: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'LinkedIn', logo: 'https://logo.clearbit.com/linkedin.com', careers: 'https://careers.linkedin.com/' },
    { name: 'Twitter', logo: 'https://logo.clearbit.com/twitter.com', careers: 'https://careers.twitter.com/' },
    { name: 'Slack', logo: 'https://logo.clearbit.com/slack.com', careers: 'https://slack.com/careers' },
    { name: 'Zoom', logo: 'https://logo.clearbit.com/zoom.us', careers: 'https://careers.zoom.us/' },
    { name: 'Dropbox', logo: 'https://logo.clearbit.com/dropbox.com', careers: 'https://jobs.dropbox.com/' },
    { name: 'Square', logo: 'https://logo.clearbit.com/squareup.com', careers: 'https://careers.squareup.com/' },
    { name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', careers: 'https://stripe.com/jobs' },
    { name: 'PayPal', logo: 'https://logo.clearbit.com/paypal.com', careers: 'https://www.paypal.com/us/webapps/mpp/jobs' },
    { name: 'eBay', logo: 'https://logo.clearbit.com/ebay.com', careers: 'https://careers.ebayinc.com/' },
    { name: 'Shopify', logo: 'https://logo.clearbit.com/shopify.com', careers: 'https://www.shopify.com/careers' },
    { name: 'GitHub', logo: 'https://logo.clearbit.com/github.com', careers: 'https://github.com/about/careers' },
    { name: 'GitLab', logo: 'https://logo.clearbit.com/gitlab.com', careers: 'https://about.gitlab.com/jobs/' },
    { name: 'Atlassian', logo: 'https://logo.clearbit.com/atlassian.com', careers: 'https://www.atlassian.com/company/careers' },
    { name: 'ServiceNow', logo: 'https://logo.clearbit.com/servicenow.com', careers: 'https://www.servicenow.com/careers.html' }
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join thousands of forward-thinking companies using ResumeIT to find exceptional talent faster and more efficiently.
          </p>
        </div>

        {/* Company logos grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-8 items-center justify-items-center opacity-70 hover:opacity-100 transition-opacity duration-300">
          {companies.slice(0, 20).map((company, index) => (
            <div
              key={company.name}
              className="group relative"
            >
              <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-lg hover:shadow-md transition-all duration-200 group-hover:scale-110 border border-gray-200">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={40}
                  height={40}
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="text-xs font-semibold text-gray-600 text-center">${company.name.substring(0, 3)}</div>`;
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join These Industry Leaders?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start finding exceptional candidates today. Our AI-powered platform helps you identify, evaluate, and hire the best talent faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">98%</div>
            <div className="text-gray-600">Client Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-gray-600">Companies Trust Us</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">2.5M+</div>
            <div className="text-gray-600">Successful Matches</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompanySection
