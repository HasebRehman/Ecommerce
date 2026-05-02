"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap');

        /* ── Base toast — all types share the brand purple ── */
        [data-sonner-toast] {
          font-family: 'Montserrat', sans-serif !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          border-radius: 14px !important;
          padding: 13px 16px !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          box-shadow: 0 8px 28px rgba(104,38,207,0.35), 0 2px 8px rgba(0,0,0,0.15) !important;
          background: linear-gradient(135deg, #6826cf 0%, #5a1fb8 100%) !important;
          color: #ffffff !important;
          gap: 10px !important;
          align-items: center !important;
          /* responsive width */
          width: clamp(260px, 90vw, 360px) !important;
          min-width: 0 !important;
          max-width: min(360px, calc(100vw - 32px)) !important;
          box-sizing: border-box !important;
        }

        /* ── Icon colour — soft lavender on all types ── */
        [data-sonner-toast] [data-icon],
        [data-sonner-toast] [data-icon] svg {
          color: #ddd6fe !important;
          flex-shrink: 0 !important;
        }

        /* ── Title ── */
        [data-sonner-toast] [data-title] {
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #ffffff !important;
          line-height: 1.35 !important;
          word-break: break-word !important;
        }

        /* ── Description ── */
        [data-sonner-toast] [data-description] {
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          color: rgba(255,255,255,0.72) !important;
          margin-top: 2px !important;
          line-height: 1.4 !important;
          word-break: break-word !important;
        }

        /* ── Close button ── */
        [data-sonner-toast] [data-close-button] {
          background: rgba(255,255,255,0.15) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: #ffffff !important;
          border-radius: 8px !important;
        }
        [data-sonner-toast] [data-close-button]:hover {
          background: rgba(255,255,255,0.28) !important;
        }

        /* ── Action button ── */
        [data-sonner-toast] [data-button] {
          background: rgba(255,255,255,0.18) !important;
          color: #ffffff !important;
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255,255,255,0.25) !important;
          padding: 5px 12px !important;
          flex-shrink: 0 !important;
        }
        [data-sonner-toast] [data-button]:hover {
          background: rgba(255,255,255,0.3) !important;
        }

        /* ── Mobile: full-width near bottom edge ── */
        @media (max-width: 480px) {
          [data-sonner-toaster] {
            left: 16px !important;
            right: 16px !important;
            width: auto !important;
          }
          [data-sonner-toast] {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 12px !important;
            padding: 12px 14px !important;
            border-radius: 12px !important;
          }
          [data-sonner-toast] [data-title] {
            font-size: 12px !important;
          }
          [data-sonner-toast] [data-description] {
            font-size: 11px !important;
          }
        }
      `}</style>

      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info:    <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error:   <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
