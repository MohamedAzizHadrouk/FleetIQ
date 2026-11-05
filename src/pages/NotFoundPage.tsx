import React from 'react';
import { ArrowLeft, MapPin, Search, WifiOff } from 'lucide-react';
interface NotFoundPageProps {
  onNavigateToDashboard: () => void;
  onNavigateToLogin: () => void;
}
export function NotFoundPage({
  onNavigateToDashboard,
  onNavigateToLogin
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-slate-900">
      {/* Video Background (Matching LoginPage) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop">
          
          <source
            src="https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1573/1080p.mp4"
            type="video/mp4" />
          
        </video>
        {/* Dark Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }} />
          
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) =>
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }} />

          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 0.8; }
        }
        @keyframes avatar-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.5); opacity: 0.8; border-width: 2px; }
          100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); opacity: 1; text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
          20% { transform: translate(-2px, 1px); opacity: 0.9; text-shadow: 2px 0 20px rgba(225, 29, 72, 0.5), -2px 0 20px rgba(6, 182, 212, 0.5); }
          40% { transform: translate(2px, -1px); opacity: 1; text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
          60% { transform: translate(-1px, -2px); opacity: 0.8; text-shadow: -2px 0 20px rgba(225, 29, 72, 0.5), 2px 0 20px rgba(6, 182, 212, 0.5); }
          80% { transform: translate(1px, 2px); opacity: 1; text-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
        }
        @keyframes pin-wobble {
          0%, 100% { transform: rotate(-10deg) translateY(0); }
          50% { transform: rotate(10deg) translateY(-10px); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up">
            <div className="inline-block bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
              <img
                src="/tunav_logo.png"
                alt="TUNAV Logo"
                className="h-12 sm:h-16 w-auto" />
              
            </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden animate-fade-in-up delay-100">
            {/* Visual Centerpiece: Radar & 404 */}
            <div className="relative flex items-center justify-center h-48 sm:h-64 mb-8">
              {/* Radar Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="absolute w-32 h-32 rounded-full border-cyan-500/50"
                  style={{
                    animation:
                    'radar-pulse 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
                  }} />
                
                <div
                  className="absolute w-32 h-32 rounded-full border-cyan-500/50"
                  style={{
                    animation:
                    'radar-pulse 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1s'
                  }} />
                
                <div
                  className="absolute w-32 h-32 rounded-full border-cyan-500/50"
                  style={{
                    animation:
                    'radar-pulse 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 2s'
                  }} />
                
              </div>

              {/* 404 Text */}
              <div className="relative z-10 flex items-center justify-center">
                <h1
                  className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tighter"
                  style={{
                    animation: 'glitch 4s infinite'
                  }}>
                  
                  4
                </h1>

                {/* Animated Map Pin for the '0' */}
                <div
                  className="mx-2 sm:mx-4 relative"
                  style={{
                    animation: 'pin-wobble 3s ease-in-out infinite'
                  }}>
                  
                  <MapPin className="w-20 h-20 sm:w-28 sm:h-28 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-4px] sm:mt-[-6px]">
                    <WifiOff className="w-8 h-8 sm:w-10 sm:h-10 text-slate-900" />
                  </div>
                </div>

                <h1
                  className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent tracking-tighter"
                  style={{
                    animation: 'glitch 4s infinite 0.5s'
                  }}>
                  
                  4
                </h1>
              </div>
            </div>

            {/* Mascot & Speech Bubble */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 mb-10">
              <div
                style={{
                  animation: 'avatar-float 4s ease-in-out infinite'
                }}>
                
                <img
                  src="/image_(1).png"
                  alt="TUNAVI Assistant"
                  className="h-32 sm:h-40 w-auto drop-shadow-2xl" />
                
              </div>

              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-white/20 max-w-xs text-left animate-fade-in-up delay-200">
                {/* Speech bubble pointer */}
                <div className="absolute -top-3 left-1/2 sm:top-1/2 sm:-left-3 transform -translate-x-1/2 sm:translate-x-0 sm:-translate-y-1/2 w-6 h-6 bg-white/95 rotate-45 border-l border-t sm:border-t-0 sm:border-b sm:border-l border-white/20" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Signal Perdu
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    "Oups ! Ce chemin n'existe pas sur notre carte. Le véhicule
                    semble avoir quitté notre zone de couverture."
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-300">
              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto flex items-center justify-center py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-cyan-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour au tableau de bord
              </button>

              <button
                onClick={onNavigateToLogin}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors focus:outline-none text-sm">
                
                Retour à la connexion
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-up delay-300">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} TUNAV IT Group. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </div>
    </div>);

}