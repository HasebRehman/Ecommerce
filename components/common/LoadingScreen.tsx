import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ── shimmer on logo ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .ls-shimmer {
          background: linear-gradient(90deg, #B0E4CC 20%, #408A71 45%, #B0E4CC 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

        /* ── ambient blobs ── */
        @keyframes blobDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(30px, 20px) scale(1.06); }
        }
        @keyframes blobDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-25px, -18px) scale(1.08); }
        }
        .ls-blob-1 {
          position: absolute;
          width: 480px; height: 480px;
          top: -150px; left: -150px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(40,90,72,0.35) 0%, transparent 70%);
          filter: blur(80px);
          animation: blobDrift1 12s ease-in-out infinite;
          pointer-events: none;
        }
        .ls-blob-2 {
          position: absolute;
          width: 380px; height: 380px;
          bottom: -120px; right: -120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(64,138,113,0.25) 0%, transparent 70%);
          filter: blur(80px);
          animation: blobDrift2 16s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── dot grid ── */
        .ls-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(64,138,113,0.10) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
          pointer-events: none;
        }

        /* ── icon tile glow pulse ── */
        @keyframes iconGlow {
          0%, 100% { box-shadow: 0 0 18px rgba(64,138,113,0.3), 0 8px 28px rgba(9,20,19,0.6); }
          50%       { box-shadow: 0 0 32px rgba(64,138,113,0.55), 0 10px 36px rgba(9,20,19,0.6); }
        }
        .ls-icon-tile {
          width: 72px; height: 72px; border-radius: 22px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #285A48 0%, #1a3d2e 100%);
          border: 1px solid rgba(64,138,113,0.45);
          animation: iconGlow 2.8s ease-in-out infinite;
          flex-shrink: 0;
        }

        /* ── spinner ring ── */
        @keyframes spinRing { to { transform: rotate(360deg); } }
        .ls-ring {
          width: 48px; height: 48px; border-radius: 50%;
          border: 2.5px solid rgba(64,138,113,0.15);
          border-top-color: #408A71;
          border-right-color: rgba(64,138,113,0.45);
          animation: spinRing 0.9s linear infinite;
        }

        /* ── progress bar ── */
        @keyframes progressBar {
          0%   { width: 0%;   opacity: 1; }
          80%  { width: 85%;  opacity: 1; }
          95%  { width: 95%;  opacity: 0.6; }
          100% { width: 100%; opacity: 1; }
        }
        .ls-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #285A48, #408A71, #B0E4CC);
          border-radius: 99px;
          animation: progressBar 2.4s cubic-bezier(.4,0,.2,1) infinite;
        }

        /* ── dots bounce ── */
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%             { transform: translateY(-5px); opacity: 1; }
        }
        .ls-dot { width: 6px; height: 6px; border-radius: 50%; background: #408A71; }
        .ls-dot:nth-child(1) { animation: dotBounce 1.2s 0.0s ease-in-out infinite; }
        .ls-dot:nth-child(2) { animation: dotBounce 1.2s 0.2s ease-in-out infinite; }
        .ls-dot:nth-child(3) { animation: dotBounce 1.2s 0.4s ease-in-out infinite; }

        /* ── content fade in ── */
        @keyframes lsFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ls-fade-1 { animation: lsFadeUp 0.5s 0.0s cubic-bezier(.22,1,.36,1) both; }
        .ls-fade-2 { animation: lsFadeUp 0.5s 0.12s cubic-bezier(.22,1,.36,1) both; }
        .ls-fade-3 { animation: lsFadeUp 0.5s 0.24s cubic-bezier(.22,1,.36,1) both; }
        .ls-fade-4 { animation: lsFadeUp 0.5s 0.36s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#091413', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Ambient background */}
        <div className="ls-blob-1" />
        <div className="ls-blob-2" />
        <div className="ls-grid" />

        {/* Content card */}
        <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">

          {/* Icon tile */}
          <div className="ls-icon-tile ls-fade-1">
            {/* V mark — matches AuthLayout */}
            <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
              <path d="M4 5L11 17L18 5" stroke="#B0E4CC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 5L11 11.5L14.5 5" stroke="#408A71" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Wordmark */}
          <div className="ls-fade-2 space-y-1">
            <h1
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.1 }}
            >
              <span style={{ color: '#ffffff' }}>Vendo</span>
              <span className="ls-shimmer">Sphere</span>
            </h1>
            <p style={{ color: 'rgba(176,228,204,0.40)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Multi-vendor marketplace
            </p>
          </div>

          {/* Spinner + dots */}
          <div className="ls-fade-3 flex flex-col items-center gap-4">
            <div className="ls-ring" />
            <div className="flex items-center gap-2">
              <div className="ls-dot" />
              <div className="ls-dot" />
              <div className="ls-dot" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="ls-fade-4 w-full" style={{ maxWidth: '200px' }}>
            <div
              style={{
                height: '3px', borderRadius: '99px',
                background: 'rgba(40,90,72,0.25)',
                overflow: 'hidden',
              }}
            >
              <div className="ls-progress-fill" />
            </div>
          </div>

          {/* Label */}
          <p className="ls-fade-4" style={{ color: 'rgba(176,228,204,0.38)', fontSize: '0.8rem', fontWeight: 500, marginTop: '-12px' }}>
            Loading your account…
          </p>

        </div>
      </div>
    </>
  )
}