import Link from 'next/link'
import { Edit, Trash2, Store, Package } from 'lucide-react'

interface Shop {
  id:          string
  name:        string
  description: string | null
  logo_url:    string | null
  banner_url:  string | null
  status:      'draft' | 'live' | 'paused'
  shop_products: { count: number }[]
}

interface Props {
  shop:     Shop
  onDelete: (id: string) => void
}

const STATUS_STYLES = {
  live:   { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  draft:  { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' },
  paused: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
}

export default function ShopCard({ shop, onDelete }: Props) {
  const productCount = shop.shop_products?.[0]?.count ?? 0
  const statusStyle = STATUS_STYLES[shop.status]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }
      `}</style>

      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group cursor-default border flex flex-col h-full"
        style={{ 
          background: 'white',
          borderColor: 'rgba(196, 181, 253, 0.3)',
          boxShadow: '0 12px 32px rgba(124, 58, 237, 0.15)'
        }}
      >

        {/* Banner */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-br from-purple-100 to-purple-50 overflow-hidden flex-shrink-0">
          {shop.banner_url ? (
            <img
              src={shop.banner_url}
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#C4B5FD' }} />
            </div>
          )}

          {/* Action buttons on hover */}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/dashboard/shops/${shop.id}/edit`}>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                style={{ background: 'rgba(124, 58, 237, 0.2)' }}
              >
                <Edit className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
              </button>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(shop.id)
              }}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{ background: 'rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          
          {/* Logo + Header */}
          <div className="flex items-center gap-3 mb-3">
            {/* Logo */}
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 overflow-hidden shrink-0 flex-shrink-0"
              style={{ 
                borderColor: 'rgba(196, 181, 253, 0.3)',
                background: 'white',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)'
              }}
            >
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                  <Store className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#C4B5FD' }} />
                </div>
              )}
            </div>

            {/* Name + Status */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base font-montserrat truncate" style={{ color: '#1e1b4b' }}>
                {shop.name}
              </p>
              <div 
                className="px-2 py-0.5 rounded-md text-xs font-bold inline-flex items-center gap-1 font-montserrat mt-1"
                style={{ 
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                  width: 'fit-content'
                }}
              >
                {shop.status === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusStyle.text }} />
                )}
                <span className="capitalize">{shop.status}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 py-3 border-t border-b" style={{ borderColor: 'rgba(196, 181, 253, 0.2)' }}>
            <Package className="w-4 h-4" style={{ color: '#7C3AED' }} />
            <span className="text-xs sm:text-sm font-open-sans" style={{ color: '#6b7280' }}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Manage button */}
          <Link href={`/dashboard/shops/${shop.id}`} className="flex-grow flex flex-col justify-end mt-3">
            <button 
              className="w-full py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 cursor-pointer font-montserrat"
              style={{ 
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}
            >
              Manage Shop
            </button>
          </Link>
        </div>

      </div>
    </>
  )
}