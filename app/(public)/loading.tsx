export default function PublicLoading() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');

        .premium-loader-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #EDE9FE 100%);
          font-family: 'Open Sans', sans-serif;
          overflow: hidden;
        }

        /* ── floating orbs ── */
        .premium-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.6;
        }
        .premium-orb-1 {
          width: min(450px, 70vw);
          height: min(450px, 70vw);
          top: -15%;
          left: -10%;
          background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
          filter: blur(80px);
          animation: premiumFloat1 20s ease-in-out infinite;
        }
        .premium-orb-2 {
          width: min(380px, 60vw);
          height: min(380px, 60vw);
          bottom: -12%;
          right: -8%;
          background: radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%);
          filter: blur(80px);
          animation: premiumFloat2 25s ease-in-out infinite;
        }
        .premium-orb-3 {
          width: min(280px, 45vw);
          height: min(280px, 45vw);
          top: 45%;
          left: 60%;
          background: radial-gradient(circle, rgba(167,139,250,0.20) 0%, transparent 70%);
          filter: blur(70px);
          animation: premiumFloat3 30s ease-in-out infinite;
        }

        @keyframes premiumFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(40px, 30px) rotate(120deg); }
          66% { transform: translate(-20px, 50px) rotate(240deg); }
        }
        @keyframes premiumFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-35px, -25px) rotate(-120deg); }
          66% { transform: translate(25px, -40px) rotate(-240deg); }
        }
        @keyframes premiumFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.1); }
        }

        /* ── subtle grid pattern ── */
        .premium-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: 
            linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 100%);
        }

        /* ── main container ── */
        .premium-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(24px, 4vw, 36px);
          animation: premiumContainerIn 0.8s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes premiumContainerIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── logo card ── */
        .premium-logo-card {
          position: relative;
          padding: clamp(28px, 5vw, 42px) clamp(32px, 6vw, 52px);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: clamp(24px, 4vw, 36px);
          box-shadow:
            0 8px 32px rgba(124,58,237,0.12),
            0 32px 96px rgba(124,58,237,0.18),
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(124,58,237,0.08);
          animation: premiumCardIn 0.7s cubic-bezier(.22,1,.36,1) 0.15s both;
        }

        @keyframes premiumCardIn {
          from { opacity: 0; transform: scale(0.88) rotateX(10deg); }
          to { opacity: 1; transform: scale(1) rotateX(0deg); }
        }

        /* shimmer effect on card border */
        .premium-logo-card::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: clamp(24px, 4vw, 36px);
          padding: 1.5px;
          background: linear-gradient(135deg, 
            transparent 0%, 
            rgba(196,181,253,0.8) 25%, 
            rgba(124,58,237,0.6) 50%, 
            rgba(196,181,253,0.8) 75%, 
            transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: premiumBorderShimmer 4s linear infinite;
          pointer-events: none;
        }

        @keyframes premiumBorderShimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }

        /* ── logo wrapper with glow ── */
        .premium-logo-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: premiumLogoIn 0.8s cubic-bezier(.22,1,.36,1) 0.3s both;
        }

        @keyframes premiumLogoIn {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* glow rings around logo */
        .premium-glow-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(124,58,237,0.15);
          pointer-events: none;
        }
        .premium-glow-ring-1 {
          inset: -15%;
          animation: premiumGlowPulse 3s ease-in-out infinite;
        }
        .premium-glow-ring-2 {
          inset: -30%;
          animation: premiumGlowPulse 3s ease-in-out 0.5s infinite;
        }
        .premium-glow-ring-3 {
          inset: -45%;
          animation: premiumGlowPulse 3s ease-in-out 1s infinite;
        }

        @keyframes premiumGlowPulse {
          0%, 100% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }

        .premium-logo {
          width: clamp(140px, 30vw, 220px);
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(124,58,237,0.25));
          position: relative;
          z-index: 1;
        }

        /* ── spinner ring ── */
        .premium-spinner-container {
          position: relative;
          width: clamp(70px, 14vw, 90px);
          height: clamp(70px, 14vw, 90px);
          animation: premiumSpinnerIn 0.6s cubic-bezier(.22,1,.36,1) 0.45s both;
        }

        @keyframes premiumSpinnerIn {
          from { opacity: 0; transform: scale(0.5) rotate(-45deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .premium-spinner-track {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3.5px solid rgba(196,181,253,0.25);
        }

        .premium-spinner-arc {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3.5px solid transparent;
          border-top-color: #7C3AED;
          border-right-color: rgba(124,58,237,0.5);
          border-bottom-color: rgba(124,58,237,0.2);
          animation: premiumSpinArc 1.2s cubic-bezier(.6,.2,.4,.8) infinite;
          filter: drop-shadow(0 0 8px rgba(124,58,237,0.4));
        }

        @keyframes premiumSpinArc {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* glowing dot on spinner */
        .premium-spinner-dot {
          position: absolute;
          top: -4px;
          left: 50%;
          width: 10px;
          height: 10px;
          margin-left: -5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #C4B5FD);
          box-shadow: 
            0 0 12px rgba(124,58,237,0.8),
            0 0 24px rgba(124,58,237,0.4);
          animation: premiumSpinArc 1.2s cubic-bezier(.6,.2,.4,.8) infinite;
          transform-origin: 50% calc(50% + clamp(35px, 7vw, 45px));
        }

        /* ── animated dots ── */
        .premium-dots {
          display: flex;
          align-items: center;
          gap: 8px;
          animation: premiumDotsIn 0.5s cubic-bezier(.22,1,.36,1) 0.6s both;
        }

        @keyframes premiumDotsIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .premium-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(124,58,237,0.3);
          animation: premiumDotBounce 1.6s ease-in-out infinite;
        }
        .premium-dot:nth-child(1) { animation-delay: 0s; }
        .premium-dot:nth-child(2) { animation-delay: 0.2s; }
        .premium-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes premiumDotBounce {
          0%, 80%, 100% { 
            transform: scale(1); 
            opacity: 0.3; 
            background: rgba(124,58,237,0.3);
          }
          40% { 
            transform: scale(1.8); 
            opacity: 1; 
            background: #7C3AED;
            box-shadow: 0 0 12px rgba(124,58,237,0.6);
          }
        }

        /* ── progress bar ── */
        .premium-progress-container {
          width: clamp(200px, 50vw, 320px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: premiumProgressIn 0.5s cubic-bezier(.22,1,.36,1) 0.75s both;
        }

        @keyframes premiumProgressIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .premium-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(196,181,253,0.3);
          border-radius: 99px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(124,58,237,0.1);
        }

        .premium-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, 
            #7C3AED 0%, 
            #A78BFA 25%, 
            #C4B5FD 50%, 
            #A78BFA 75%, 
            #7C3AED 100%);
          background-size: 200% 100%;
          box-shadow: 
            0 0 12px rgba(124,58,237,0.4),
            inset 0 1px 0 rgba(255,255,255,0.3);
          animation: premiumProgressSlide 2s ease-in-out infinite;
        }

        @keyframes premiumProgressSlide {
          0% { 
            background-position: 200% center; 
            width: 25%; 
            margin-left: 0%; 
          }
          50% { 
            background-position: 0% center; 
            width: 60%; 
            margin-left: 20%; 
          }
          100% { 
            background-position: -200% center; 
            width: 25%; 
            margin-left: 75%; 
          }
        }

        .premium-progress-label {
          font-family: 'Open Sans', sans-serif;
          font-size: clamp(11px, 2.2vw, 14px);
          font-weight: 600;
          color: rgba(124,58,237,0.7);
          letter-spacing: 0.02em;
          text-align: center;
        }

        /* ── subtle particles ── */
        .premium-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(124,58,237,0.4);
          pointer-events: none;
          animation: premiumParticleFloat 8s ease-in-out infinite;
        }
        .premium-particle:nth-child(1) {
          top: 20%; left: 15%;
          animation-delay: 0s;
          animation-duration: 7s;
        }
        .premium-particle:nth-child(2) {
          top: 60%; left: 80%;
          animation-delay: 1.5s;
          animation-duration: 9s;
        }
        .premium-particle:nth-child(3) {
          top: 40%; left: 10%;
          animation-delay: 3s;
          animation-duration: 8s;
        }
        .premium-particle:nth-child(4) {
          top: 75%; left: 70%;
          animation-delay: 2s;
          animation-duration: 10s;
        }

        @keyframes premiumParticleFloat {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0; 
          }
          10% { opacity: 0.6; }
          50% { 
            transform: translateY(-80px) scale(1.5); 
            opacity: 0.8; 
          }
          90% { opacity: 0.3; }
        }
      `}</style>

      <div className="premium-loader-root">
        {/* floating orbs */}
        <div className="premium-orb premium-orb-1" />
        <div className="premium-orb premium-orb-2" />
        <div className="premium-orb premium-orb-3" />
        
        {/* grid pattern */}
        <div className="premium-grid" />

        {/* floating particles */}
        <div className="premium-particle" />
        <div className="premium-particle" />
        <div className="premium-particle" />
        <div className="premium-particle" />

        {/* main content */}
        <div className="premium-container">
          
          {/* logo card */}
          <div className="premium-logo-card">
            <div className="premium-logo-wrapper">
              <div className="premium-glow-ring premium-glow-ring-1" />
              <div className="premium-glow-ring premium-glow-ring-2" />
              <div className="premium-glow-ring premium-glow-ring-3" />
              <img 
                src="/logo-for-light.png" 
                alt="VendoSphere" 
                className="premium-logo"
              />
            </div>
          </div>

          {/* spinner */}
          <div className="premium-spinner-container">
            <div className="premium-spinner-track" />
            <div className="premium-spinner-arc" />
            <div className="premium-spinner-dot" />
          </div>

          {/* animated dots */}
          <div className="premium-dots">
            <div className="premium-dot" />
            <div className="premium-dot" />
            <div className="premium-dot" />
          </div>

          {/* progress bar */}
          <div className="premium-progress-container">
            <div className="premium-progress-track">
              <div className="premium-progress-fill" />
            </div>
            <p className="premium-progress-label">Loading your experience...</p>
          </div>

        </div>
      </div>
    </>
  )
}
