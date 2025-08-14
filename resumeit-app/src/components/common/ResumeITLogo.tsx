import React from 'react';
interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}
export const ResumeITLogo: React.FC<LogoProps> = ({ 
  width = 200, 
  height = 200, 
  className = "",
  showText = true 
}) => {
  const logoSize = Math.min(width, height);
  const textHeight = showText ? logoSize * 0.3 : 0;
  const totalHeight = logoSize + textHeight;
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg 
        width={logoSize} 
        height={logoSize} 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle 
          cx="100" 
          cy="100" 
          r="95" 
          fill="none" 
          stroke="url(#brainGradient)" 
          strokeWidth="3"
          filter="url(#glow)"
        />
        <g clipPath="url(#leftHalf)">
          <defs>
            <clipPath id="leftHalf">
              <rect x="0" y="0" width="100" height="200" />
            </clipPath>
          </defs>
          <path 
            d="M40 80 Q30 60 50 50 Q70 40 80 55 Q90 45 95 65 Q100 80 85 95 Q75 110 65 105 Q50 120 40 100 Q25 90 40 80 Z"
            fill="url(#brainGradient)"
            opacity="0.9"
          />
          <path 
            d="M45 70 Q55 65 65 75 Q75 85 70 95"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="2"
            opacity="0.7"
          />
          <path 
            d="M50 85 Q60 80 70 90"
            fill="none"
            stroke="url(#brainGradient)"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </g>
        <g clipPath="url(#rightHalf)">
          <defs>
            <clipPath id="rightHalf">
              <rect x="100" y="0" width="100" height="200" />
            </clipPath>
          </defs>
          <circle cx="120" cy="60" r="4" fill="url(#neuralGradient)" opacity="0.9" />
          <circle cx="140" cy="70" r="3" fill="url(#neuralGradient)" opacity="0.8" />
          <circle cx="160" cy="55" r="3.5" fill="url(#neuralGradient)" opacity="0.9" />
          <circle cx="170" cy="80" r="3" fill="url(#neuralGradient)" opacity="0.7" />
          <circle cx="115" cy="90" r="4.5" fill="url(#neuralGradient)" opacity="0.9" />
          <circle cx="135" cy="100" r="3.5" fill="url(#neuralGradient)" opacity="0.8" />
          <circle cx="155" cy="85" r="3" fill="url(#neuralGradient)" opacity="0.8" />
          <circle cx="175" cy="105" r="3.5" fill="url(#neuralGradient)" opacity="0.9" />
          <circle cx="125" cy="125" r="3.5" fill="url(#neuralGradient)" opacity="0.8" />
          <circle cx="145" cy="135" r="4" fill="url(#neuralGradient)" opacity="0.9" />
          <circle cx="165" cy="120" r="3" fill="url(#neuralGradient)" opacity="0.7" />
          <line x1="120" y1="60" x2="140" y2="70" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="140" y1="70" x2="160" y2="55" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="120" y1="60" x2="115" y2="90" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="140" y1="70" x2="135" y2="100" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="160" y1="55" x2="155" y2="85" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="170" y1="80" x2="175" y2="105" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="115" y1="90" x2="135" y2="100" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="135" y1="100" x2="155" y2="85" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="155" y1="85" x2="175" y2="105" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="115" y1="90" x2="125" y2="125" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="135" y1="100" x2="145" y2="135" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="155" y1="85" x2="165" y2="120" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
          <line x1="125" y1="125" x2="145" y2="135" stroke="url(#neuralGradient)" strokeWidth="1.5" opacity="0.6" />
          <line x1="145" y1="135" x2="165" y2="120" stroke="url(#neuralGradient)" strokeWidth="1" opacity="0.5" />
        </g>
        <line 
          x1="100" 
          y1="20" 
          x2="100" 
          y2="180" 
          stroke="url(#brainGradient)" 
          strokeWidth="1" 
          opacity="0.3"
        />
      </svg>
      {showText && (
        <div className="mt-4 text-center">
          <div 
            className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent"
            style={{ 
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              letterSpacing: '0.02em'
            }}
          >
            ResumeIT
          </div>
        </div>
      )}
    </div>
  );
};
export default ResumeITLogo;
