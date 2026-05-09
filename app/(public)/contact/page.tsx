'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('All fields are required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', message: '' })
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('Contact form error:', err)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap');
        .contact-header { font-family: 'Montserrat', sans-serif; }
        .contact-body   { font-family: 'Open Sans',   sans-serif; }
        
        .contact-card {
          background: linear-gradient(135deg, rgba(237,233,254,0.6), rgba(250,245,255,0.4));
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.1);
        }

        .contact-input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          background: white;
          transition: all 0.2s ease;
        }
        .contact-input:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .contact-input::placeholder {
          color: #9ca3af;
        }

        .contact-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(196,181,253,0.5);
          border-radius: 12px;
          font-family: 'Open Sans', sans-serif;
          font-size: 14px;
          color: #1e1b4b;
          background: white;
          transition: all 0.2s ease;
          resize: vertical;
          min-height: 140px;
        }
        .contact-textarea:focus {
          outline: none;
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
        .contact-textarea::placeholder {
          color: #9ca3af;
        }

        .contact-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
        }
        .contact-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #6D28D9, #5B21B6);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .contact-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-card {
          background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(109,40,217,0.05));
          border: 1.5px solid rgba(196,181,253,0.3);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.2s ease;
        }
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(124,58,237,0.15);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      <div className="min-h-screen contact-body" style={{ background: 'linear-gradient(to bottom, #faf5ff, #ffffff)' }}>
        
        {/* Header */}
        <div className="border-b" style={{ borderColor: 'rgba(196,181,253,0.3)', background: 'white' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm contact-body" style={{ color: '#6b7280' }}>
              <span className="hover:text-[#7C3AED] transition-colors">Home</span>
              <span>/</span>
              <span style={{ color: '#7C3AED', fontWeight: 600 }}>Contact Us</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Side - Information */}
            <div className="space-y-8">
              
              {/* Heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl contact-header font-black mb-4" style={{ color: '#1e1b4b' }}>
                  Get in Touch
                </h1>
                <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#6b7280' }}>
                  Have a question or feedback? We'd love to hear from you. Fill out the form and our team will get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Information Cards */}
              <div className="space-y-4">
                
                {/* Email */}
                <div className="info-card">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                  >
                    <Mail style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="contact-header font-bold text-sm mb-1" style={{ color: '#1e1b4b' }}>
                      Email Us
                    </h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      support@vendosphere.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="info-card">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                  >
                    <Phone style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="contact-header font-bold text-sm mb-1" style={{ color: '#1e1b4b' }}>
                      Call Us
                    </h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="info-card">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
                  >
                    <MapPin style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="contact-header font-bold text-sm mb-1" style={{ color: '#1e1b4b' }}>
                      Visit Us
                    </h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>
                      123 Business Street, Suite 100<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>

              </div>

              {/* Additional Info */}
              <div className="contact-card">
                <h3 className="contact-header font-bold text-base mb-3" style={{ color: '#1e1b4b' }}>
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm" style={{ color: '#6b7280' }}>
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-semibold" style={{ color: '#1e1b4b' }}>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-semibold" style={{ color: '#1e1b4b' }}>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold" style={{ color: '#1e1b4b' }}>Closed</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side - Contact Form */}
            <div>
              <div className="contact-card">
                <h2 className="contact-header font-black text-2xl mb-6" style={{ color: '#1e1b4b' }}>
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold contact-header mb-2" style={{ color: '#1e1b4b' }}>
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="contact-input"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold contact-header mb-2" style={{ color: '#1e1b4b' }}>
                      Email Address <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      className="contact-input"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold contact-header mb-2" style={{ color: '#1e1b4b' }}>
                      Message <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Enter your message..."
                      required
                      className="contact-textarea"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="contact-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '18px', height: '18px' }} />
                        Send Message
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>

          </div>

        </div>

      </div>
    </>
  )
}
