import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles } from
'lucide-react';
interface SignUpPageProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}
export function SignUpPage({ onSignUp, onNavigateToLogin }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }
    setTimeout(() => {
      if (name && email && password) {
        setIsLoading(false);
        onSignUp();
      } else {
        setIsLoading(false);
        setError('Veuillez remplir tous les champs');
      }
    }, 1500);
  };
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop">
          
          <source
            src="https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1573/1080p.mp4"
            type="video/mp4" />
          
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95" />
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

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
        }
        @keyframes avatar-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 w-full flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-8">
          {/* Left Side - Branding & Avatar */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <div className="inline-block bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                <img
                  src="/tunav_logo.png"
                  alt="TUNAV Logo"
                  className="h-16 lg:h-20 w-auto" />
                
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Technology{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Powered
                </span>
                <br />
                By Intelligence
              </h1>
              <p className="text-slate-300 text-lg lg:text-xl max-w-md mx-auto lg:mx-0">
                Rejoignez la plateforme de gestion de flotte la plus avancée
              </p>
            </div>

            <div className="hidden lg:block">
              <div
                className="relative inline-block"
                style={{
                  animation: 'avatar-float 3s ease-in-out infinite'
                }}>
                
                <img
                  src="/image_(1).png"
                  alt="TUNAVI Assistant"
                  className="h-56 w-auto drop-shadow-2xl" />
                
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2 shadow-xl">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium">
                      Inscrivez-vous !
                    </span>
                  </div>
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45" />
                </div>
              </div>
            </div>

            <div className="lg:hidden mb-4">
              <img
                src="/image_(1).png"
                alt="TUNAVI Assistant"
                className="h-28 w-auto mx-auto drop-shadow-xl"
                style={{
                  animation: 'avatar-float 3s ease-in-out infinite'
                }} />
              
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="w-full max-w-md">
            <div
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl"
              style={{
                animation: 'pulse-glow 4s ease-in-out infinite'
              }}>
              
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Créer un compte
                </h2>
                <p className="text-slate-300">Commencez votre essai gratuit</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error &&
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center backdrop-blur-sm">
                    {error}
                  </div>
                }

                <div className="space-y-3">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-200 ml-1">
                      Nom complet
                    </label>
                    <div
                      className={`relative transition-all duration-300 ${isFocused === 'name' ? 'scale-[1.02]' : ''}`}>
                      
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User
                          className={`h-5 w-5 transition-colors duration-300 ${isFocused === 'name' ? 'text-cyan-400' : 'text-slate-400'}`} />
                        
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setIsFocused('name')}
                        onBlur={() => setIsFocused(null)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="John Doe"
                        required />
                      
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-200 ml-1">
                      Adresse email
                    </label>
                    <div
                      className={`relative transition-all duration-300 ${isFocused === 'email' ? 'scale-[1.02]' : ''}`}>
                      
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail
                          className={`h-5 w-5 transition-colors duration-300 ${isFocused === 'email' ? 'text-cyan-400' : 'text-slate-400'}`} />
                        
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused('email')}
                        onBlur={() => setIsFocused(null)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="nom@exemple.com"
                        required />
                      
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-200 ml-1">
                      Mot de passe
                    </label>
                    <div
                      className={`relative transition-all duration-300 ${isFocused === 'password' ? 'scale-[1.02]' : ''}`}>
                      
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock
                          className={`h-5 w-5 transition-colors duration-300 ${isFocused === 'password' ? 'text-cyan-400' : 'text-slate-400'}`} />
                        
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused('password')}
                        onBlur={() => setIsFocused(null)}
                        className="block w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="••••••••"
                        required />
                      
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none">
                        
                        {showPassword ?
                        <EyeOff className="h-5 w-5" /> :

                        <Eye className="h-5 w-5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-200 ml-1">
                      Confirmer le mot de passe
                    </label>
                    <div
                      className={`relative transition-all duration-300 ${isFocused === 'confirm' ? 'scale-[1.02]' : ''}`}>
                      
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock
                          className={`h-5 w-5 transition-colors duration-300 ${isFocused === 'confirm' ? 'text-cyan-400' : 'text-slate-400'}`} />
                        
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setIsFocused('confirm')}
                        onBlur={() => setIsFocused(null)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="••••••••"
                        required />
                      
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-cyan-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] mt-2">
                  
                  {isLoading ?
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

                  <>
                      S'inscrire
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  }
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-slate-300">
                  Déjà un compte ?{' '}
                  <button
                    onClick={onNavigateToLogin}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors focus:outline-none">
                    
                    Se connecter
                  </button>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} TUNAV IT Group. Tous droits
                réservés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}