'use client';

import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  onComplete?: () => void;
}

export default function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        {/* Animated Hearts */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-6xl">💕</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-4xl animation-delay-200">💐</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ping text-3xl animation-delay-400">💍</div>
          </div>
        </div>

        {/* Logo and Title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            Perfect Proposal
          </h1>
          <p className="text-gray-600 text-lg">Creating magical moments...</p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Percentage */}
        <div className="text-2xl font-semibold text-gray-700">
          {progress}%
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 text-2xl animate-float animation-delay-100">🌹</div>
        <div className="absolute top-20 right-20 text-3xl animate-float animation-delay-300">✨</div>
        <div className="absolute bottom-20 left-20 text-2xl animate-float animation-delay-500">💖</div>
        <div className="absolute bottom-10 right-10 text-3xl animate-float animation-delay-700">🎀</div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
}
