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
      {/* 4-Color Google-Style TaskFlow Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        {/* Blue bar */}
        <path
          d="M10 14C10 9.58172 13.5817 6 18 6H30C34.4183 6 38 9.58172 38 14V17H18C13.5817 17 10 14 10 14Z"
          fill="#4285F4"
        />
        {/* Red block */}
        <path
          d="M30 6L38 14V26C38 30.4183 34.4183 34 30 34H26V17H30V6Z"
          fill="#EA4335"
        />
        {/* Yellow base hook */}
        <path
          d="M10 24C10 19.5817 13.5817 16 18 16H22V32C22 36.4183 18.4183 40 14 40C11.7909 40 10 38.2091 10 36V24Z"
          fill="#FBBC05"
        />
        {/* Green checkmark ribbon */}
        <path
          d="M16.5 28L23 34.5C24.1 35.6 25.9 35.6 27 34.5L41.5 19C42.6 17.9 42.6 16.1 41.5 15C40.4 13.9 38.6 13.9 37.5 15L25 27.5L19.5 22C18.4 20.9 16.6 20.9 15.5 22C14.4 23.1 14.4 24.9 15.5 26L16.5 28Z"
          fill="#34A853"
        />
      </svg>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className="font-semibold text-white text-base font-sans tracking-tight">
            Task<span className="text-[#4285F4]">Flow</span>
          </span>
          {variant === 'full' && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-[#1e2334] text-[#8ab4f8] border border-[#8ab4f8]/30 rounded-full">
              Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
};
