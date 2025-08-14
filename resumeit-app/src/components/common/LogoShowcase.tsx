import React from 'react';
import ResumeITLogo from './ResumeITLogo';
const LogoShowcase: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          ResumeIT Logo Variations
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Large with Text</h3>
            <ResumeITLogo width={200} height={200} showText={true} />
          </div>
          <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center">
            <h3 className="text-white text-lg font-semibold mb-4">Medium Icon Only</h3>
            <ResumeITLogo width={120} height={120} showText={false} />
          </div>
          <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center">
            <h3 className="text-white text-lg font-semibold mb-4">Small for Navbar</h3>
            <ResumeITLogo width={60} height={60} showText={false} />
          </div>
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-gray-800 text-lg font-semibold mb-4">On Light Background</h3>
            <ResumeITLogo width={150} height={150} showText={true} />
          </div>
          <div className="bg-gray-800 p-8 rounded-lg col-span-2">
            <h3 className="text-white text-lg font-semibold mb-4">Horizontal Layout</h3>
            <div className="flex items-center gap-4">
              <ResumeITLogo width={80} height={80} showText={false} />
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
                ResumeIT
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Usage Examples</h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Import and Use</h3>
            <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto">
{`import ResumeITLogo from '@/components/common/ResumeITLogo';
<ResumeITLogo />
<ResumeITLogo width={60} height={60} showText={false} />
<ResumeITLogo 
  width={200} 
  height={200} 
  className="hover:scale-105 transition-transform" 
  showText={true} 
/>`}
            </pre>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h3 className="text-white text-lg font-semibold mb-4">Static SVG Usage</h3>
            <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto">
{`// For static usage (favicon, etc.)
<img src="/images/resumeit-logo.svg" alt="ResumeIT" width="200" />
<link rel="icon" href="/favicon-logo.svg" type="image/svg+xml" />`}
            </pre>
          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Brand Colors</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-800 rounded-lg mx-auto mb-2"></div>
              <p className="text-white text-sm">#1e40af</p>
              <p className="text-gray-400 text-xs">Deep Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-white text-sm">#3b82f6</p>
              <p className="text-gray-400 text-xs">Primary Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-400 rounded-lg mx-auto mb-2"></div>
              <p className="text-white text-sm">#60a5fa</p>
              <p className="text-gray-400 text-xs">Light Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-700 rounded-lg mx-auto mb-2"></div>
              <p className="text-white text-sm">#2563eb</p>
              <p className="text-gray-400 text-xs">Neural Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-800 rounded-lg mx-auto mb-2"></div>
              <p className="text-white text-sm">#1d4ed8</p>
              <p className="text-gray-400 text-xs">Neural Dark</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LogoShowcase;
