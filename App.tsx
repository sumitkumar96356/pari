
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LYRICS, INITIAL_PHOTOS, AUDIO_SOURCES } from './constants';
import HeartConfetti from './components/HeartConfetti';
import SetupScreen from './components/SetupScreen';

const StarField: React.FC = () => (
  <div className="stars">
    {Array.from({ length: 140 }).map((_, i) => (
      <div 
        key={i} 
        className="star" 
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 0.5}px`,
          height: `${Math.random() * 2 + 0.5}px`,
          '--d': `${2 + Math.random() * 4}s`
        } as any}
      />
    ))}
  </div>
);

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [showFinale, setShowFinale] = useState(false);
  const [isVortex, setIsVortex] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const handlePhotosChange = (files: FileList) => {
    const photoUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setPhotos(photoUrls.slice(0, 8));
  };

  const startSurprise = () => {
    if (photos.length === 0) setPhotos(INITIAL_PHOTOS);
    setIsSetupComplete(true);
  };

  const rotateSource = useCallback(() => {
    if (sourceIndex < AUDIO_SOURCES.length - 1) {
      const nextIdx = sourceIndex + 1;
      setSourceIndex(nextIdx);
      if (audioRef.current) {
        audioRef.current.src = AUDIO_SOURCES[nextIdx];
        audioRef.current.load();
        setTimeout(() => {
          audioRef.current?.play().catch(() => {});
        }, 500);
      }
    }
  }, [sourceIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioState('loading');
      if (!audioRef.current.src) audioRef.current.src = AUDIO_SOURCES[sourceIndex];
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsStarted(true);
        setAudioState('ready');
      }).catch(() => rotateSource());
    }
  };

  const handleReplay = () => {
    setShowFinale(false);
    setIsVortex(false);
    setCurrentLyricIndex(0);
    rotationRef.current = 0;
    lastTimeRef.current = performance.now();
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsStarted(true);
      }).catch((e) => console.error("Replay playback error:", e));
    }
  };

  const activePhotos = photos.length > 0 ? photos : INITIAL_PHOTOS;
  const cardCount = activePhotos.length;
  const anglePerCard = 360 / cardCount;

  // Animation Loop: Optimized for performance and smoothness
  const animate = useCallback((time: number) => {
    const deltaTime = Math.min(time - lastTimeRef.current, 32); // Cap delta to prevent jumps
    lastTimeRef.current = time;

    if (isPlaying && !isVortex && carouselRef.current) {
      // Direct variable-based rotation for ultra-smooth 60fps+ motion
      rotationRef.current += deltaTime * 0.012; 
      const currentRot = rotationRef.current;
      
      // Update DOM directly to avoid React's reconciliation cycle
      carouselRef.current.style.transform = `rotateY(${-currentRot}deg) rotateX(-4deg)`;
      
      // Focus detection
      const normalizedRot = currentRot % 360;
      let minDiff = Infinity;
      let newFocusIdx = 0;
      
      for(let i = 0; i < cardCount; i++) {
        const cardAngle = i * anglePerCard;
        const currentPos = (cardAngle + currentRot) % 360;
        const diff = Math.min(Math.abs(currentPos), Math.abs(currentPos - 360));
        if (diff < minDiff) {
          minDiff = diff;
          newFocusIdx = i;
        }
      }

      // Only update state if index changed to minimize re-renders
      if (focusIndex !== newFocusIdx) {
        setFocusIndex(newFocusIdx);
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isPlaying, isVortex, cardCount, anglePerCard, focusIndex]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;

    let lyricIdx = -1;
    for (let i = LYRICS.length - 1; i >= 0; i--) {
      if (currentTime >= LYRICS[i].time) {
        lyricIdx = i;
        break;
      }
    }
    
    if (lyricIdx !== -1 && lyricIdx !== currentLyricIndex) {
      setCurrentLyricIndex(lyricIdx);
      if (LYRICS[lyricIdx].text.includes("HAPPY NEW YEAR 2026")) {
        setIsVortex(true);
        if (carouselRef.current) {
          carouselRef.current.style.setProperty('--rot', `${-rotationRef.current}deg`);
        }
        setTimeout(() => setShowFinale(true), 3500);
      }
    }
  }, [currentLyricIndex]);

  const radius = window.innerWidth < 768 ? 240 : 450;

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-black">
      {!isSetupComplete ? (
        <SetupScreen 
          onPhotosChange={handlePhotosChange} 
          onAudioChange={() => {}} 
          onStart={startSurprise}
          photoCount={photos.length}
          hasAudio={true}
        />
      ) : (
        <>
          <StarField />
          <HeartConfetti />
          
          <div className="absolute inset-0 flex items-center justify-center overflow-visible pointer-events-none">
            <div className="bg-pulse" />
          </div>

          <div className="absolute inset-0 z-10 stage-3d pointer-events-none">
            <div 
              ref={carouselRef}
              className={`carousel-3d ${isVortex ? 'vortex-exit' : ''}`}
              style={{ transform: `rotateY(0deg) rotateX(-4deg)` } as any}
            >
              {activePhotos.map((url, idx) => {
                const isFocus = idx === focusIndex;
                const angle = idx * anglePerCard;
                return (
                  <div
                    key={idx}
                    className={`photo-card ${isFocus ? 'in-focus scale-100 opacity-100' : 'opacity-20 scale-90'}`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                    } as any}
                  >
                    <img src={url} alt="Memory" className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-1000 ${isFocus ? 'opacity-100' : 'opacity-0'}`} />
                    {isFocus && (
                       <div className="absolute bottom-6 left-0 w-full text-center px-4 animate-in fade-in zoom-in duration-1000">
                          <p className="text-white font-romantic text-2xl shadow-black drop-shadow-xl tracking-wider">With Love, For Pari ❤️</p>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-20 w-full h-full flex flex-col items-center justify-between py-16 px-6">
            <div className="text-center mt-6">
               {!isStarted && (
                 <button 
                   onClick={togglePlay}
                   className="group relative p-12 rounded-full glass border border-white/20 hover:scale-110 transition-all pointer-events-auto shadow-[0_0_80px_rgba(244,63,94,0.5)]"
                 >
                   <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 group-hover:opacity-70 transition-opacity" />
                   {audioState === 'loading' ? (
                     <div className="w-16 h-16 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                   )}
                   <p className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 text-rose-300 font-romantic text-4xl animate-pulse">Welcome our 2026, Pari ❤️</p>
                 </button>
               )}
            </div>

            <div className="w-full max-w-5xl text-center mb-10 min-h-[200px] flex items-center justify-center pointer-events-none">
              {isStarted && !showFinale && (
                <div key={currentLyricIndex} className="animate-in fade-in slide-in-from-bottom-16 duration-[1500ms]">
                  <p className="font-romantic text-6xl md:text-9xl lyrics-glow leading-tight italic px-6 drop-shadow-2xl">
                    {LYRICS[currentLyricIndex]?.text}
                  </p>
                </div>
              )}
            </div>

            {isStarted && !showFinale && (
              <div className="w-full max-w-sm flex flex-col items-center gap-8 opacity-90 mb-8 animate-in fade-in duration-2000">
                <div className="w-full h-[4px] bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] shadow-[0_0_25px_rgba(244,63,94,0.8)]" 
                    style={{ 
                      width: `${(audioRef.current?.currentTime || 0) / (audioRef.current?.duration || 1) * 100}%`,
                      transition: 'width 0.3s linear'
                    }}
                  />
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                   <p className="text-[13px] tracking-[1.8em] text-rose-100 uppercase font-black ml-4 drop-shadow-lg">FOREVER PARI</p>
                </div>
              </div>
            )}
          </div>

          {showFinale && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-3xl animate-in zoom-in-95 duration-2000 pointer-events-auto">
               <div className="text-center px-12 relative max-w-4xl">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600/20 blur-[200px] rounded-full -z-10 animate-pulse" />
                  
                  <h2 className="text-rose-400 font-romantic text-5xl md:text-7xl mb-14 italic animate-bounce duration-[4s]">Pari, You Are My World...</h2>
                  <h1 className="text-white font-serif-elegant text-[12rem] md:text-[20rem] font-black tracking-tighter lyrics-glow drop-shadow-[0_0_80px_rgba(244,63,94,0.7)] leading-none mb-10">2026</h1>
                  
                  <div className="space-y-10 mt-20 animate-in fade-in slide-in-from-bottom-12 duration-[2500ms] delay-1000">
                    <p className="text-white/95 text-4xl font-romantic leading-relaxed max-w-2xl mx-auto">
                      Let's create infinite more memories together this year.<br/>I love you to the stars and back.
                    </p>
                    <p className="text-rose-300/40 text-[16px] uppercase tracking-[2em] font-bold">Happy New Year, Pari ❤️</p>
                  </div>
                  
                  <button 
                    onClick={handleReplay}
                    className="mt-28 group relative overflow-hidden px-20 py-7 rounded-full glass border border-white/30 text-white text-sm tracking-[0.6em] uppercase transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/30 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <span className="relative z-10 font-bold">Replay the Magic</span>
                  </button>
               </div>
            </div>
          )}

          <audio 
            ref={audioRef} 
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setShowFinale(true)}
            onWaiting={() => setAudioState('loading')}
            onCanPlay={() => setAudioState('ready')}
            onError={() => rotateSource()}
          />
        </>
      )}
    </div>
  );
};

export default App;
