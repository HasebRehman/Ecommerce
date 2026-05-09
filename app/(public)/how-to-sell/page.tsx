'use client'

import Link from 'next/link'
import { ArrowRight, Store, Package, TrendingUp, Users, CheckCircle, Zap } from 'lucide-react'

export default function HowToSellPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .hts-header { font-family: 'Montserrat', sans-serif; }
        .hts-body   { font-family: 'Open Sans',   sans-serif; }
        
        .hts-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.1);
          transition: all 0.3s ease;
        }
        .hts-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.2);
        }

        .hts-step {
          background: white;
          border: 2px solid rgba(196,181,253,0.4);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .hts-step:hover {
          border-color: #7C3AED;
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        .hts-btn {
          padding: 16px 32px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
          text-decoration: none;
        }
        .hts-btn:hover {
          background: linear-gradient(135deg, #6D28D9, #5B21B6);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }

        .hts-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(124,58,237,0.05);
          border-radius: 12px;
          border: 1px solid rgba(196,181,253,0.3);
        }
      `}</style>

      <div className="min-h-screen hts-body" style={{ background: 'linear-gradient(to bottom, #faf5ff, #ffffff)' }}>
        
        {/* Header */}
        <div className="border-b" style={{ borderColor: 'rgba(196,181,253,0.3)', background: 'white' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm hts-body" style={{ color: '#6b7280' }}>
              <span className="hover:text-[#7C3AED] transition-colors">Home</span>
              <span>/</span>
              <span style={{ color: '#7C3AED', fontWeight: 600 }}>How to Sell</span>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl hts-header font-black mb-6" style={{ color: '#1e1b4b' }}>
              Start Selling on VendoSphere
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: '#6b7280' }}>
              Join thousands of successful sellers and reach millions of customers. Turn your products into profits with our easy-to-use platform.
            </p>
          </div>

          {/* Why Sell With Us */}
          <div className="mb-16">
            <h2 className="text-3xl hts-header font-black text-center mb-8" style={{ color: '#1e1b4b' }}>
              Why Sell With Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="hts-card text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <Users style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 className="text-xl hts-header font-bold mb-3" style={{ color: '#1e1b4b' }}>
                  Large Customer Base
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Access millions of active buyers looking for products like yours every day.
                </p>
              </div>

              <div className="hts-card text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <Zap style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 className="text-xl hts-header font-bold mb-3" style={{ color: '#1e1b4b' }}>
                  Easy Setup
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Get started in minutes with our simple seller registration and product listing process.
                </p>
              </div>

              <div className="hts-card text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <TrendingUp style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 className="text-xl hts-header font-bold mb-3" style={{ color: '#1e1b4b' }}>
                  Grow Your Business
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Use our analytics and marketing tools to increase sales and expand your reach.
                </p>
              </div>

            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl hts-header font-black text-center mb-8" style={{ color: '#1e1b4b' }}>
              How to Become a Seller
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Step 1 */}
              <div className="hts-step">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <span className="text-white text-xl font-black hts-header">1</span>
                </div>
                <h3 className="text-lg hts-header font-bold mb-2" style={{ color: '#1e1b4b' }}>
                  Register as Seller
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Click "Become a Seller" and fill out the registration form with your business details.
                </p>
              </div>

              {/* Step 2 */}
              <div className="hts-step">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <span className="text-white text-xl font-black hts-header">2</span>
                </div>
                <h3 className="text-lg hts-header font-bold mb-2" style={{ color: '#1e1b4b' }}>
                  Get Approved
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Our team will review your application and approve your seller account within 24-48 hours.
                </p>
              </div>

              {/* Step 3 */}
              <div className="hts-step">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <span className="text-white text-xl font-black hts-header">3</span>
                </div>
                <h3 className="text-lg hts-header font-bold mb-2" style={{ color: '#1e1b4b' }}>
                  Create Your Shop
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Set up your shop with a name, logo, and description to showcase your brand.
                </p>
              </div>

              {/* Step 4 */}
              <div className="hts-step">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                >
                  <span className="text-white text-xl font-black hts-header">4</span>
                </div>
                <h3 className="text-lg hts-header font-bold mb-2" style={{ color: '#1e1b4b' }}>
                  List Products
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                  Add your products with photos, descriptions, prices, and start selling immediately!
                </p>
              </div>

            </div>
          </div>

          {/* How to Sell Products */}
          <div className="mb-16">
            <h2 className="text-3xl hts-header font-black text-center mb-8" style={{ color: '#1e1b4b' }}>
              How to Sell Your Products
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              
              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Add Product Details
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Upload high-quality images, write compelling descriptions, set competitive prices, and specify stock quantities.
                  </p>
                </div>
              </div>

              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Manage Inventory
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Keep track of your stock levels, update product availability, and manage multiple products from your dashboard.
                  </p>
                </div>
              </div>

              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Process Orders
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Receive instant notifications for new orders, confirm them, and update shipping status to keep customers informed.
                  </p>
                </div>
              </div>

              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Deliver Products
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Ship products to customers using your preferred delivery method and mark orders as delivered once completed.
                  </p>
                </div>
              </div>

              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Get Paid
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Receive payments directly to your account after successful deliveries. Track your earnings in the dashboard.
                  </p>
                </div>
              </div>

              <div className="hts-feature">
                <CheckCircle style={{ width: '24px', height: '24px', color: '#7C3AED', flexShrink: 0 }} />
                <div>
                  <h4 className="font-bold hts-header mb-1" style={{ color: '#1e1b4b' }}>
                    Build Your Reputation
                  </h4>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Provide excellent service to earn positive reviews and ratings, which help attract more customers to your shop.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="hts-card max-w-2xl mx-auto">
              <Store style={{ width: '48px', height: '48px', color: '#7C3AED', margin: '0 auto 16px' }} />
              <h2 className="text-2xl sm:text-3xl hts-header font-black mb-4" style={{ color: '#1e1b4b' }}>
                Ready to Start Selling?
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#6b7280' }}>
                Join our community of successful sellers and start earning today. It only takes a few minutes to get started!
              </p>
              <Link href="/request-seller" className="hts-btn">
                Become a Seller
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </>
  )
}
