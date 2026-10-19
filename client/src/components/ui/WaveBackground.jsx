import React from 'react';

export const WaveBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Corner dotted pattern top-right */}
      <div className="absolute top-0 right-0 w-72 h-72 dotted-pattern opacity-40 rounded-bl-3xl" />
      {/* Corner dotted pattern bottom-left */}
      <div className="absolute bottom-0 left-0 w-80 h-80 dotted-pattern opacity-35 rounded-tr-3xl" />

      {/* Large subtle blended pastel gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-pastel-lime/40 via-pastel-yellow/30 to-transparent blur-3xl" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-pastel-rose/30 via-pastel-pink/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-pastel-lavender/35 via-pastel-peach/25 to-transparent blur-3xl" />

      {/* Decorative flowing wave SVG */}
      <svg
        className="absolute top-24 left-0 w-full opacity-25"
        viewBox="0 0 1440 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 120C240 180 480 60 720 120C960 180 1200 60 1440 120V280H0V120Z"
          fill="url(#pastel-wave-grad)"
        />
        <defs>
          <linearGradient id="pastel-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFF9DB" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#FFE4BA" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FCE4EC" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EDE7F6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Accent yellow wavy lines */}
      <svg
        className="absolute bottom-40 right-16 w-36 h-12 opacity-40"
        viewBox="0 0 100 20"
        fill="none"
      >
        <path
          d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
