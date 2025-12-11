"use client";

import { useRouter } from 'next/navigation';

// Isometric Cube Component
const IsometricCube = ({ color, size = 16, letter, x, y, z = 0 }) => {
  const baseSize = size;
  const depth = z || baseSize * 0.5;
  
  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'rotate(45deg) skew(-15deg, -15deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top face */}
      <div
        className="absolute flex items-center justify-center font-black text-white shadow-lg"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          background: color,
          transform: `translateZ(${depth}px)`,
        }}
      >
        {letter}
      </div>
      {/* Right face */}
      <div
        className="absolute"
        style={{
          width: `${depth}px`,
          height: `${baseSize}px`,
          background: `color-mix(in srgb, ${color} 80%, black)`,
          transform: `rotateY(90deg) translateZ(${baseSize / 2}px) translateX(${depth / 2}px)`,
          transformOrigin: 'left center',
        }}
      />
      {/* Left face */}
      <div
        className="absolute"
        style={{
          width: `${baseSize}px`,
          height: `${depth}px`,
          background: `color-mix(in srgb, ${color} 60%, black)`,
          transform: `rotateX(-90deg) translateZ(${baseSize / 2}px) translateY(${depth / 2}px)`,
          transformOrigin: 'center top',
        }}
      />
    </div>
  );
};

// Simple Isometric Block (simpler version)
const IsoBlock = ({ color, size = 16, letter, x, y }) => {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'rotate(45deg) skew(-15deg, -15deg)',
      }}
    >
      <div
        className="flex items-center justify-center font-black text-white shadow-lg"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: color,
        }}
      >
        {letter}
      </div>
      <div
        className="absolute"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `color-mix(in srgb, ${color} 70%, black)`,
          transform: 'translate(4px, 4px)',
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default function Home() {
  const router = useRouter();

  const handlePlayAsGuest = () => {
    router.push('/game');
  };

  const handleSignIn = () => {
    // TODO: Navigate to sign in page
    console.log("Sign in");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 z-20 flex w-full items-center justify-between px-8 py-6">
        {/* Logo - Left side on white */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#1B5E20' }}>
          LOGO
        </div>
        
        {/* Nav Links - Right side on green background */}
        <div className="flex items-center gap-6 pr-8 text-white">
          <a href="#" className="text-sm font-semibold hover:underline">HOME</a>
          <a href="#" className="text-sm font-semibold hover:underline">CATALOG</a>
          <a href="#" className="text-sm font-semibold hover:underline">CONTACT</a>
          <a href="#" className="text-sm font-semibold hover:underline">SIGN UP</a>
          <div className="ml-4 flex flex-col gap-1">
            <div className="h-0.5 w-6 bg-white"></div>
            <div className="h-0.5 w-6 bg-white"></div>
            <div className="h-0.5 w-6 bg-white"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="flex min-h-screen">
        {/* Left Section - White Background */}
        <div className="relative z-10 flex w-full flex-col justify-center bg-white px-12 py-20 md:w-1/2">
          <div className="max-w-lg">
            {/* Title */}
            <h1 className="mb-6 text-6xl font-bold sm:text-7xl md:text-8xl" style={{ color: '#1B5E20' }}>
              HANGMAN
            </h1>
            
            {/* Description */}
            <p className="mb-8 text-base leading-relaxed text-gray-500">
              Test your vocabulary and quick thinking in this time-based word guessing game. 
              Guess the hidden word letter by letter before time runs out! Challenge yourself 
              with multiple difficulty levels and track your progress.
            </p>
            
            {/* Action Button */}
            <button
              onClick={handlePlayAsGuest}
              className="rounded-lg px-8 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1B5E20' }}
            >
              Play Now
            </button>
          </div>
        </div>

        {/* Right Section - Green Background with Isometric Game Pieces */}
        <div className="relative hidden w-full md:block md:w-1/2" style={{ backgroundColor: '#1B5E20' }}>
          {/* Semi-circular divider */}
          <div className="absolute left-0 top-0 h-full w-32 bg-white" style={{ clipPath: 'ellipse(100% 50% at 0% 50%)' }}></div>
          
          {/* Isometric Game Pieces */}
          <div className="relative h-full w-full p-12" style={{ perspective: '1000px' }}>
            {/* Letter Blocks - H, A, N, G */}
            <IsoBlock color="#FF6B6B" size={64} letter="H" x={120} y={80} />
            <IsoBlock color="#4ECDC4" size={64} letter="A" x={180} y={120} />
            <IsoBlock color="#45B7D1" size={64} letter="N" x={240} y={60} />
            <IsoBlock color="#FFD700" size={64} letter="G" x={300} y={100} />
            
            {/* More letter blocks */}
            <IsoBlock color="#FFA07A" size={56} letter="M" x={360} y={140} />
            <IsoBlock color="#98D8C8" size={56} letter="A" x={420} y={80} />
            
            {/* Question Mark Blocks */}
            <IsoBlock color="#BB8FCE" size={72} letter="?" x={160} y={400} />
            <IsoBlock color="#F7DC6F" size={72} letter="?" x={480} y={360} />
            
            {/* Timer/Clock - Circular */}
            <div className="absolute" style={{ left: '480px', top: '100px', transform: 'rotate(45deg) skew(-15deg, -15deg)' }}>
              <div className="h-20 w-20 rounded-full bg-white shadow-lg border-4 border-gray-300"></div>
              <div className="absolute -top-2 -left-2 h-20 w-20 rounded-full bg-gray-200 opacity-60"></div>
            </div>
            
            {/* Letter Tile Stack */}
            <div className="absolute" style={{ left: '280px', top: '420px', transform: 'rotate(45deg) skew(-15deg, -15deg)' }}>
              <div className="h-14 w-14 bg-cyan-400 shadow-lg"></div>
              <div className="absolute -top-1 -left-1 h-14 w-14 bg-cyan-500 opacity-80"></div>
              <div className="absolute -top-2 -left-2 h-14 w-14 bg-cyan-600 opacity-60"></div>
            </div>
            
            {/* Score Card */}
            <div className="absolute" style={{ left: '520px', top: '380px', transform: 'rotate(45deg) skew(-15deg, -15deg)' }}>
              <div className="h-16 w-24 bg-white shadow-lg rounded-sm"></div>
              <div className="absolute -top-2 -left-2 h-16 w-24 bg-gray-200 opacity-60 rounded-sm"></div>
            </div>
            
            {/* Pencil */}
            <div className="absolute" style={{ left: '400px', top: '200px', transform: 'rotate(45deg) skew(-15deg, -15deg) rotate(-20deg)' }}>
              <div className="h-3 w-20 bg-orange-500 shadow-lg rounded-full"></div>
              <div className="absolute -top-1 -left-1 h-3 w-20 bg-orange-600 opacity-60 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
