import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Auth — VendoSphere',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html, body { height: 100%; overflow: hidden; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a, button { cursor: pointer !important; }

        /* ── Full page locked to viewport — no scroll ── */
        .auth-page {
          font-family: 'Inter', sans-serif;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(145deg, #EDE9FE 0%, #DDD6FE 60%, #C4B5FD 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* background blobs */
        .auth-page::before {
          content: '';
          position: absolute;
          width: 550px; height: 550px;
          top: -200px; left: -180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 65%);
          pointer-events: none;
        }
        .auth-page::after {
          content: '';
          position: absolute;
          width: 420px; height: 420px;
          bottom: -150px; left: 30%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Left — fills remaining space, content centered ── */
        .auth-left {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 2.5rem 2rem 2rem;
          overflow: hidden;
        }

        .auth-logo {
          height: clamp(80px, 6vh, 72px);
          width: auto;
          object-fit: contain;
          max-width: 240px;
          margin-bottom: clamp(0.6rem, 1.2vh, 1.1rem);
          filter: drop-shadow(0 4px 16px rgba(124,58,237,0.22));
          flex-shrink: 0;
        }

        .auth-tagline-title {
          font-size: clamp(1.4rem, 2vh, 1.5rem);
          font-weight: 800;
          color: #1e1b4b;
          margin-bottom: 0.4rem;
          line-height: 1.25;
          max-width: 400px;
          text-align: center;
          flex-shrink: 0;
        }

        .auth-tagline-sub {
          font-size: clamp(0.8rem, 1.4vh, 0.92rem);
          color: rgba(76,29,149,0.65);
          font-weight: 500;
          margin-bottom: clamp(1rem, 2.5vh, 2rem);
          max-width: 380px;
          text-align: center;
          flex-shrink: 0;
        }

        .auth-illustration {
          width: 100%;
          max-width: min(620px, 65vw);
          max-height: 50vh;
          object-fit: contain;
          border-radius: 18px;
          animation: floatImg 5s ease-in-out infinite;
          filter: drop-shadow(0 12px 32px rgba(124,58,237,0.18));
          flex-shrink: 1;
          min-height: 0;
        }

        @keyframes floatImg {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        /* ── Right — white card, 20px margin, auto height centered ── */
        .auth-right {
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          width: clamp(360px, 38vw, 520px);
          margin: 20px 20px 20px 0;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(124,58,237,0.16), 0 2px 8px rgba(124,58,237,0.08);
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: clamp(1.5rem, 3vh, 2.25rem) clamp(1.5rem, 3vw, 2.5rem);
          align-self: center;
          max-height: calc(100vh - 40px);
          overflow: hidden;
          animation: cardSlideIn 0.4s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .auth-right-inner { width: 100%; }

        /* ── Tablet (769–1100px) ── */
        @media (min-width: 769px) and (max-width: 1100px) {
          .auth-left { padding: 1.5rem 1.5rem 1.5rem 2rem; }
          .auth-right { width: 400px; }
        }

        /* ── Mobile (≤768px): single column, no scroll ── */
        @media (max-width: 768px) {
          html, body { overflow: hidden; }
          .auth-page {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
            padding: 1rem;
            gap: 0.75rem;
          }
          /* compact header strip — no illustration */
          .auth-left {
            flex: 0 0 auto;
            height: auto;
            width: 100%;
            padding: 0;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 0.75rem;
          }
          .auth-logo { height: 36px; margin-bottom: 0; }
          .auth-tagline-title { display: none; }
          .auth-tagline-sub   { display: none; }
          .auth-illustration  { display: none; }
          /* card fills remaining width */
          .auth-right {
            width: 100%;
            max-width: 440px;
            margin: 0;
            max-height: calc(100vh - 80px);
            border-radius: 16px;
            padding: 1.5rem 1.25rem;
          }
        }

        /* ── Very small phones ── */
        @media (max-width: 380px) {
          .auth-page  { padding: 0.75rem; gap: 0.5rem; }
          .auth-logo  { height: 30px; }
          .auth-right { padding: 1.25rem 1rem; }
        }
      `}</style>

      <div className="auth-page">

        {/* LEFT — full background, content centered */}
        <div className="auth-left">
          <img src="/logo.png" alt="VendoSphere" className="auth-logo" />
          {/* <h2 className="auth-tagline-title">The Connected Marketplace Platform</h2> */}
          <p className="auth-tagline-sub">
            Buy, sell and grow — join thousands of local retailers and shoppers across Pakistan.
          </p>
          <img
            src="/shopping-vector.png"
            alt="VendoSphere marketplace"
            className="auth-illustration"
          />
        </div>

        {/* RIGHT — floating white card with 20px margin top/right/bottom */}
        <div className="auth-right">
          <div className="auth-right-inner">
            {children}
          </div>
        </div>

      </div>
    </>
  )
}
