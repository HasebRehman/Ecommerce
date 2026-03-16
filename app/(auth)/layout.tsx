import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth — VendoSphere',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .auth-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: #091413;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          position: relative;
          overflow: hidden;
        }

        /* ── Ambient blobs ── */
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
        }
        .auth-blob-1 {
          width: 520px; height: 520px;
          top: -160px; left: -160px;
          background: radial-gradient(circle, rgba(40,90,72,0.45) 0%, transparent 70%);
          animation: blobDrift1 14s ease-in-out infinite alternate;
        }
        .auth-blob-2 {
          width: 400px; height: 400px;
          bottom: -120px; right: -120px;
          background: radial-gradient(circle, rgba(64,138,113,0.30) 0%, transparent 70%);
          animation: blobDrift2 18s ease-in-out infinite alternate;
        }
        .auth-blob-3 {
          width: 260px; height: 260px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(40,90,72,0.12) 0%, transparent 70%);
          animation: blobDrift3 22s ease-in-out infinite alternate;
        }

        @keyframes blobDrift1 {
          from { transform: translate(0, 0) scale(1);     }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes blobDrift2 {
          from { transform: translate(0, 0) scale(1);         }
          to   { transform: translate(-30px, -20px) scale(1.1); }
        }
        @keyframes blobDrift3 {
          from { transform: translate(-50%, -50%) scale(1);    }
          to   { transform: translate(-48%, -52%) scale(1.15); }
        }

        /* ── Grid texture ── */
        .auth-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image:
            linear-gradient(rgba(176,228,204,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(176,228,204,1) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── Card fade-in ── */
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .auth-card {
          animation: cardReveal 0.5s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Logo shimmer ── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .logo-shimmer {
          background: linear-gradient(90deg, #B0E4CC 20%, #408A71 45%, #B0E4CC 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* ── Tagline fade ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tag-fade {
          animation: fadeUp 0.6s 0.2s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Dot indicators ── */
        .auth-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(64,138,113,0.4);
          display: inline-block;
        }
        .auth-dot-active {
          background: #408A71;
          box-shadow: 0 0 6px rgba(64,138,113,0.6);
        }
      `}</style>

      <div className="auth-root">

        {/* Ambient background blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        {/* Subtle grid */}
        <div className="auth-grid" />

        {/* Content */}
        <div className="auth-card relative z-10 w-full max-w-md">

          {/* ── Logo & tagline ── */}
          <div className="text-center mb-8">

            {/* Icon mark */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #285A48 0%, #1a3d2e 100%)',
                border: '1px solid rgba(64,138,113,0.4)',
                boxShadow: '0 8px 24px rgba(9,20,19,0.6), 0 0 0 1px rgba(64,138,113,0.15)',
              }}>
              {/* Simple V mark */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 5L11 17L18 5" stroke="#B0E4CC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 5L11 11.5L14.5 5" stroke="#408A71" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Wordmark */}
            <h1
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-3xl font-bold tracking-tight leading-none"
            >
              <span className="text-white">Vendo</span>
              <span className="logo-shimmer">Sphere</span>
            </h1>

            {/* Tagline */}
            <p className="tag-fade text-sm mt-2.5 flex items-center justify-center gap-2"
              style={{ color: 'rgba(176,228,204,0.45)' }}>
              <span className="auth-dot" />
              Multi-vendor commerce platform
              <span className="auth-dot auth-dot-active" />
            </p>
          </div>

          {/* ── Form card shell ── */}
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(13,28,25,0.95) 0%, rgba(10,21,18,0.98) 100%)',
              border: '1px solid rgba(40,90,72,0.35)',
              borderRadius: '20px',
              boxShadow: '0 32px 64px rgba(9,20,19,0.75), 0 0 0 1px rgba(64,138,113,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {children}
          </div>

          {/* ── Footer note ── */}
          <p className="text-center mt-6 text-xs"
            style={{ color: 'rgba(176,228,204,0.25)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            © {new Date().getFullYear()} VendoSphere. All rights reserved.
          </p>

        </div>
      </div>
    </>
  )
}