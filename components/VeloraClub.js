'use client'
import { motion } from 'framer-motion'
import { 
  Award, Shield, Heart, Package, Clock, Sliders, Tag, User, Check, ChevronRight, ArrowRight, HelpCircle, Sparkles
} from 'lucide-react'

export default function VeloraClub({ useShop }) {
  const { setRoute, user } = useShop()

  const BENEFITS = [
    {
      title: "Early Access",
      desc: "Receive private notifications and shopping privileges for upcoming seasonal collections and limited boutique runs before public release.",
      icon: Clock
    },
    {
      title: "Couture Birthday Curation",
      desc: "An exclusive curated birthday gesture, tailored to your historical size preferences and aesthetic profile.",
      icon: Award
    },
    {
      title: "Festival Privileges",
      desc: "Tasteful seasonal gestures and exclusive priority access during festive collections and major celebrations.",
      icon: Tag
    },
    {
      title: "Saved Measurements",
      desc: "Store your exact tailoring dimensions in your private account profile to experience seamless custom fits with every order.",
      icon: Sliders
    },
    {
      title: "Gift Studio History",
      desc: "Save and review your personalized AI Gift Finder curation sessions, making it effortless to repeat thoughtful gestures.",
      icon: GiftIcon
    },
    {
      title: "Expedited Checkout",
      desc: "Securely pre-save your billing and atelier address details for a seamless, prompt checkout transaction.",
      icon: Shield
    },
    {
      title: "Wishlist Synchronicity",
      desc: "Synchronize your favored designs across all devices, ensuring your curated wishlist is perpetually up to date.",
      icon: Heart
    },
    {
      title: "Order Archival History",
      desc: "Access a detailed archive of all previous couture acquisitions, complete with electronic invoices and real-time tracking.",
      icon: Package
    },
    {
      title: "Exclusive Member Collections",
      desc: "Unlock select masterworks and bespoke handloom ensembles crafted exclusively for VELORA Club members.",
      icon: Sparkles
    },
    {
      title: "Atelier Priority Support",
      desc: "Bypassed queue privileges connecting you directly with our senior styling advisors and master tailors.",
      icon: HelpCircle
    }
  ]

  const TIERS = [
    {
      name: "Member",
      points: "Entry Tier",
      desc: "The foundation of our boutique relationship.",
      benefits: [
        "Complimentary shipping on all premium items",
        "Atelier priority notices for seasonal drops",
        "Birthday curation gesture"
      ]
    },
    {
      name: "Silver",
      points: "1,000 Points",
      desc: "Elevating your digital boutique experience.",
      benefits: [
        "All Member tier benefits",
        "Private preview of collections 24h early",
        "Complimentary signature linen packaging"
      ]
    },
    {
      name: "Gold",
      points: "3,000 Points",
      desc: "Reserved for patrons of dedicated craft.",
      benefits: [
        "All Silver tier privileges",
        "Personal styling consultation with an atelier advisor",
        "Year-round flat 10% privilege discount on new releases",
        "Priority tailor processing & expedited dispatch"
      ]
    },
    {
      name: "Platinum",
      points: "5,000+ Points",
      desc: "The absolute pinnacle of VELORA curation.",
      benefits: [
        "All Gold tier privileges",
        "Unlimited custom made-to-measure tailoring adjustments",
        "Exclusive invites to our annual handloom showcase events",
        "24/7 dedicated personal concierge support line"
      ]
    }
  ]

  // Determine current tier based on points
  const points = user?.rewards || 100
  let currentTierIdx = 0
  if (points >= 5000) currentTierIdx = 3
  else if (points >= 3000) currentTierIdx = 2
  else if (points >= 1000) currentTierIdx = 1

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-neutral-900 pb-24 selection:bg-neutral-900 selection:text-white">
      {/* Editorial Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-neutral-200/40">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1800" 
            alt="Velora Atelier Fabric" 
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F5]/20 via-[#FAF9F5] to-[#FAF9F5]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8 py-20">
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-neutral-400"></span>
            <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-neutral-500 font-semibold">
              VELORA CLUB
            </span>
            <span className="h-[1px] w-8 bg-neutral-400"></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-light text-neutral-950 tracking-tight leading-none">
            VELORA Club
          </h1>

          <p className="text-base md:text-lg text-neutral-600 font-serif-lux italic font-light max-w-xl mx-auto leading-relaxed">
            Enjoy exclusive benefits designed to make every shopping experience even better.
          </p>

          <div className="pt-4">
            {user ? (
              <button 
                onClick={() => setRoute({ view: 'account' })}
                className="bg-neutral-950 text-white hover:bg-neutral-800 h-13 px-10 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <span>Enter My Club Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setRoute({ view: 'auth' })}
                className="bg-neutral-950 text-white hover:bg-neutral-800 h-13 px-10 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <span>Join Velora Club</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Philosophy / Statement */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center border-b border-neutral-200/20">
        <p className="text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase mb-4">THE RELATIONSHIP PHILOSOPHY</p>
        <p className="text-xl md:text-2xl text-neutral-850 font-sans font-light leading-relaxed max-w-3xl mx-auto">
          "Membership is not a gamified transaction, but an extension of our craft. We honor your appreciation for slow luxury with tailored sizing, priority attention, and absolute design exclusivity."
        </p>
        <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase mt-6">— THE VELORA ATELIER</p>
      </section>

      {/* Elegant Progress / Tiers Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <p className="text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase mb-2">TIER HIERARCHY</p>
          <h2 className="text-3xl font-display font-light text-neutral-950 tracking-tight">
            Designed to elevate over time
          </h2>
          {user && (
            <div className="mt-6 inline-flex items-center gap-3 bg-white border border-neutral-200/60 px-5 py-2.5 rounded-full text-xs text-neutral-700">
              <span className="font-mono text-neutral-400">Current Balance:</span>
              <span className="font-semibold text-neutral-950">{points} points</span>
              <span className="w-1 h-1 rounded-full bg-neutral-350"></span>
              <span className="font-semibold text-neutral-950">{TIERS[currentTierIdx].name} Status</span>
            </div>
          )}
        </div>

        {/* Level Progression Diagrams */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {TIERS.map((tier, idx) => {
            const isActive = currentTierIdx === idx
            const isCompleted = currentTierIdx > idx
            return (
              <div 
                key={tier.name}
                className={`border p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                  isActive 
                    ? 'bg-white border-neutral-900 shadow-[0_12px_40px_rgba(0,0,0,0.03)] scale-[1.01]' 
                    : 'bg-white/50 border-neutral-200/60 hover:border-neutral-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      {tier.points}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-mono bg-neutral-950 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active Level
                      </span>
                    ) : isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-2xl font-display font-light text-neutral-950 mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-neutral-500 font-serif-lux italic mb-6">
                    {tier.desc}
                  </p>

                  <ul className="space-y-3.5 border-t border-neutral-100 pt-6">
                    {tier.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-xs text-neutral-600 leading-normal">
                        <span className="text-neutral-400 mt-1 flex-shrink-0">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress bar to next tier if logged in */}
        {user && currentTierIdx < 3 && (
          <div className="max-w-2xl mx-auto border border-neutral-200/60 bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-xs text-neutral-600 font-sans leading-relaxed">
              You are currently <span className="font-semibold text-neutral-950">{TIERS[currentTierIdx + 1].name === 'Silver' ? 1000 - points : TIERS[currentTierIdx + 1].name === 'Gold' ? 3000 - points : 5000 - points} points</span> away from unlocking <span className="font-semibold text-neutral-950">{TIERS[currentTierIdx + 1].name} Status</span>.
            </p>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-neutral-950 h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${(points / (currentTierIdx === 0 ? 1000 : currentTierIdx === 1 ? 3000 : 5000)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Member Benefits Bento Grid */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 border-t border-neutral-200/20">
        <div className="text-center mb-16">
          <p className="text-[9px] font-mono tracking-[0.25em] text-neutral-400 uppercase mb-2">MEMBER PRIVILEGES</p>
          <h2 className="text-3xl font-display font-light text-neutral-950 tracking-tight">
            Every privilege, beautifully orchestrated
          </h2>
          <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">
            Enjoy premium customer care and tailored digital experiences with our complimentary club features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <div 
                key={b.title}
                className="bg-white border border-neutral-200/60 p-8 rounded-2xl space-y-4 hover:border-neutral-800 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full border border-neutral-100 bg-[#FAF9F5] flex items-center justify-center text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                    {b.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                    {b.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Elegant CTA Invitation */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <div className="border border-neutral-200/60 bg-white p-12 md:p-16 rounded-3xl shadow-sm space-y-6">
          <h2 className="text-3xl font-display font-light text-neutral-950">
            {user ? "Begin your luxury curation" : "An invitation to premium care"}
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            {user 
              ? "Access your dashboard to update measurement sizing, examine past AI Gift Finder sessions, or browse member-exclusive catalog arrivals."
              : "Register or sign in to activate your complimentary VELORA Club membership and immediately secure your 100 startup points."
            }
          </p>
          <div className="pt-2 flex justify-center gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => setRoute({ view: 'shop' })}
                  className="bg-neutral-950 text-white hover:bg-neutral-800 h-11 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                >
                  Browse Collection
                </button>
                <button 
                  onClick={() => setRoute({ view: 'account' })}
                  className="border border-neutral-300 hover:border-neutral-950 h-11 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                >
                  My Profile
                </button>
              </>
            ) : (
              <button 
                onClick={() => setRoute({ view: 'auth' })}
                className="bg-neutral-950 text-white hover:bg-neutral-800 h-11 px-10 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
              >
                Sign In or Register
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Simple fallback helper for Gift icon
function GiftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s-2-5-4.5-5a2.5 2.5 0 0 1 0 5z" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C14 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 0 0 5z" />
    </svg>
  )
}
