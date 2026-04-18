'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface LoadingAnimationProps {
  onComplete?: () => void;
  minLoadingTime?: number;
}

export default function LoadingAnimation({ 
  onComplete, 
  minLoadingTime = 2500 
}: LoadingAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const { setLoading } = useAppStore();

  useEffect(() => {
    setLoading(true);
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);
          
          setTimeout(() => {
            setIsVisible(false);
            setLoading(false);
            onComplete?.();
          }, remainingTime);
          
          return 100;
        }
        return prev + Math.random() * 3 + 1; // Variable progress speed
      });
    }, 50);

    return () => {
      clearInterval(progressInterval);
      setLoading(false);
    };
  }, [onComplete, minLoadingTime, setLoading]);

  if (!isVisible) return null;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.8 } }
  };

  const heartVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { 
      scale: [1, 1.2, 1], 
      rotate: [0, 15, -15, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    },
    exit: { opacity: 0, transition: { duration: 0.8 } }
  };

  const floatingElements = [
    { emoji: '🌹', delay: 0, duration: 3, x: 10, y: 10 },
    { emoji: '✨', delay: 0.3, duration: 4, x: -20, y: 20 },
    { emoji: '💖', delay: 0.5, duration: 3.5, x: 15, y: -15 },
    { emoji: '🎀', delay: 0.7, duration: 3.2, x: -10, y: -20 },
    { emoji: '💐', delay: 1, duration: 2.8, x: 20, y: 10 },
    { emoji: '🌸', delay: 1.2, duration: 3.3, x: -15, y: 15 },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-surface to-card overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-highlight/20 animate-pulse" />
          </div>

          <div className="relative z-10 text-center max-w-md mx-auto px-4">
            {/* Animated Hearts */}
            <div className="relative mb-12 h-32">
              <motion.div
                variants={heartVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-6xl animate-glow">💕</div>
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-4xl">💐</div>
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: 1
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-3xl">💍</div>
              </motion.div>
            </div>

            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3 animate-glow">
                Perfect Wedding
              </h1>
              <p className="text-text-secondary text-lg animate-pulse">
                Creating magical moments...
              </p>
            </motion.div>

            {/* Loading Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full max-w-xs mx-auto mb-6"
            >
              <div className="glass-card p-1">
                <div className="bg-surface rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-primary h-full rounded-full relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Loading Percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-2xl font-semibold text-text-primary mb-8"
            >
              {Math.round(progress)}%
            </motion.div>

            {/* Status Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-sm text-text-secondary space-y-1"
            >
              <p className="animate-pulse">Preparing your perfect experience...</p>
              <p className="text-xs opacity-70">Almost there ✨</p>
            </motion.div>
          </div>

          {/* Floating Elements */}
          {floatingElements.map((element, index) => (
            <motion.div
              key={index}
              className="absolute text-3xl opacity-60 pointer-events-none"
              style={{ 
                left: `${element.x}%`, 
                top: `${element.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: element.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: element.delay
              }}
            >
              {element.emoji}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
