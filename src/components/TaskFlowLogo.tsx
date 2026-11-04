import React from 'react';

interface TaskFlowLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon';
}

export const TaskFlowLogo: React.FC<TaskFlowLogoProps> = ({ 
  size = 28, 
  showText = true, 
  className = '',
  variant = 'full'
}) => {
  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      {/* Unique TaskFlow Shield & Flow Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="tf-grad-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e2640" />
            <stop offset="100%" stopColor="#0f1322" />
          </linearGradient>
          <linearGradient id="tf-blue-cyan" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="100%" stopColor="#24c6ff" />
          </linearGradient>
          <linearGradient id="tf-green" x1="100" y1="200" x2="400" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34A853" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
          <linearGradient id="tf-yellow-orange" x1="0" y1="100" x2="300" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBC04" />
            <stop offset="100%" stopColor="#ff7043" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container Base */}
        <rect x="32" y="32" width="448" height="448" rx="128" fill="url(#tf-grad-bg)" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />

        {/* TaskFlow Interlocking Flow Symbol */}
        <path d="M120 160 C120 137.909 137.909 120 160 120 L352 120 C374.091 120 392 137.909 392 160 C392 182.091 374.091 200 352 200 L160 200 C137.909 200 120 182.091 120 160 Z" fill="url(#tf-blue-cyan)" />
        <path d="M216 160 L296 160 L296 320 C296 342.091 278.091 360 256 360 C233.909 360 216 342.091 216 320 L216 160 Z" fill="url(#tf-yellow-orange)" opacity="0.9" />
        <path d="M150 280 L230 360 C245 375 267 375 282 360 L410 230 C425 215 425 191 410 176 C395 161 371 161 356 176 L256 276 L190 210 C175 195 151 195 136 210 C121 225 121 249 136 264 L150 280 Z" fill="url(#tf-green)" />
      </svg>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className="font-bold text-white text-base font-sans tracking-tight">
            Task<span className="text-[#4285F4]">Flow</span>
          </span>
          {variant === 'full' && (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-[#4285F4]/15 text-[#8ab4f8] border border-[#4285F4]/30 rounded-full">
              Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
