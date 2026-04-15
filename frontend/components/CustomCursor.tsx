'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsHidden(false);
  }, []);

  // Handle hover state
  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.matches('button, a, .interactive-card, .glass-card, [role="button"], input, textarea, select');
    
    if (isInteractive) {
      setIsHovering(true);
    }
  }, []);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.matches('button, a, .interactive-card, .glass-card, [role="button"], input, textarea, select');
    
    if (isInteractive) {
      setIsHovering(false);
    }
  }, []);

  // Handle click
  const handleClick = useCallback(() => {
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
  }, []);

  // Handle window enter/leave
  const handleWindowMouseEnter = useCallback(() => setIsHidden(false), []);
  const handleWindowMouseLeave = useCallback(() => setIsHidden(true), []);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseenter', handleWindowMouseEnter);
    document.addEventListener('mouseleave', handleWindowMouseLeave);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleWindowMouseEnter);
      document.removeEventListener('mouseleave', handleWindowMouseLeave);
      document.body.style.cursor = '';
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleClick, handleWindowMouseEnter, handleWindowMouseLeave]);

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: position.x - (isHovering ? 40 : 12),
          top: position.y - (isHovering ? 40 : 12),
        }}
        animate={{
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      >
        {/* Default cursor shape - arrow */}
        <div className={`transition-all duration-300 ${
          isHovering ? 'opacity-0' : 'opacity-100'
        }`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M4 4L20 12L4 20V14L10 12L4 10V4Z" 
              fill="white" 
              stroke="white" 
              strokeWidth="1"
            />
          </svg>
        </div>
        
        {/* Hover circle */}
        <div className={`transition-all duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-20 h-20 rounded-full bg-white shadow-lg">
            <div className="absolute inset-2 rounded-full bg-black/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black/30" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Styles for mix-blend-mode support */}
      <style jsx>{`
        .mix-blend-difference {
          mix-blend-mode: difference;
        }
        
        @supports not (mix-blend-mode: difference) {
          .mix-blend-difference {
            mix-blend-mode: exclusion;
          }
        }
      `}</style>
    </>
  );
}
