import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
          borderRadius: '36px',
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shopping cart icon */}
          <path
            d="M20 25L30 25L40 70L75 70L85 40L35 40"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="45" cy="80" r="4" fill="white" />
          <circle cx="70" cy="80" r="4" fill="white" />
          {/* Globe/orbit ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="15"
            stroke="white"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
            transform="rotate(-20 50 50)"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
