
import React from 'react';

interface SetupScreenProps {
  onPhotosChange: (files: FileList) => void;
  onAudioChange: (file: File) => void;
  onStart: () => void;
  photoCount: number;
  hasAudio: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onPhotosChange, onAudioChange, onStart, photoCount, hasAudio }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-white overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full glass p-8 md:p-10 rounded-[2.5rem] relative z-10 text-center my-8 border border-white/10 shadow-2xl">
        <div className="mb-8">
          <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] animate-bounce">
             <span className="text-xl">❤️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-elegant font-bold mb-2 bg-gradient-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">Surprise for Pari</h1>
          <p className="text-slate-400 text-xs md:text-sm font-light tracking-wide italic leading-relaxed px-4">Upload 8 beautiful photos of Pari to start our 2026 journey.</p>
        </div>

        <div className="space-y-4">
          <div className="group">
            <label className="flex items-center space-x-4 cursor-pointer bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 transition-all active:scale-95 hover:border-pink-500/30">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                {photoCount >= 8 ? '💖' : '📸'}
              </div>
              <div className="text-left overflow-hidden">
                <span className="block text-sm font-medium truncate">
                  {photoCount > 0 ? `${photoCount} Memories Added` : 'Select 8 Photos'}
                </span>
                <span className="block text-[10px] text-slate-500 italic uppercase tracking-tighter">Your beautiful photos for Pari</span>
              </div>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files && onPhotosChange(e.target.files)}
              />
            </label>
          </div>

          <div className="bg-pink-500/5 p-5 rounded-2xl border border-pink-500/10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
              🎵
            </div>
            <div className="text-left">
              <span className="block text-sm font-medium text-pink-200">2026 Theme Active</span>
              <span className="block text-[10px] text-pink-400/60 uppercase font-mono italic">Premium Audio Stream</span>
            </div>
          </div>

          <div className="py-2">
            <button 
              onClick={onStart}
              disabled={photoCount < 1}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transform transition-all active:scale-95 shimmer bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-pink-500/50 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Start 2026 Surprise ✨
            </button>
          </div>
          
          <div className="pt-4">
             <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black italic">Happily Ever After</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
