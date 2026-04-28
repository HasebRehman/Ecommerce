'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  shopName: string
  isDeleting: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteShopModal({
  isOpen,
  shopName,
  isDeleting,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');

        .dsm-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: dsm-fadeIn 0.2s ease-out;
        }

        @keyframes dsm-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dsm-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 420px;
          width: 100%;
          animation: dsm-slideUp 0.3s cubic-bezier(.22,1,.36,1);
          border: 1px solid rgba(196, 181, 253, 0.2);
        }

        @keyframes dsm-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dsm-header {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
        }

        .dsm-body {
          font-family: 'Open Sans', sans-serif;
        }

        .dsm-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: rgba(220, 38, 38, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .dsm-btn-cancel {
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
          color: #7C3AED;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          padding: 12px 24px;
          transition: all 0.2s ease;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .dsm-btn-cancel:hover {
          background: rgba(124, 58, 237, 0.15);
          border-color: rgba(124, 58, 237, 0.4);
        }

        .dsm-btn-confirm {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          border: none;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .dsm-btn-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
        }

        .dsm-btn-confirm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .dsm-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(124, 58, 237, 0.1);
          border: none;
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dsm-close-btn:hover {
          background: rgba(124, 58, 237, 0.15);
        }
      `}</style>

      {/* Overlay */}
      <div className="dsm-overlay" onClick={onCancel}>
        {/* Modal */}
        <div className="dsm-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
            <h2 className="dsm-header text-xl text-[#1e1b4b]">Delete Shop</h2>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="dsm-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Icon */}
            <div className="dsm-icon-wrapper">
              <AlertTriangle className="w-8 h-8 text-[#dc2626]" />
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <p className="dsm-header text-lg text-[#1e1b4b]">
                Delete "{shopName}"?
              </p>
              <p className="dsm-body text-sm text-[#6b7280] leading-relaxed">
                This action cannot be undone. All shop data and product assignments will be permanently removed.
              </p>
            </div>

            {/* Warning box */}
            <div
              className="p-3 rounded-12 border"
              style={{
                background: 'rgba(220, 38, 38, 0.05)',
                borderColor: 'rgba(220, 38, 38, 0.2)',
              }}
            >
              <p className="dsm-body text-xs text-[#7f1d1d] font-semibold">
                ⚠️ This will delete the shop and all associated product assignments.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-[#E5E7EB]">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="dsm-btn-cancel flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="dsm-btn-confirm flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Shop'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
