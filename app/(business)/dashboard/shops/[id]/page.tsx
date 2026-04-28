'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Loader2, Store, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/axios'
import ShopProductsManager from '@/components/dashboard/business/shops/ShopProductsManager'
import StatusToggle from '@/components/dashboard/business/shops/StatusToggle'

export default function ShopDetailPage() {
  const params            = useParams()
  const router            = useRouter()
  const [shop,    setShop]    = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/shops/${params.id}`)
      .then(res => setShop(res.data.shop))
      .catch(() => router.push('/dashboard/shops'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF5FF' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }
  if (!shop)   return null

  return (
    <div style={{ background: '#ffffff', fontFamily: "'Open Sans', sans-serif", minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        
        .ms-header { font-family: 'Montserrat', sans-serif; }
        .ms-body { font-family: 'Open Sans', sans-serif; }
        
        .ms-btn-back {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          color: #7C3AED;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .ms-btn-back:hover {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.4);
        }
        
        .ms-btn-edit {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          border: none;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          border-radius: 12px;
          padding: 10px 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(124,58,237,0.3);
          cursor: pointer;
        }
        .ms-btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(124,58,237,0.4);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard/shops')} 
                className="ms-btn-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {shop.logo_url
                  ? <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 rounded-14 object-cover shadow-lg" />
                  : <div className="w-12 h-12 rounded-14 bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center"><Store className="w-6 h-6 text-white" /></div>
                }
                <div>
                  <h1 className="ms-header text-2xl sm:text-3xl font-bold text-[#1e1b4b]">{shop.name}</h1>
                  <p className="ms-body text-[#6b7280] text-sm">Manage your shop products</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusToggle
                shopId={shop.id}
                status={shop.status}
                onChange={(s) => setShop((p: any) => ({ ...p, status: s }))}
              />
              <Link href={`/dashboard/shops/${params.id}/edit`}>
                <button className="ms-btn-edit flex items-center gap-2 text-sm">
                  <Edit className="w-4 h-4" /> Edit
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ShopProductsManager shopId={shop.id} />
      </div>
    </div>
  )
}