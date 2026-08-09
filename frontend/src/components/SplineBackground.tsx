import React, { Suspense, useEffect, useState } from 'react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

interface SplineBackgroundProps {
  sceneUrl?: string;
}

export const SplineBackground: React.FC<SplineBackgroundProps> = ({
  sceneUrl = "https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      {/* Clean 3D Spline Interactive Scene */}
      <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
        <Spline
          scene={sceneUrl}
          className="w-full h-full pointer-events-auto"
        />
      </Suspense>

      {/* Subtle Mouse Spotlight Glow (No dot grid) */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.12), transparent 75%)`,
        }}
      />
    </div>
  );
};
