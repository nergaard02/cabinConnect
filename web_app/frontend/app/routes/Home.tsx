import React, { useState, useEffect } from 'react';

const snowflakeCount = 30;

const LandingPage: React.FC = () => {
  const [showContinue, setShowContinue] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const text = "Cabin Connect";

  const handleClick = () => {
    window.location.href = '/login';
  };

  useEffect(() => {
    // Animate letters one by one
    if (visibleLetters < text.length) {
      const timeout = setTimeout(() => {
        setVisibleLetters((v) => v + 1);
      }, 150); // delay between letters (150ms)
      return () => clearTimeout(timeout);
    }
  }, [visibleLetters, text.length]);

  // Show "Click to continue" after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 2200);
    return () => clearTimeout(timer);
  }, []);


  // Create snowflakes with random styles
  const snowflakes = Array.from({ length: snowflakeCount }).map((_, i) => {
    const size = Math.random() * 4 + 2; // 2px to 6px
    const left = Math.random() * 100; // % across width
    const delay = Math.random() * 15; // seconds
    const duration = 10 + Math.random() * 10; // 10s to 20s

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: '-10px',
          left: `${left}%`,
          width: size,
          height: size,
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.8,
          animationName: 'fall',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDelay: `${delay}s`,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 0 2px white)',
        }}
      />
    );
  });

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes slideFadeIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fall {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh);
            opacity: 0;
          }
        }
      `}</style>

      <div
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        tabIndex={0}
        role="button"
        style={{
          width: '100vw',
          height: '100vh',
          backgroundImage: "url('/cabin.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '45vh',
          paddingBottom: '5vh',
        }}
      >
        {snowflakes}

        <div
          className="press-start"
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '0 0 10px #000',
            alignSelf: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '2px',
          }}
        >
          {text.split('').map((char, i) => (
            <span
              key={i}
              className="letter"
              style={{
                animationDelay: `${i * 150}ms`,
                opacity: i < visibleLetters ? 1 : 0,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        {showContinue && (
          <div className='press-start'
            style={{
              position: 'absolute',
              bottom: '1vh',      // Distance from bottom of screen
              left: '37vw',       // Horizontal position
              fontSize: '1.2rem',
              opacity: 0.8,
              animation: 'pulse 2.5s infinite ease-in-out',
              textShadow: '0 0 8px #000',
              userSelect: 'none',
            }}
            >
            Click to continue
          </div>
        )}
      </div>
    </>
  );
};

export default LandingPage;