'use client'
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import PremiumAuth from "@/components/PremiumAuth";
import PremiumAccount from "@/components/PremiumAccount";
import PremiumSizeGuide from "@/components/PremiumSizeGuide";
import LuxuryShowcase from "@/components/LuxuryShowcase";
import MiniCart from "@/components/MiniCart";
import VeloraClub from "@/components/VeloraClub";
import GiftStudioView from "@/components/GiftStudioView";
import { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronRight, ChevronLeft, Star, Truck, Shield,
  RotateCcw, CreditCard, Sparkles, Zap, Package, MapPin, ArrowRight, Plus, Minus, Trash2,
  Instagram, Twitter, Facebook, Youtube, Filter, Check, Mic, Award, Clock, Gift, Wallet, LogOut, ArrowUpRight,
  MessageCircle, Send, Bot, HelpCircle, Phone, Mail, Loader2, Truck as TruckIcon, Camera, Upload, RefreshCw
} from 'lucide-react'

export const ShopCtx = createContext(null)
export const useShop = () => useContext(ShopCtx)
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

const CinematicLoader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
    >
      <motion.h1
        initial={{ opacity: 0, letterSpacing: '0.25em' }}
        animate={{ opacity: 1, letterSpacing: '0.4em' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl md:text-6xl font-sans font-bold text-white uppercase select-none tracking-widest"
      >
        VELORA
      </motion.h1>
    </motion.div>
  )
}

const MagneticButton = ({ children, className, onClick, id }) => {
  return (
    <motion.button
      id={id}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`${className} shadow-sm hover:shadow-md transition-shadow`}
    >
      {children}
    </motion.button>
  )
}

const TextMaskReveal = ({ text, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {text.split('\n').map((line, i) => (
        <span key={i} className="block">{line}</span>
      ))}
    </motion.div>
  )
}

const VeloraLogo = ({ size = 'md' }) => {
  const dims = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl', xl: 'text-6xl' }[size]
  return (
    <div className={`font-display font-bold ${dims} tracking-tight flex items-center gap-1.5`}>
      <span className="relative">
        <span className="silver-text">V</span>
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500 pulse-glow" />
      </span>
      <span className="text-neutral-900">ELORA</span>
    </div>
  )
}

const TOP_MARQUEE = ['FREE DELIVERY ON ORDERS ABOVE ₹1499', 'CASH ON DELIVERY (COD) AVAILABLE', 'EASY 15-DAY RETURNS & REPLACEMENTS', 'FLAT 20% OFF WITH CODE VELORA20', 'NEW FESTIVE ARRIVALS ARE LIVE']
const TopBar = () => (
  <div className="bg-neutral-950 border-b border-white/10 py-2 overflow-hidden">
    <div className="flex marquee whitespace-nowrap">
      {[...TOP_MARQUEE, ...TOP_MARQUEE, ...TOP_MARQUEE].map((t, i) => (
        <span key={i} className="mx-8 text-[11px] tracking-[0.3em] text-white/70 font-medium flex items-center gap-8">
          <span>{t}</span><Sparkles className="w-3 h-3 text-amber-500" />
        </span>
      ))}
    </div>
  </div>
)

const Header = () => {
  const { setRoute, cart, wishlist, user, setUser, setSearchOpen, setMobileNavOpen, mobileNavOpen, isOffline, setCartOpen } = useShop()
  const [scrolled, setScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showGiftStudioCard, setShowGiftStudioCard] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h)
  }, [])
  const links = [
    { l: 'Home', r: { view: 'home' } },
    { l: 'New Arrivals', r: { view: 'shop', filter: { tag: 'new' } } },
    { l: 'Collections', r: { view: 'shop' } },
    { l: 'Gift Studio', r: { view: 'gift-studio' } },
    { l: 'Sale', r: { view: 'shop', filter: { tag: 'sale' } } },
    { l: 'Profile', r: { view: 'account' } },
  ]
  return (
    <>
      <TopBar />
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong border-b border-black/10' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-neutral-900"><Menu className="w-6 h-6" /></button>
          <button onClick={() => setRoute({ view: 'home' })} className="flex-shrink-0"><VeloraLogo /></button>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((x) => {
              if (x.l === 'Gift Studio') {
                return (
                  <div 
                    key={x.l}
                    className="relative py-2"
                    onMouseEnter={() => setShowGiftStudioCard(true)}
                    onMouseLeave={() => setShowGiftStudioCard(false)}
                  >
                    <button 
                      onClick={() => setRoute(x.r)} 
                      className="text-sm font-medium text-neutral-800 hover:text-neutral-950 transition relative tracking-wide flex items-center gap-1.5"
                    >
                      <span>{x.l}</span>
                      <span className="text-[8px] bg-neutral-950 text-white font-mono px-1.5 py-0.5 tracking-wider uppercase scale-90 font-bold rounded-none">
                        NEW
                      </span>
                      <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
                    </button>

                    <AnimatePresence>
                      {showGiftStudioCard && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 -translate-x-1/2 top-10 w-72 bg-white border border-neutral-200 p-5 shadow-[0_15px_45px_rgba(0,0,0,0.06)] z-50 rounded-none text-left space-y-4"
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-neutral-950 uppercase flex items-center gap-1.5">
                              <Gift className="w-3.5 h-3.5 text-neutral-550" />
                              Gift Studio
                            </h4>
                            <p className="text-[11px] text-neutral-500 leading-normal font-sans">
                              Find thoughtful gifts with personalised recommendations.
                            </p>
                          </div>
                          
                          <div className="h-28 w-full overflow-hidden bg-neutral-50 relative">
                            <img 
                              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400" 
                              alt="Premium Gifting Box" 
                              className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                            />
                            <div className="absolute inset-0 bg-neutral-950/10" />
                          </div>
                          
                          <div className="text-[9px] font-mono tracking-widest text-neutral-450 uppercase text-center pt-1">
                            EXPERIENCE LAUNCH
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <button key={x.l} onClick={() => setRoute(x.r)} className="text-sm font-medium text-neutral-800 hover:text-neutral-900 transition relative group tracking-wide">
                  {x.l}
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-1 md:gap-2">
            {/* Connectivity Indicator */}
            <div className="relative group mr-1">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full transition relative ${
                  isOffline ? 'bg-amber-500/5' : 'bg-emerald-500/5'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full relative">
                  <span className={`absolute inset-0 rounded-full animate-ping ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className={`absolute inset-0 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all origin-top-right z-50 bg-neutral-900 text-white text-[10px] uppercase font-bold tracking-widest py-2 px-3 rounded-xl border border-white/10 shadow-xl whitespace-nowrap pointer-events-none">
                {isOffline ? (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Offline Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Secure & Connected
                  </span>
                )}
              </div>
            </div>

            <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition"><Search className="w-5 h-5" /></button>
            
            {/* VELORA Club Link */}
            <button 
              onClick={() => setRoute({ view: 'club' })} 
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/[0.02] text-[10px] tracking-widest font-semibold text-neutral-800 transition uppercase rounded-none"
            >
              <Award className="w-4 h-4 text-neutral-500" />
              <span className="hidden md:inline">VELORA Club</span>
            </button>

            {/* Profile Dropdown Container */}
            <div 
              className="relative"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button onClick={() => setRoute({ view: user ? 'account' : 'auth' })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition"><User className="w-5 h-5" /></button>
              
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute right-0 top-10 w-64 bg-white border border-neutral-100 shadow-xl shadow-black/5 rounded-none p-5 z-50 origin-top-right text-left"
                  >
                    {user ? (
                      <div className="space-y-4">
                        <div className="border-b border-neutral-100 pb-3">
                          <p className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">YOUR ACCOUNT</p>
                          <p className="text-xs font-semibold text-neutral-900 uppercase truncate mt-0.5">{user.name}</p>
                          <p className="text-[9px] font-mono text-neutral-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                          {[
                            { label: 'VELORA CLUB', view: 'club' },
                            { label: 'MY ORDERS', view: 'account' },
                            { label: 'MY WISHLIST', view: 'account' },
                            { label: 'PROFILE INFO', view: 'account' },
                            { label: 'DELIVERY ADDRESSES', view: 'account' },
                            { label: 'PAYMENT METHODS', view: 'account' },
                            { label: 'NOTIFICATION SETTINGS', view: 'account' }
                          ].map(item => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setRoute({ view: item.view })
                                setShowDropdown(false)
                              }}
                              className="text-[10px] tracking-[0.12em] font-semibold text-neutral-500 hover:text-neutral-950 text-left transition-colors"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        
                        <div className="border-t border-neutral-100 pt-3">
                          <button
                            onClick={() => {
                              localStorage.removeItem('velora_user')
                              setUser(null)
                              setRoute({ view: 'home' })
                              setShowDropdown(false)
                              toast.success('Logged out successfully')
                            }}
                            className="w-full text-left text-[10px] tracking-widest text-red-500 font-semibold uppercase hover:text-red-700 transition"
                          >
                            LOG OUT
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-b border-neutral-100 pb-3">
                          <p className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">WELCOME</p>
                          <p className="text-xs font-semibold text-neutral-800 uppercase mt-0.5 font-display">Welcome to Velora</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => {
                              setRoute({ view: 'auth' })
                              setShowDropdown(false)
                            }}
                            className="w-full h-9 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] tracking-widest uppercase font-semibold"
                          >
                            SIGN IN
                          </Button>
                          <button
                            onClick={() => {
                              setRoute({ view: 'auth' })
                              setShowDropdown(false)
                            }}
                            className="text-center text-[10px] tracking-widest uppercase font-semibold text-neutral-500 hover:text-neutral-900 transition mt-1"
                          >
                            CREATE AN ACCOUNT
                          </button>
                        </div>
                        
                        <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
                          <button
                            onClick={() => { setRoute({ view: 'track-order' }); setShowDropdown(false) }}
                            className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500 hover:text-neutral-950 text-left transition"
                          >
                            TRACK ORDER
                          </button>
                          <button
                            onClick={() => { setRoute({ view: 'contact' }); setShowDropdown(false) }}
                            className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500 hover:text-neutral-950 text-left transition"
                          >
                            SUPPORT CHANNELS
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setRoute({ view: 'wishlist' })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition relative">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-bold flex items-center justify-center text-white">{wishlist.length}</span>}
            </button>
            <button onClick={() => setCartOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/[0.02] transition relative">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-bold flex items-center justify-center text-white">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
            </button>
          </div>
        </div>
      </header>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="bg-white border-black/10 w-[85%] max-w-sm">
          <div className="mb-8"><VeloraLogo /></div>
          <div className="space-y-1">
            {links.map((x) => (
              <button key={x.l} onClick={() => { setRoute(x.r); setMobileNavOpen(false) }} className="w-full text-left py-4 px-3 rounded-lg hover:bg-black/[0.02] flex items-center justify-between border-b border-black/5">
                <span className="text-lg font-medium">{x.l}</span><ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            ))}
          </div>
          
          {/* Premium Highlighted Quick Action for Gift Studio */}
          <div className="mt-6 px-3">
            <button 
              onClick={() => { setRoute({ view: 'gift-studio' }); setMobileNavOpen(false) }}
              className="w-full bg-neutral-950 text-white hover:bg-neutral-800 py-3.5 px-4 flex items-center justify-between text-xs tracking-widest font-semibold uppercase rounded-none border border-neutral-950 transition-all duration-300 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-neutral-300" />
                <span>Gift Studio</span>
              </span>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            </button>
          </div>

          <div className="mt-8 space-y-2">
            {[['VELORA Club', 'club'],['About','about'],['Contact','contact'],['FAQ','faq'],['Size Guide','size-guide'],['Shipping','shipping'],['Track Order','track-order']].map(([p,v]) => (
              <button key={p} onClick={() => { setRoute({ view: v }); setMobileNavOpen(false) }} className="block w-full text-left py-2 text-sm text-neutral-600 hover:text-neutral-900">{p}</button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

const SearchOverlay = () => {
  const { searchOpen, setSearchOpen, setRoute, products } = useShop()
  const [q, setQ] = useState('')
  const results = useMemo(() => q.length < 2 ? [] : products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.includes(q.toLowerCase())).slice(0, 6), [q, products])
  const trending = ['Oversized Hoodie', 'Cargo', 'Silk Dress', 'Bomber']
  const startVoice = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) return toast.error('Voice search not supported')
    const r = new SR(); r.lang = 'en-IN'; r.onresult = (e) => setQ(e.results[0][0].transcript); r.start()
    toast.success('Listening...')
  }
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto pt-24 px-6">
            <div className="flex items-center gap-3 border-b border-black/15 pb-4">
              <Search className="w-6 h-6 text-neutral-600" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Velora — try 'oversized', 'silk'..." className="flex-1 bg-transparent outline-none text-2xl font-display placeholder:text-neutral-400" />
              <button onClick={startVoice} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><Mic className="w-5 h-5 text-blue-400" /></button>
              <button onClick={() => setSearchOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            {q.length < 2 ? (
              <div className="mt-8">
                <p className="text-xs tracking-[0.3em] text-neutral-500 mb-4">TRENDING</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map(t => <button key={t} onClick={() => setQ(t)} className="px-4 py-2 rounded-full glass text-sm hover:border-blue-400/50 transition">{t}</button>)}
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-2">
                {results.length === 0 ? <p className="text-neutral-500 text-center py-12">No results found</p> : results.map(p => (
                  <button key={p.id} onClick={() => { setRoute({ view: 'product', id: p.id }); setSearchOpen(false) }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/[0.02] w-full text-left">
                    <img src={p.images[0]} className="w-16 h-20 object-cover rounded-lg" alt="" />
                    <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-sm text-neutral-500">{fmt(p.price)}</p></div>
                    <ArrowUpRight className="w-5 h-5 text-neutral-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setRoute, wishlist, toggleWishlist } = useShop()
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (quickViewProduct) {
      setSize(quickViewProduct.sizes?.[0] || '')
      setColor(quickViewProduct.colors?.[0] || '')
      setQty(1)
      setImgIdx(0)
    }
  }, [quickViewProduct])

  if (!quickViewProduct) return null

  const inWL = wishlist.includes(quickViewProduct.id)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-4xl bg-[#fafaf9] rounded-3xl overflow-hidden shadow-2xl border border-black/10 text-neutral-900 grid md:grid-cols-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setQuickViewProduct(null)} 
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center hover:bg-white hover:scale-105 transition"
          >
            <X className="w-5 h-5 text-neutral-800" />
          </button>

          <div className="p-6 md:p-8 bg-neutral-100 flex flex-col justify-center border-r border-black/5 relative min-h-[300px] md:min-h-[450px]">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative bg-black/5 flex-1 max-h-[400px]">
              <img src={quickViewProduct.images[imgIdx]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              {quickViewProduct.images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + quickViewProduct.images.length) % quickViewProduct.images.length) }} 
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow hover:scale-105 transition"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % quickViewProduct.images.length) }} 
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow hover:scale-105 transition"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}
            </div>
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {quickViewProduct.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setImgIdx(i)} 
                    className={`w-12 h-14 rounded-lg overflow-hidden border-2 transition ${imgIdx === i ? 'border-neutral-900 opacity-100' : 'border-transparent opacity-50'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[550px] md:max-h-none overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-[0.2em] font-mono font-bold text-neutral-500 uppercase">{quickViewProduct.category}</span>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{quickViewProduct.rating}</span>
                </div>
              </div>
              
              <h2 className="text-xl font-display font-bold mb-2 leading-tight">{quickViewProduct.name}</h2>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-display font-bold">{fmt(quickViewProduct.price)}</span>
                <span className="text-sm text-neutral-500 line-through">{fmt(quickViewProduct.mrp)}</span>
                <span className="text-xs text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded">-{quickViewProduct.discount}% OFF</span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-serif-lux italic">{quickViewProduct.description}</p>

              {quickViewProduct.colors?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Color: <span className="text-neutral-900 font-semibold">{color}</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.colors.map(c => (
                      <button key={c} onClick={() => setColor(c)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${color === c ? 'border-neutral-900 bg-neutral-900/5 text-neutral-900' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {quickViewProduct.sizes?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Size: <span className="text-neutral-900 font-semibold">{size}</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickViewProduct.sizes.map(s => (
                      <button key={s} onClick={() => setSize(s)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${size === s ? 'border-neutral-900 bg-neutral-900/5 text-neutral-900' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-black/5">
              <div className="flex gap-2">
                <Button 
                  onClick={() => { addToCart(quickViewProduct, size, color, qty); setQuickViewProduct(null); }} 
                  className="flex-1 h-11 rounded-xl bg-neutral-950 text-white hover:bg-neutral-900 text-xs font-semibold uppercase tracking-wider"
                >
                  Add to Bag
                </Button>
                <button 
                  onClick={() => toggleWishlist(quickViewProduct.id)} 
                  className="w-11 h-11 rounded-xl border border-black/10 flex items-center justify-center hover:bg-neutral-50"
                >
                  <Heart className={`w-4 h-4 ${inWL ? 'fill-red-500 text-red-500 animate-pulse' : 'text-neutral-700'}`} />
                </button>
              </div>
              
              <button 
                onClick={() => { setRoute({ view: 'product', id: quickViewProduct.id }); setQuickViewProduct(null); }} 
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-950 underline font-medium tracking-wide"
              >
                View Full Product Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

const ProductCard = ({ p, idx = 0 }) => {
  const { setRoute, toggleWishlist, wishlist, addToCart, setQuickViewProduct } = useShop()
  const inWL = wishlist.includes(p.id)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4 }}
      transition={{ 
        type: "tween",
        ease: "easeOut",
        duration: 0.3 
      }}
      className="product-card group cursor-pointer transition-shadow duration-300 hover:shadow-xl rounded-2xl bg-[#fafaf9]"
      onClick={() => setRoute({ view: 'product', id: p.id })}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black/[0.02]">
        <img src={p.images[0]} alt={p.name} className="product-img w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {p.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] tracking-[0.2em] font-bold rounded-full glass-strong">
            {p.badge === 'NEW' && <span className="text-neutral-900">● {p.badge}</span>}
            {p.badge === 'BESTSELLER' && <span className="text-amber-700">★ {p.badge}</span>}
            {p.badge === 'LIMITED' && <span className="text-neutral-700">◆ {p.badge}</span>}
            {p.badge === 'SALE' && <span className="text-red-700">▼ -{p.discount}%</span>}
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }} className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center hover:scale-105 transition">
          <Heart className={`w-4 h-4 ${inWL ? 'fill-red-500 text-red-500 animate-pulse' : 'text-neutral-700'}`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(p, p.sizes[0], p.colors[0]) }} 
            className="flex-1 py-2.5 rounded-xl bg-neutral-950 text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-900 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(p) }} 
            className="w-10 h-10 rounded-xl bg-white text-neutral-900 flex items-center justify-center border border-black/10 hover:bg-neutral-50 transition-colors"
            title="Quick View"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="pt-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug line-clamp-1">{p.name}</h3>
          <div className="flex items-center gap-1 text-xs text-neutral-600"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {p.rating}</div>
        </div>
        <p className="text-xs text-neutral-500 uppercase tracking-wider">{p.category}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-semibold text-neutral-950">{fmt(p.price)}</span>
          <span className="text-xs text-neutral-500 line-through">{fmt(p.mrp)}</span>
          <span className="text-xs text-neutral-900 font-bold bg-neutral-100 px-1.5 py-0.5 rounded">-{p.discount}% OFF</span>
        </div>
      </div>
    </motion.div>
  )
}

const HERO_SLIDES = [
  { title: 'FESTIVE\nCOLLECTION', sub: 'The Noor Collection · Premium soft silk kurtis & beautiful festive ethnic sets', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600', cta: 'Shop Festive', route: { view: 'shop', filter: { category: 'ethnic wear' } } },
  { title: 'CLASSIC\nDESIGNS', sub: 'Beautiful Lucknowi Chikankari & high-quality traditional woven styles', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1600', cta: 'Shop Classics', route: { view: 'shop', filter: { gender: 'women' } } },
  { title: 'NEW\nARRIVALS', sub: 'Trending daily wear and premium cotton kurtis designed for everyday comfort', img: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=1600', cta: 'Shop New Arrivals', route: { view: 'shop', filter: { tag: 'new' } } },
]

const Hero = () => {
  const { setRoute } = useShop()
  const [i, setI] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % HERO_SLIDES.length), 9000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    const listener = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const s = HERO_SLIDES[i]

  return (
    <section 
      className="relative h-[100svh] w-full overflow-hidden select-none"
    >
      <AnimatePresence>
        <motion.div 
          key={i} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 2.0, ease: [0.25, 1, 0.5, 1] }} 
          className="absolute inset-0"
        >
          <motion.img 
            src={s.img} 
            alt="" 
            initial={reducedMotion ? { scale: 1.0 } : { scale: 1.0, y: '0%', x: '0%' }}
            animate={reducedMotion ? { scale: 1.0 } : { scale: 1.04, y: '-1%', x: '-0.5%' }}
            transition={{ 
              duration: 10, 
              ease: [0.25, 1, 0.5, 1]
            }}
            className="w-[106%] h-[106%] -left-[3%] -top-[3%] absolute object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/15 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="aurora opacity-15" />
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 h-full flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-3xl">
          <motion.p 
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.35em' }}
            transition={{ duration: 1.2 }}
            className="text-xs md:text-sm text-amber-500 mb-6 font-semibold uppercase block"
          >
            ● VELORA MMXXVI · EXCLUSIVE DROPS
          </motion.p>
          
          <AnimatePresence mode="wait">
            <TextMaskReveal key={i} text={s.title} className="text-massive font-display font-bold silver-white select-none leading-none tracking-tight" />
          </AnimatePresence>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-white/85 text-lg md:text-xl mt-6 font-light font-serif-lux italic"
          >
            {s.sub}
          </motion.p>

          <div className="flex flex-wrap gap-4 mt-10">
            <MagneticButton 
              onClick={() => setRoute(s.route)} 
              className="bg-white text-neutral-950 hover:bg-neutral-900 hover:text-white h-14 px-8 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group border border-white"
            >
              <span>{s.cta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </MagneticButton>

            <MagneticButton 
              onClick={() => setRoute({ view: 'shop' })} 
              className="border border-white/20 bg-transparent text-white hover:bg-white hover:text-black hover:border-white h-14 px-8 rounded-full font-semibold text-sm uppercase tracking-widest transition-all duration-300"
            >
              <span>Shop All</span>
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-12 z-10 hidden md:flex items-center gap-3 text-[10px] tracking-[0.3em] font-semibold text-neutral-400 uppercase select-none">
        <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
          <motion.div 
            animate={{ y: ['-100%', '100%'] }} 
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-full h-1/2 bg-amber-500" 
          />
        </div>
        <span>SCROLL TO DISCOVER</span>
      </div>

      <div className="absolute bottom-12 right-12 z-10 flex gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setI(idx)} 
            className={`h-1 transition-all duration-500 ${idx === i ? 'w-12 bg-amber-500' : 'w-6 bg-white/30'} rounded-full`} 
          />
        ))}
      </div>
    </section>
  )
}

const Collections = () => {
  const { setRoute } = useShop()
  const cols = [
    { t: 'FESTIVE SILKS', s: 'Elegant ethnic styles', img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000', r: { view: 'shop', filter: { category: 'ethnic wear' } } },
    { t: 'CHIKANKARI', s: 'Traditional Lucknowi work', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000', r: { view: 'shop', filter: { gender: 'women' } } },
    { t: 'DAILY COMFORT', s: 'Everyday premium wear', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000', r: { view: 'shop', filter: { tag: 'new' } } },
  ]
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs tracking-[0.3em] text-amber-500 mb-3">◆ SHOP BY CATEGORY</p>
          <h2 className="text-huge font-display font-bold silver-text">Shop by Category</h2>
        </div>
        <button onClick={() => setRoute({ view: 'shop' })} className="hidden md:flex items-center gap-2 text-sm hover:text-amber-500 transition">View All <ArrowRight className="w-4 h-4" /></button>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {cols.map((c, i) => (
          <motion.button
            key={c.t}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
            onClick={() => setRoute(c.r)}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
          >
            <img src={c.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={c.t} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 border border-white/0 group-hover:border-blue-400/50 rounded-2xl transition" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
              <p className="text-xs tracking-[0.3em] text-blue-300 mb-2">{c.s}</p>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{c.t}</h3>
              <span className="inline-flex items-center gap-2 text-sm border-b border-white/40 pb-1 group-hover:border-blue-400 group-hover:text-blue-300 transition text-white">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

const FlashSale = () => {
  const [tl, setTl] = useState({ h: 4, m: 32, s: 18 })
  useEffect(() => {
    const t = setInterval(() => {
      setTl(({ h, m, s }) => {
        s--; if (s < 0) { s = 59; m-- }; if (m < 0) { m = 59; h-- }; if (h < 0) { h = 23 }
        return { h, m, s }
      })
    }, 1000); return () => clearInterval(t)
  }, [])
  const { setRoute } = useShop()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto glass-strong rounded-3xl overflow-hidden relative border border-blue-500/20">
        <div className="absolute inset-0 aurora opacity-40" />
        <div className="relative z-10 p-8 md:p-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-blue-400 fill-blue-400" /><span className="text-xs tracking-[0.3em] text-blue-400">FLASH DROP</span></div>
            <h2 className="text-huge font-display font-bold silver-text mb-4">UP TO 60% OFF</h2>
            <p className="text-neutral-600 mb-8 max-w-md">The Nebula flash drop ends soon. Premium oversized, silks and outerwear at once-a-year prices.</p>
            <div className="flex gap-3 mb-8">
              {[['HOURS', tl.h], ['MINUTES', tl.m], ['SECONDS', tl.s]].map(([l, v]) => (
                <div key={l} className="glass rounded-xl p-4 min-w-[80px] text-center border border-black/10">
                  <div className="text-3xl md:text-4xl font-display font-bold neon-text">{pad(v)}</div>
                  <div className="text-[10px] tracking-[0.2em] text-neutral-500 mt-1">{l}</div>
                </div>
              ))}
            </div>
            <Button onClick={() => setRoute({ view: 'shop', filter: { tag: 'sale' } })} size="lg" className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-8 h-12">Shop the Drop <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </div>
          <div className="relative aspect-square rounded-2xl overflow-hidden float">
            <img src="https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85" className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}

const TrendingSection = ({ title, tag, subtitle, category }) => {
  const { products } = useShop()
  const filtered = useMemo(() => {
    let list = products
    if (tag) {
      list = list.filter(p => p.tags.includes(tag))
    }
    if (category) {
      list = list.filter(p => p.category === category)
    }
    return list.slice(0, 8)
  }, [products, tag, category])
  return (
    <section className="py-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-amber-500 mb-3">◆ {subtitle}</p>
        <h2 className="text-huge font-display font-bold silver-text">{title}</h2>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}
      </div>
    </section>
  )
}

const Stats = () => {
  const stats = [{ n: '2M+', l: 'Happy Customers' }, { n: '500+', l: 'Cities Delivered' }, { n: '4.9★', l: 'Avg. Rating' }, { n: '15K+', l: 'Reviews' }]
  return (
    <section className="py-20 px-6 md:px-12 border-y border-black/10 relative overflow-hidden">
      <div className="aurora opacity-30" />
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {stats.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="text-5xl md:text-7xl font-display font-bold silver-text neon-text mb-2">{s.n}</div>
            <div className="text-xs tracking-[0.3em] text-neutral-500">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const Reviews = () => {
  const rs = [
    { 
      n: 'Aanya Kapoor', 
      c: 'Mumbai', 
      r: 5, 
      t: 'Absolutely obsessed with the Noor silk kurti set. The fabric feels premium, soft and incredibly comfortable. Worth every rupee.',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    { 
      n: 'Arjun Malhotra', 
      c: 'Delhi', 
      r: 5, 
      t: 'The quality of embroidery is exceptional, far better than other premium brands. The fit is perfect and packaging is lovely.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    },
    { 
      n: 'Ishita Sharma', 
      c: 'Bengaluru', 
      r: 5, 
      t: 'Velora has become my go-to brand for ethnic wear. The fuchsia kurti set is impeccable and fits beautifully.',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'
    },
  ]

  const [activeImg, setActiveImg] = useState(null)

  return (
    <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto select-none">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] text-amber-500 mb-3 font-semibold">◆ CUSTOMER REVIEWS</p>
        <h2 className="text-huge font-display font-bold silver-text">Trusted by Thousands</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {rs.map((r, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="glass p-8 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 hover:shadow-xl transition-all duration-300 group relative"
          >
            <div>
              <div className="flex gap-1 mb-6">
                {Array(r.r).fill().map((_, x) => (
                  <motion.div
                    key={x}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i * 0.15) + (x * 0.08), type: 'spring', stiffness: 200 }}
                  >
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </motion.div>
                ))}
              </div>

              <p className="text-neutral-800 font-serif-lux italic text-lg leading-relaxed mb-8">"{r.t}"</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-black/5 mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                  {r.n[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{r.n}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-neutral-500">{r.c}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                    <span className="text-[10px] text-amber-600 font-mono tracking-widest relative overflow-hidden inline-block group">
                      VERIFIED BUYER
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveImg(r.img)}
                className="w-12 h-12 rounded-xl overflow-hidden cursor-zoom-in relative group/img border border-black/5 flex-shrink-0"
              >
                <img src={r.img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white">🔍</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImg(null)}
            className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={activeImg} alt="Client Look" className="max-w-full max-h-[80vh] object-contain" />
              <button 
                onClick={() => setActiveImg(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

const TrustDrawingIcon = ({ type }) => {
  const p = {
    shipping: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.358-5.74a2.25 2.25 0 0 0-1.74-2.068l-3.35-.67a1.125 1.125 0 0 0-1.125.83l-1 3.5m-3.5 0h-1",
    returns: "M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3",
    secure: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
    quality: "M11.48 3.499c.153-.377.693-.377.846 0l2.052 5.074a.429.429 0 0 0 .343.249l5.441.455c.417.035.584.552.26.837l-4.14 3.655a.429.429 0 0 0-.131.411l1.19 5.293c.09.4-.33.705-.688.47l-4.664-3.08a.429.429 0 0 0-.476 0l-4.664 3.08c-.358.235-.778-.069-.688-.47l1.19-5.293a.429.429 0 0 0-.13-.411l-4.14-3.655c-.324-.285-.157-.802.26-.837l5.442-.455a.43.43 0 0 0 .342-.249l2.053-5.074Z"
  }
  return (
    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <motion.path 
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        d={p[type]} 
      />
    </svg>
  )
}

const Trust = () => {
  const b = [
    { type: 'shipping', t: 'Free Delivery', s: 'On orders above ₹1499' },
    { type: 'returns', t: 'Easy Returns', s: '15-day return policy' },
    { type: 'secure', t: 'Secure Payments', s: 'Cash on Delivery (COD)' },
    { type: 'quality', t: 'Premium Quality', s: 'Perfect fit & premium feel' },
  ]
  return (
    <section className="py-16 px-6 md:px-12 max-w-[1600px] mx-auto select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {b.map(({ type, t, s }, x) => (
          <motion.div 
            key={t} 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: x * 0.1 }} 
            className="glass p-6 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
              <TrustDrawingIcon type={type} />
            </div>
            <div>
              <p className="font-semibold text-sm text-neutral-900">{t}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const BrandStory = () => {
  return (
    <section className="py-28 bg-neutral-950 text-white overflow-hidden relative select-none border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(212,175,55,0.02),_transparent_45%)] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center relative z-10">
        
        <div className="space-y-8">
          <span className="text-xs font-mono tracking-[0.4em] text-neutral-400 uppercase block">◆ THE VELORA COMMITMENT</span>
          <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight silver-white leading-none">
            A Brand Built on Pure Precision
          </h2>
          
          <div className="space-y-6 text-neutral-400 font-light text-base md:text-lg leading-relaxed font-serif-lux italic">
            <p>
              "Crafted for Modern India." We believe luxury isn't about excess. It is the perfect cohesion of beautiful silhouettes, meticulous details, and local Indian artisanal soul.
            </p>
            <p>
              "Built with precision." Every stitch is meticulously measured, every silken French seam is double-checked, and every sample is wear-tested through the streets of Bengaluru.
            </p>
            <p>
              "Worn with confidence." You do not just drape Velora; you wear a vision of modern Indian fashion designed to transcend trends and outlive seasons.
            </p>
          </div>

          <div className="pt-4 flex gap-8 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            <div>
              <p className="text-white text-lg font-display">100%</p>
              <p className="mt-1">ORGANIC INDIAN FIBER</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white text-lg font-display">16</p>
              <p className="mt-1">STITCHES PER INCH</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white text-lg font-display">बेंगलुरु</p>
              <p className="mt-1">DESIGN LABS</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 relative group"
          >
            <img 
              src="https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600" 
              alt="Velora drafting" 
              className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 text-[9px] font-mono tracking-widest text-neutral-400">01 / CONCEPT DRAWS</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 relative mt-8 group"
          >
            <img 
              src="https://images.unsplash.com/photo-1631856955355-15a00bd7708c?auto=format&fit=crop&q=80&w=600" 
              alt="Velora weaving" 
              className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 text-[9px] font-mono tracking-widest text-neutral-400">02 / FIBER PRECISION</span>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

const Newsletter = () => {
  const [e, setE] = useState(''); const [ok, setOk] = useState(false)
  const sub = async () => {
    if (!e.includes('@')) return toast.error('Enter a valid email')
    await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email: e }) })
    setOk(true); toast.success('Welcome to Velora! Check your inbox.')
  }

  return (
    <section className="py-28 px-6 md:px-12 max-w-4xl mx-auto text-center relative overflow-hidden select-none">
      <motion.div 
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="mx-auto w-12 h-12 mb-6 flex items-center justify-center text-neutral-300 hover:text-amber-500 transition-colors duration-500"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </motion.div>

      <p className="text-xs tracking-[0.3em] text-amber-500 mb-3 font-semibold uppercase">◆ JOIN THE VELORA FAMILY</p>
      <h2 className="text-huge font-display font-bold silver-text mb-4">Get 10% Off Your First Order</h2>
      <p className="text-neutral-500 mb-8 max-w-lg mx-auto font-light leading-relaxed">Be the first to know about our new arrivals, special sales, and exclusive festive collections.</p>
      
      {ok ? (
        <div className="glass rounded-full px-6 py-4 inline-flex items-center gap-2 text-amber-500 border border-amber-500/20">
          <Check className="w-4 h-4" /> You're on the list
        </div>
      ) : (
        <div className="glass rounded-full p-2 flex gap-2 max-w-md mx-auto border border-black/10 focus-within:border-amber-500/40 transition-colors duration-300">
          <input 
            value={e} 
            onChange={(x) => setE(x.target.value)} 
            placeholder="your@email.com" 
            className="flex-1 bg-transparent px-4 outline-none text-sm font-light text-neutral-800 placeholder-neutral-400" 
          />
          <Button onClick={sub} className="rounded-full bg-neutral-900 text-white hover:bg-neutral-950 px-6 uppercase tracking-wider text-xs font-semibold h-10 shadow-lg relative overflow-hidden group">
            <span className="relative z-10">Subscribe</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>
      )}
    </section>
  )
}

const Footer = () => {
  const { setRoute } = useShop()
  return (
    <footer className="border-t border-black/10 mt-24 relative overflow-hidden bg-neutral-950 text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,_rgba(212,175,55,0.015),_transparent_40%)] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-20 grid md:grid-cols-4 gap-12 relative z-10">
        <div>
          <VeloraLogo size="lg" />
          <p className="text-sm text-neutral-400 mt-4 leading-relaxed font-light">
            Premium Indian & Pakistani ethnic fashion brand. Delivered across India, Pakistan, and Bangladesh.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Twitter, Facebook, Youtube].map((I, i) => (
              <button 
                key={i} 
                className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center hover:border-amber-500/50 hover:text-amber-500 text-neutral-300 transition-all duration-300"
              >
                <I className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        {[
          { t: 'Shop', l: [['Men', { view: 'shop', filter: { gender: 'men' } }], ['Women', { view: 'shop', filter: { gender: 'women' } }], ['Ethnic Wear', { view: 'shop', filter: { category: 'ethnic wear' } }], ['Oversized', { view: 'shop', filter: { category: 'oversized' } }], ['New Arrivals', { view: 'shop', filter: { tag: 'new' } }], ['Sale', { view: 'shop', filter: { tag: 'sale' } }]] },
          { t: 'Help', l: [['Contact', { view: 'contact' }], ['FAQ', { view: 'faq' }], ['Size Guide', { view: 'size-guide' }], ['Shipping', { view: 'shipping' }], ['Track Order', { view: 'track-order' }]] },
          { t: 'Company', l: [['About', { view: 'about' }], ['Privacy', { view: 'privacy' }], ['Terms', { view: 'terms' }], ['Returns', { view: 'shipping' }]] },
        ].map(c => (
          <div key={c.t}>
            <h4 className="text-xs font-semibold tracking-[0.25em] mb-6 text-neutral-300 uppercase">{c.t}</h4>
            <ul className="space-y-3">
              {c.l.map(([n, r]) => (
                <li key={n}>
                  <button 
                    onClick={() => setRoute(r)} 
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-light flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-500 scale-0 group-hover:scale-100 transition-transform duration-300" />
                    <span>{n}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 bg-black/30">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Velora. All rights reserved.</p>
          <p>Made in India · GSTIN: 29ABCDE1234F1Z5</p>
        </div>
      </div>
    </footer>
  )
}

const FaqInline = () => {
  const faqs = [
    ['How long does delivery take?', 'We deliver across India, Pakistan, and Bangladesh. Standard delivery takes 3-7 business days, and metro cities usually receive orders within 2-4 days.'],
    ['What is your return policy?', 'We offer an easy 15-day return and exchange policy. Items must be unworn and have their original tags.'],
    ['Is Cash on Delivery (COD) available?', 'Yes, Cash on Delivery is available across most postal codes for a small ₹49 handling fee.'],
    ['How do I find my size?', 'Check the "Find My Size" size assistant on any product page for a custom recommended fit.'],
    ['How can I track my order?', 'You can easily track your order using the order ID sent to your email on our Track Order page.'],
    ['Are your products high quality?', 'Every Velora piece is made with premium quality fabrics, beautiful embroidery, and is thoroughly checked for a perfect fit.'],
  ]
  return (
    <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto select-none">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-amber-500 mb-3 font-semibold uppercase">◆ HELP CENTER</p>
        <h2 className="text-huge font-display font-bold silver-text">Frequently Asked Questions</h2>
      </div>
      <div className="glass p-6 md:p-8 rounded-2xl border border-black/10">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([q, a], i) => (
            <AccordionItem value={String(i)} key={i} className="border-black/10">
              <AccordionTrigger className="text-left text-sm font-medium py-4 text-neutral-800 hover:text-amber-500">{q}</AccordionTrigger>
              <AccordionContent className="text-neutral-600 text-xs leading-relaxed pb-4">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

const AIGiftFinderModal = ({ onClose }) => {
  const { user, setRoute, toggleWishlist, wishlist, addToCart, setQuickViewProduct } = useShop()
  const [step, setStep] = useState(1)
  const [selections, setSelections] = useState({
    recipient: '',
    occasion: '',
    budget: '',
    color: '',
    style: ''
  })
  const [loadingState, setLoadingState] = useState('selection') // 'selection', 'loading', 'results'
  const [results, setResults] = useState({ products: [], greeting: '' })
  const [loadMsgIdx, setLoadMsgIdx] = useState(0)

  const LOADING_MESSAGES = [
    "Sourcing exclusive handloom fabrics...",
    "Curating designs from our active collections...",
    "Evaluating intricate embroidery and finishings...",
    "Tailoring details to your precise recipient aesthetic...",
    "Polishing selections for your private preview..."
  ]

  useEffect(() => {
    if (loadingState === 'loading') {
      const t = setInterval(() => {
        setLoadMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 1500)
      return () => clearInterval(t)
    }
  }, [loadingState])

  const STEPS = [
    {
      id: 'recipient',
      title: 'Who is the recipient?',
      subtitle: 'Select the primary recipient of this elegant gesture.',
      options: [
        { label: 'Mother', desc: 'Timeless grace and refined heritage silhouettes' },
        { label: 'Sister', desc: 'Vibrant colors, playful detailing, and modern cuts' },
        { label: 'Wife / Partner', desc: 'Exquisite silk creations and highly ornate craftsmanship' },
        { label: 'Dear Friend', desc: 'Breezy linen drapes and minimalist everyday luxury' },
        { label: 'The Bride', desc: 'Monumental designs featuring opulent fabrics and tilla' }
      ]
    },
    {
      id: 'occasion',
      title: 'What is the celebration?',
      subtitle: 'We match the fabric weight and decorative accents to the setting.',
      options: [
        { label: 'Wedding / Nikaah', desc: 'Royal mulberry silks, premium brocades, and heavy velvets' },
        { label: 'Eid Celebration', desc: 'Festive embellishments, shadow work, and rich color-ways' },
        { label: 'Festival / Diwali', desc: 'Bright, auspicious tones and metallic zari borders' },
        { label: 'Birthday / Anniversary', desc: 'Graceful, versatile classics designed for special memories' },
        { label: 'Casual Gifting', desc: 'Breathable organic cottons and lightweight linen pieces' }
      ]
    },
    {
      id: 'budget',
      title: 'Define your budget limit',
      subtitle: 'We will search our catalog to curate the ideal premium selection.',
      options: [
        { label: 'Under ₹2,000', desc: 'Refined entry luxuries and classic lightweight tunics' },
        { label: 'Under ₹3,500', desc: 'Intricate chikankari and midweight festive ensembles' },
        { label: 'Under ₹5,000', desc: 'Exquisite heavy embroidered velvet and pure silk sets' },
        { label: 'No Limit', desc: 'Our absolute finest, limited-edition masterworks' }
      ]
    },
    {
      id: 'color',
      title: 'Choose a preferred color family',
      subtitle: 'A primary aesthetic palette, or let our design catalog speak for itself.',
      options: [
        { label: 'Emerald & Teal Green', desc: 'Deep, traditional jewel tones' },
        { label: 'Royal Maroon & Crimson', desc: 'Warm, opulent, festive expressions' },
        { label: 'Sapphire & Indigo Blue', desc: 'Regal, calm, majestic visual weights' },
        { label: 'Classic Ivory & Beige', desc: 'Quiet luxury, minimal, understated grace' },
        { label: 'Void Black & Charcoal', desc: 'Modern, tailored, dramatic silhouettes' },
        { label: 'Any Color Family', desc: 'Explore all palettes for the perfect matching design' }
      ]
    },
    {
      id: 'style',
      title: 'Select a premium textile weight',
      subtitle: 'From breathable summer handlooms to rich, flowing festive fabrics.',
      options: [
        { label: 'Pure Mulberry Silk', desc: 'Luxurious sheen, radiant texture, beautiful weight' },
        { label: 'Lucknowi Georgette', desc: 'Delicate flowing drapery with ornate mirror accents' },
        { label: 'Premium Cotton-Silk', desc: 'Breezy luxury, all-day comfort, clean lines' },
        { label: 'Organic Handloom Linen', desc: 'Minimalist, organic, and clean structural silhouettes' },
        { label: 'Any Premium Fabric', desc: 'Our concierge will select the ideal textile for the occasion' }
      ]
    }
  ]

  const currentStep = STEPS[step - 1]

  const handleSelect = async (optionLabel) => {
    let val = optionLabel
    
    // Map elegant labels to standard API filters
    if (currentStep.id === 'budget') {
      if (optionLabel === 'Under ₹2,000') val = '2000'
      else if (optionLabel === 'Under ₹3,500') val = '3500'
      else if (optionLabel === 'Under ₹5,000') val = '5000'
      else val = '100000'
    }
    if (currentStep.id === 'color') {
      if (optionLabel === 'Emerald & Teal Green') val = 'Green'
      else if (optionLabel === 'Royal Maroon & Crimson') val = 'Maroon'
      else if (optionLabel === 'Sapphire & Indigo Blue') val = 'Blue'
      else if (optionLabel === 'Classic Ivory & Beige') val = 'White'
      else if (optionLabel === 'Void Black & Charcoal') val = 'Black'
      else val = 'Any'
    }
    if (currentStep.id === 'style') {
      if (optionLabel === 'Pure Mulberry Silk') val = 'Silk'
      else if (optionLabel === 'Lucknowi Georgette') val = 'Georgette'
      else if (optionLabel === 'Premium Cotton-Silk') val = 'Cotton'
      else if (optionLabel === 'Organic Handloom Linen') val = 'Linen'
      else val = 'Any'
    }
    if (currentStep.id === 'occasion') {
      if (optionLabel === 'Wedding / Nikaah') val = 'Wedding'
      else if (optionLabel === 'Eid Celebration') val = 'Eid'
      else if (optionLabel === 'Festival / Diwali') val = 'Festival'
      else if (optionLabel === 'Birthday / Anniversary') val = 'Birthday'
      else val = 'Casual Gift'
    }
    if (currentStep.id === 'recipient') {
      if (optionLabel === 'Wife / Partner') val = 'Wife'
      else if (optionLabel === 'Dear Friend') val = 'Friend'
      else if (optionLabel === 'The Bride') val = 'Bride'
      else val = optionLabel
    }

    const updatedSelections = { ...selections, [currentStep.id]: val }
    setSelections(updatedSelections)

    if (step < 5) {
      setTimeout(() => {
        setStep(prev => prev + 1)
      }, 250)
    } else {
      setLoadingState('loading')
      try {
        const res = await fetch('/api/ai/gift-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSelections)
        })
        if (res.ok) {
          const data = await res.json()
          setResults({
            products: data.products || [],
            greeting: data.greeting || ''
          })
          if (user && user.email) {
            try {
              const sessionsKey = `velora_gift_sessions_${user.email}`
              const existingSessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]')
              const newSession = {
                id: 'GFT-' + Math.floor(100000 + Math.random() * 900000),
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                timestamp: Date.now(),
                selections: updatedSelections,
                productsCount: (data.products || []).length,
                greeting: data.greeting || ''
              }
              localStorage.setItem(sessionsKey, JSON.stringify([newSession, ...existingSessions]))
            } catch (storageErr) {
              console.warn("Storage error saving gift session:", storageErr)
            }
          }
        } else {
          toast.error("Concierge service encountered an error. Please try again.")
        }
      } catch (e) {
        console.error("Failed to query gift finder:", e)
        toast.error("Connection error. Utilizing our signature boutique fallback.")
      } finally {
        setLoadingState('results')
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setSelections({
      recipient: '',
      occasion: '',
      budget: '',
      color: '',
      style: ''
    })
    setStep(1)
    setLoadingState('selection')
    setResults({ products: [], greeting: '' })
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[120] bg-white flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Left panel: Elegant Campaign Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-neutral-950 flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=1200" 
            alt="Velora Editorial Campaign" 
            className="w-full h-full object-cover opacity-35 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/50" />
        </div>
        
        <div className="relative z-10">
          <div className="font-display font-bold text-2xl tracking-wider text-white">
            <span>V</span>
            <span className="text-neutral-300">ELORA</span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-neutral-400 block mt-1">
            GIFTING CONCIERGE
          </span>
        </div>

        <div className="relative z-10 max-w-sm space-y-4">
          <p className="text-xs font-mono tracking-[0.25em] uppercase text-neutral-400">
            Couture Gifting
          </p>
          <h3 className="text-3xl font-display font-light text-white leading-tight">
            The Art of <span className="font-serif-lux italic text-neutral-100">Personal Curation</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Our virtual boutique advisor maps textile weight, handloom weaves, and design palettes against your recipient’s profile to ensure a gesture of true distinction.
          </p>
        </div>

        <div className="relative z-10 text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
          © VELORA BOUTIQUE 2026
        </div>
      </div>

      {/* Right panel: Active Interactive Area */}
      <div className="flex-1 flex flex-col bg-[#FCFBF9] overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="px-8 py-5 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-800 font-semibold">
              VELORA ASSISTANT
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-neutral-900 uppercase tracking-widest transition-colors duration-300"
          >
            <span>Close</span>
            <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
          </button>
        </div>

        {/* Dynamic Inner Body based on loadingState */}
        {loadingState === 'selection' && (
          <div className="flex-1 overflow-y-auto px-6 py-10 md:px-16 md:py-16 flex flex-col justify-between max-w-3xl mx-auto w-full">
            
            {/* Minimalist Step Progress */}
            <div className="mb-10 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 font-bold">
                Step {step.toString().padStart(2, '0')} / 05
              </span>
              <div className="w-32 h-px bg-neutral-100 relative overflow-hidden">
                <motion.div 
                  initial={{ left: "-100%" }}
                  animate={{ left: `${(step / 5) * 100 - 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 bg-neutral-950"
                />
              </div>
            </div>

            {/* Question Heading */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-light text-neutral-950 tracking-tight leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-sm text-neutral-500 font-serif-lux italic font-light mt-2">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Selection Options List */}
            <div className="space-y-3 md:space-y-4 mb-12">
              {currentStep.options.map((opt) => (
                <motion.button
                  key={opt.label}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelect(opt.label)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    selections[currentStep.id] === opt.label 
                      ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm' 
                      : 'bg-white border-neutral-200/60 text-neutral-850 hover:bg-[#FAF9F5] hover:border-neutral-400'
                  }`}
                >
                  <div className="space-y-0.5 max-w-[90%]">
                    <span className="text-xs sm:text-sm font-semibold tracking-tight block">{opt.label}</span>
                    <span className={`text-[11px] font-light leading-normal block ${selections[currentStep.id] === opt.label ? 'text-neutral-300' : 'text-neutral-500 font-serif-lux italic'}`}>
                      {opt.desc}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-50 ${selections[currentStep.id] === opt.label ? 'text-white' : 'text-neutral-400'}`} />
                </motion.button>
              ))}
            </div>

            {/* Footer Navigation */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
              {step > 1 ? (
                <button 
                  onClick={handleBack}
                  className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Previous
                </button>
              ) : (
                <div />
              )}
              
              <button 
                onClick={onClose}
                className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loadingState === 'loading' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[350px]">
            <div className="relative mb-6">
              <div className="w-10 h-10 border border-neutral-200 border-t-neutral-950 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
            </div>
            <div className="h-12 flex items-center justify-center">
              <motion.p 
                key={loadMsgIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-serif-lux italic font-light text-neutral-700 tracking-wide text-center max-w-sm"
              >
                {LOADING_MESSAGES[loadMsgIdx]}
              </motion.p>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-400 mt-4">
              VELORA DIGITAL CONCIERGE
            </p>
          </div>
        )}

        {loadingState === 'results' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Results Header */}
            <div className="text-center px-6 py-8 md:py-12 border-b border-neutral-100 bg-white shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 uppercase font-bold mb-2">
                PERSONALIZED DIERECTORY
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-light text-neutral-900 px-4 max-w-2xl mx-auto leading-relaxed">
                {results.greeting || "We curated these gorgeous recommendations for you."}
              </h3>
              <div className="w-6 h-px bg-neutral-200 my-4" />
              <p className="text-xs text-neutral-400 font-sans tracking-wide">
                Exquisite ethnic ensembles tailored exactly to your specified gift parameters.
              </p>
            </div>

            {/* Recommendations Grid Container */}
            <div className="overflow-y-auto flex-1 p-6 md:p-10 bg-[#FCFBF9]">
              {results.products.length === 0 ? (
                <div className="text-center py-16 max-w-sm mx-auto space-y-4 bg-white p-8 rounded-2xl border border-neutral-150">
                  <p className="text-neutral-500 text-xs font-serif-lux italic">No exact catalog designs match your filters. Let us reset our search variables to view our broad designer inventory.</p>
                  <button 
                    onClick={handleReset} 
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                  >
                    Reset Variables
                  </button>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                  {results.products.map((p) => {
                    const inWL = wishlist.includes(p.id)
                    return (
                      <div 
                        key={p.id} 
                        className="group bg-white border border-neutral-200/60 rounded-2xl overflow-hidden p-4 flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-neutral-300 transition-all duration-300"
                      >
                        <div>
                          {/* Image */}
                          <div 
                            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4 cursor-pointer" 
                            onClick={() => { setRoute({ view: 'product', id: p.id }); onClose(); }}
                          >
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }} 
                              className="absolute top-3 right-3 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:scale-105 transition"
                            >
                              <Heart className={`w-3.5 h-3.5 ${inWL ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
                            </button>
                          </div>

                          {/* Info */}
                          <div className="space-y-1.5 px-1">
                            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-[0.2em] font-medium block">
                              {p.category}
                            </span>
                            <h3 
                              className="text-sm font-medium text-neutral-900 leading-snug line-clamp-1 hover:underline cursor-pointer" 
                              onClick={() => { setRoute({ view: 'product', id: p.id }); onClose(); }}
                            >
                              {p.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-sm font-semibold text-neutral-950">{fmt(p.price)}</span>
                              <span className="text-xs text-neutral-400 line-through">{fmt(p.mrp)}</span>
                              <span className="text-[10px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">-{p.discount}%</span>
                            </div>

                            {/* Elegant AI Reason styled as designer concierge notes */}
                            {p.aiReason && (
                              <div className="mt-4 p-4 bg-[#FAF9F5] border border-neutral-200/50 rounded-xl text-[11.5px] text-neutral-600 leading-relaxed italic relative">
                                <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-neutral-400 font-bold block not-italic mb-1.5">
                                  CONCIERGE NOTE
                                </span>
                                "{p.aiReason}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-5 px-1 pb-1">
                          <button 
                            onClick={() => { addToCart(p, p.sizes[0], p.colors[0]); toast.success(`Added ${p.name} to cart!`) }}
                            className="flex-1 py-3 rounded-xl bg-neutral-950 text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                          </button>
                          <button 
                            onClick={() => setQuickViewProduct(p)}
                            className="px-3 py-3 rounded-xl bg-white text-neutral-800 border border-neutral-200 hover:bg-[#FAF9F5] transition-colors"
                            title="Quick View"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Stepper Footer / Result Actions */}
            <div className="px-8 py-5 border-t border-neutral-100 bg-white flex items-center justify-between">
              <button 
                onClick={handleReset}
                className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase"
              >
                Restart Personal Curation
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-neutral-950 text-white rounded-full text-[10px] font-mono tracking-widest uppercase hover:bg-neutral-850 transition-colors"
              >
                Exit Concierge
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const AIGiftFinderBanner = () => {
  const { setRoute } = useShop()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#FAF9F5] border border-neutral-200/40 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-8 md:p-16 lg:p-20"
      >
        {/* Subtle luxury background grid detail */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        {/* Left Side Content */}
        <div className="lg:col-span-6 z-10 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 bg-neutral-350"></span>
            <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-neutral-500 font-semibold">
              The Art of Giving
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-light text-neutral-950 tracking-tight leading-[1.1]">
            A Curated <br />
            <span className="font-serif-lux italic font-light text-neutral-850">Gifting Experience</span>
          </h2>

          <p className="text-sm md:text-base text-neutral-600 font-sans leading-relaxed max-w-lg">
            Our luxury digital assistant maps fabric weights, intricate weaves, and design palettes against your recipient’s profile to select the absolute perfect ensemble—wrapped meticulously in our signature linen packaging.
          </p>

          <p className="text-[10.5px] text-neutral-400 font-mono tracking-widest uppercase">
            Sourced for weddings, Eid, festivals, and milestones.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-neutral-950 text-white hover:bg-neutral-800 h-13 px-8 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Find the Perfect Gift</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setRoute({ view: 'shop' })}
              className="border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-50 h-13 px-8 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300"
            >
              <span>Browse Collection</span>
            </button>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="lg:col-span-6 relative h-[450px] md:h-[550px] w-full rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-neutral-950/5 z-10 group-hover:bg-neutral-950/0 transition-colors duration-500" />
          
          <motion.img
            initial={{ opacity: 0, scale: 1.03 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200"
            alt="Velora Luxury Coutures"
            className="w-full h-full object-cover rounded-2xl transition-transform duration-1000 group-hover:scale-[1.01]"
          />
          <div className="absolute bottom-4 right-4 bg-white/85 backdrop-blur-md border border-neutral-200/20 px-3.5 py-1.5 rounded-lg text-[9px] font-mono text-neutral-500 tracking-widest uppercase z-20 shadow-sm">
            CAMPAIGN 2026 / COUTURE GIVING
          </div>
        </div>
      </motion.div>

      {/* Modal Overlay component */}
      <AnimatePresence>
        {isOpen && <AIGiftFinderModal onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}

const HomePage = () => (
  <>
    <Hero />
    <Collections />
    <TrendingSection title="Trending Products" subtitle="TRENDING STYLES" tag="bestseller" />
    <TrendingSection title="New Arrivals" subtitle="LATEST DESIGNS" tag="new" />
    <TrendingSection title="Festive Collection" subtitle="FESTIVE SPECIALS" category="ethnic wear" />
    <TrendingSection title="Best Sellers" subtitle="MOST LOVED" tag="bestseller" />
    <Trust />
    <Reviews />
    <FaqInline />
    <Newsletter />
  </>
)

const ShopPage = () => {
  const { products, route } = useShop()
  const [gender, setGender] = useState(route.filter?.gender || 'all')
  const [category, setCategory] = useState(route.filter?.category || 'all')
  const [tag, setTag] = useState(route.filter?.tag || '')
  const [sort, setSort] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filterOpen, setFilterOpen] = useState(false)

  // AI Smart & Visual Search states
  const [searchVal, setSearchVal] = useState('')
  const [aiProducts, setAiProducts] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const [visualSearchActive, setVisualSearchActive] = useState(false)

  useEffect(() => {
    setGender(route.filter?.gender || 'all')
    setCategory(route.filter?.category || 'all')
    setTag(route.filter?.tag || '')
    // Reset AI search products on route category/tag change so user starts fresh
    setAiProducts(null)
    setAiExplanation('')
    setSearchVal('')
  }, [route])

  const handleSmartSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchVal.trim()) return
    setLoadingAi(true)
    setVisualSearchActive(false)
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: searchVal })
      }).then(r => r.json())
      setAiProducts(res.products || [])
      setAiExplanation('')
    } catch (err) {
      console.error("AI Smart Search error:", err)
      toast.error("Velora smart search is temporarily offline")
    } finally {
      setLoadingAi(false)
    }
  }

  const handleVisualSearch = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoadingAi(true)
    setVisualSearchActive(true)
    
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      try {
        const res = await fetch('/api/ai/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        }).then(r => r.json())
        setAiProducts(res.products || [])
        setAiExplanation(res.explanation || '')
        toast.success("Velora image search scan complete")
      } catch (err) {
        console.error("AI Visual Search error:", err)
        toast.error("Visual recognition is currently offline")
      } finally {
        setLoadingAi(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const clearAiSearch = () => {
    setAiProducts(null)
    setAiExplanation('')
    setSearchVal('')
    setVisualSearchActive(false)
  }

  const filtered = useMemo(() => {
    let r = aiProducts !== null ? aiProducts : products
    if (gender !== 'all') r = r.filter(p => p.gender === gender || p.gender === 'unisex')
    if (category !== 'all') r = r.filter(p => p.category === category)
    if (tag) r = r.filter(p => p.tags.includes(tag))
    r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-low') r = [...r].sort((a, b) => a.price - b.price)
    else if (sort === 'price-high') r = [...r].sort((a, b) => b.price - a.price)
    else if (sort === 'rating') r = [...r].sort((a, b) => b.rating - a.rating)
    return r
  }, [products, gender, category, tag, sort, priceRange, aiProducts])

  const Filters = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">GENDER</p>
        {['all', 'men', 'women', 'unisex'].map(g => (
          <button key={g} onClick={() => setGender(g)} className={`block w-full text-left py-2 px-3 rounded-lg text-sm capitalize ${gender === g ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-black/[0.02]'}`}>{g}</button>
        ))}
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">CATEGORY</p>
        {['all', 'ethnic wear', 'oversized', 'tops', 'bottoms', 'dresses', 'outerwear', 'Testing'].map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`block w-full text-left py-2 px-3 rounded-lg text-sm capitalize ${category === c ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-black/[0.02]'}`}>{c}</button>
        ))}
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">PRICE: {fmt(priceRange[0])} – {fmt(priceRange[1])}</p>
        <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="mt-4" />
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-neutral-500 mb-3">TAG</p>
        {['', 'new', 'bestseller', 'sale', 'limited'].map(t => (
          <button key={t || 'all'} onClick={() => setTag(t)} className={`inline-block m-1 px-3 py-1 rounded-full text-xs capitalize ${tag === t ? 'bg-blue-500 text-white' : 'glass'}`}>{t || 'all'}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">◆ THE COLLECTION</p>
        <h1 className="text-huge font-display font-bold silver-text">{tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : gender !== 'all' ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All'}</h1>
        <p className="text-neutral-500 mt-2">{filtered.length} products available</p>
      </div>

      {/* AI Smart Search & Visual Search Toolbar */}
      <div className="mb-10 max-w-xl">
        <form onSubmit={handleSmartSearch} className="flex gap-2 relative">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </span>
            <Input 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search collections with AI (e.g. 'wedding wear under ₹2000')..."
              className="pl-11 pr-24 h-12 bg-[#fcfbf9] border-black/10 rounded-full text-xs font-mono tracking-wide placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-0"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              <input 
                type="file" 
                id="shop-visual-search" 
                accept="image/*" 
                className="hidden" 
                onChange={handleVisualSearch} 
              />
              <button 
                type="button"
                onClick={() => document.getElementById('shop-visual-search').click()}
                title="AI Visual Search (Upload Photo)"
                className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition duration-300"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button 
                type="submit"
                className="bg-neutral-950 text-white rounded-full px-4 h-8 text-[9px] font-mono tracking-widest uppercase hover:bg-neutral-800 transition duration-300 font-bold"
              >
                {loadingAi ? 'Scanning...' : 'Search'}
              </button>
            </div>
          </div>
          {aiProducts !== null && (
            <button
              type="button"
              onClick={clearAiSearch}
              className="h-12 w-12 rounded-full border border-black/10 flex items-center justify-center hover:bg-neutral-100 transition duration-300"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {loadingAi && (
          <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-neutral-500 tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-950" />
            <span>Consulting VELORA search intelligence...</span>
          </div>
        )}

        {aiProducts !== null && !loadingAi && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-neutral-500">
              <span className="uppercase text-neutral-900 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {visualSearchActive ? 'AI Visual Match Results' : 'AI Smart Filter Applied'}
              </span>
              <button onClick={clearAiSearch} className="underline hover:text-neutral-900">Reset Search</button>
            </div>
            {aiExplanation && (
              <p className="bg-[#fcfbf9] border border-black/5 rounded-2xl p-4 text-xs text-neutral-600 italic font-serif-lux">
                ✨ Vera Stylist: "{aiExplanation}"
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0"><Filters /></aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 gap-4">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden glass rounded-full px-4 py-2 text-sm flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto glass rounded-full px-4 py-2 text-sm bg-transparent border-black/10 outline-none">
              <option value="featured" className="bg-white">Featured</option>
              <option value="price-low" className="bg-white">Price: Low to High</option>
              <option value="price-high" className="bg-white">Price: High to Low</option>
              <option value="rating" className="bg-white">Top Rated</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}
          </div>
          {filtered.length === 0 && <p className="text-center text-neutral-500 py-24">No products match your filters.</p>}
        </div>
      </div>
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="bg-white border-black/10"><SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader><div className="mt-6"><Filters /></div></SheetContent>
      </Sheet>
    </div>
  )
}

const ProductPage = () => {
  const { route, setRoute, addToCart, toggleWishlist, wishlist, addRecentlyViewed } = useShop()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [imgIdx, setImgIdx] = useState(0)
  const [size, setSize] = useState(''); const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [pin, setPin] = useState(''); const [pinRes, setPinRes] = useState(null)
  
  // AI Premium features states
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [reviewSummary, setReviewSummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [addedAccessories, setAddedAccessories] = useState({})

  // Zoom states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [isZoomed, setIsZoomed] = useState(false)

  // Sticky state
  const [showSticky, setShowSticky] = useState(false)
  const addToBagBtnRef = useRef(null)

  useEffect(() => {
    if (!product) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting)
    }, { threshold: 0 })

    const timer = setTimeout(() => {
      if (addToBagBtnRef.current) {
        observer.observe(addToBagBtnRef.current)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [product])

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

  useEffect(() => {
    if (!product?.id) return;
    setLoadingSummary(true)
    fetch(`/api/ai/review-summary?productId=${product.id}`)
      .then(res => res.json())
      .then(data => setReviewSummary(data))
      .catch(err => console.error("Error fetching review summary:", err))
      .finally(() => setLoadingSummary(false))
  }, [product?.id])

  useEffect(() => {
    if (!route.id) return;
    fetch(`/api/product/${route.id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP status ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d && d.product) {
          setProduct(d.product); setRelated(d.related || [])
          setSize(d.product?.sizes?.[0] || ''); setColor(d.product?.colors?.[0] || ''); setImgIdx(0)
          window.scrollTo(0, 0)
          addRecentlyViewed(d.product)
        } else {
          throw new Error('Product not found in database response');
        }
      })
      .catch(err => {
        console.error("Fetch product failed, looking in cache", err)
        try {
          const cachedProds = JSON.parse(localStorage.getItem('velora_products_cache') || '[]')
          const localProd = cachedProds.find(x => x.id === route.id)
          if (localProd) {
            setProduct(localProd)
            setRelated(cachedProds.filter(x => x.category === localProd.category && x.id !== localProd.id).slice(0, 4))
            setSize(localProd.sizes?.[0] || '')
            setColor(localProd.colors?.[0] || '')
            setImgIdx(0)
            addRecentlyViewed(localProd)
          }
        } catch(e) {}
      })
  }, [route.id])

  if (!product) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full spin-slow" /></div>
  
  const checkPin = async () => {
    try {
      const r = await fetch(`/api/pincode/${pin}`).then(x => {
        if (!x.ok) throw new Error();
        return x.json();
      });
      setPinRes(r);
    } catch (e) {
      setPinRes({ serviceable: false, message: 'Could not verify pincode' });
    }
  }

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2 flex-wrap">
        <button onClick={() => setRoute({ view: 'home' })}>Home</button><ChevronRight className="w-3 h-3" />
        <button onClick={() => setRoute({ view: 'shop' })}>Shop</button><ChevronRight className="w-3 h-3" />
        <span className="text-neutral-800">{product.name}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div 
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="aspect-[3/4] rounded-2xl overflow-hidden bg-black/[0.02] relative group cursor-zoom-in"
          >
            <img 
              src={product.images[imgIdx]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-200" 
              style={{
                transform: isZoomed ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
            />
            {product.images.length > 1 && !isZoomed && (
              <>
                <button onClick={() => setImgIdx((imgIdx - 1 + product.images.length) % product.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setImgIdx((imgIdx + 1) % product.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-strong flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
              </>
            )}
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] tracking-widest uppercase font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                🔍 Hover to Zoom Fabric
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-20 h-24 rounded-lg overflow-hidden border-2 ${imgIdx === i ? 'border-neutral-900 opacity-100' : 'border-transparent opacity-50'}`}>
                  <img src={im} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {product.badge && <span className="inline-block px-3 py-1 text-[10px] tracking-[0.2em] font-bold rounded-full glass mb-4 text-neutral-800">{product.badge}</span>}
          <h1 className="text-4xl md:text-5xl font-display font-bold silver-text mb-3">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {product.rating}</div>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-600">{product.reviews} reviews</span>
            <span className="text-neutral-500">·</span>
            <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> In stock</span>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-display font-bold">{fmt(product.price)}</span>
            <span className="text-lg text-neutral-500 line-through">{fmt(product.mrp)}</span>
            <span className="text-sm text-neutral-950 font-bold bg-neutral-100 px-2 py-0.5 rounded">-{product.discount}% OFF</span>
          </div>
          <p className="text-xs text-neutral-500 mb-8 font-mono tracking-wide">Inclusive of all taxes · Free delivery on premium orders above ₹1499</p>
          <p className="text-neutral-700 leading-relaxed mb-8 font-serif-lux text-lg italic">{product.description}</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3"><p className="text-sm font-medium uppercase tracking-wider text-neutral-500 text-xs">Color: <span className="text-neutral-900 font-semibold">{color}</span></p></div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`px-4 py-2 rounded-full text-xs font-medium border transition duration-300 uppercase tracking-wider ${color === c ? 'border-neutral-950 bg-neutral-950/5 text-neutral-950 font-bold' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium uppercase tracking-wider text-neutral-500 text-xs">Size: <span className="text-neutral-900 font-semibold">{size}</span></p>
              <button onClick={() => setShowSizeModal(true)} className="text-xs text-neutral-950 hover:text-neutral-600 font-semibold tracking-wider uppercase underline flex items-center gap-1">✨ AI Size Advisor</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-[3rem] px-4 py-2.5 rounded-lg text-xs font-bold border transition duration-300 tracking-wider ${size === s ? 'border-neutral-950 bg-neutral-950/5 text-neutral-950' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}>{s}</button>
              ))}
            </div>
          </div>

          {product.stock && product.stock <= 50 && (
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-700 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>Limited Edition: Only {product.stock} items of this silhouette remain in stock.</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <div className="glass rounded-full flex items-center border border-black/10">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-semibold text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            </div>
            <Button ref={addToBagBtnRef} onClick={() => { addToCart(product, size, color, qty); }} className="flex-1 h-12 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 transition duration-300 font-semibold tracking-widest text-xs uppercase"><ShoppingBag className="w-4 h-4 mr-2" /> Add to Bag</Button>
            <button onClick={() => toggleWishlist(product.id)} className="w-12 h-12 rounded-full glass flex items-center justify-center border border-black/10 hover:border-red-400/50">
              <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500 animate-pulse' : ''}`} />
            </button>
          </div>

          <div className="glass rounded-2xl p-5 mb-6 border border-black/10">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-neutral-800" /> Check delivery</p>
            <div className="flex gap-2">
              <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter pincode" className="bg-black/[0.02] border-black/10" maxLength={6} />
              <Button onClick={checkPin} variant="outline" className="border-black/15">Check</Button>
            </div>
            {pinRes && <p className={`text-sm mt-3 ${pinRes.serviceable ? 'text-emerald-400' : 'text-red-400'}`}>{pinRes.serviceable ? `✓ Deliverable in ${pinRes.days}-${pinRes.days + 2} days${pinRes.cod ? ' · COD available' : ''}` : '✗ Not serviceable to this pincode'}</p>}
          </div>

          <Accordion type="single" collapsible className="border-t border-black/10">
            <AccordionItem value="1" className="border-black/10"><AccordionTrigger>Material & Care</AccordionTrigger><AccordionContent className="text-neutral-600">{product.material} · Machine wash cold · Do not bleach · Iron on low heat</AccordionContent></AccordionItem>
            {product.features && (
              <AccordionItem value="features" className="border-black/10">
                <AccordionTrigger>Product Features</AccordionTrigger>
                <AccordionContent className="text-neutral-600">
                  <ul className="list-disc pl-5 space-y-1">
                    {product.features.map((f, idx) => <li key={idx}>{f}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="2" className="border-black/10"><AccordionTrigger>Shipping & Returns</AccordionTrigger><AccordionContent className="text-neutral-600">Free shipping above ₹1499. Easy 15-day return. Instant refund on prepaid orders.</AccordionContent></AccordionItem>
            <AccordionItem value="3" className="border-black/10"><AccordionTrigger>Sustainability</AccordionTrigger><AccordionContent className="text-neutral-600">Made in a certified ethical facility in Bengaluru. Recycled packaging.</AccordionContent></AccordionItem>
          </Accordion>

          {/* AI Reviews & Synthesis panel */}
          <div className="mt-8 bg-neutral-950 text-white rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold">AI Customer Feedback Summary</p>
            </div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-200 mb-2">Customer Experience Highlights</h3>
            
            {loadingSummary ? (
              <div className="space-y-2 py-2">
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
              </div>
            ) : reviewSummary ? (
              <div className="space-y-4">
                <ul className="space-y-2 text-xs text-neutral-400 font-light">
                  {reviewSummary.bullets?.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold flex-shrink-0">✦</span>
                      <span>{b.replace(/^✓\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-neutral-300 italic font-light border-t border-white/5 pt-3">
                  "{reviewSummary.summary}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 font-light">Customers highly praise this limited-run collection for its exquisite fabric, elegant design, and beautiful drape.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Complete the Look Lookbook section */}
      <div className="mt-24 border-t border-black/5 pt-20">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-neutral-600 mb-4">
            <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Styling Suggestions</span>
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tight">Complete the Look</h2>
          <p className="text-neutral-500 text-sm font-light mt-2 leading-relaxed font-serif-lux italic">
            Our AI stylist Vera has carefully selected these premium accents to perfectly complete your ethnic ensemble.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'acc-dupatta', name: 'Zari Embroidered Organza Dupatta', price: 1499, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw0fHxpbmRpYW4lMjBzYXJlZXxlbnwwfHx8fDE3ODMxMzg2NDN8MA&ixlib=rb-4.1.0&q=80&w=400', category: 'DUPATTA', color: 'Ivory Silk', size: 'One Size' },
            { id: 'acc-jewelry', name: 'Kundan Polki Jhumka Earrings', price: 1899, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBqZXdlbHJ5fGVufDB8fHx8MTc43EzODY0M3ww&ixlib=rb-4.1.0&q=80&w=400', category: 'FINE JEWELRY', color: 'Gold Polish', size: 'One Size' },
            { id: 'acc-clutch', name: 'Velvet Embellished Clutch', price: 2499, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc15aae9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBiYWd8ZW58MHx8fHwxNzgzMTM4NjQzfDA&ixlib=rb-4.1.0&q=80&w=400', category: 'HANDBAG', color: 'Void Black', size: 'One Size' },
            { id: 'acc-mojaris', name: 'Mirror-work Velvet Mojaris', price: 1999, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwzfHxzaG9lc3xlbnwwfHx8fDE3ODMxMzg2NDN8MA&ixlib=rb-4.1.0&q=80&w=400', category: 'FOOTWEAR', color: 'Champagne Gold', size: '7' }
          ].map((acc) => {
            const isAdded = addedAccessories[acc.id]
            return (
              <div key={acc.id} className="group flex flex-col bg-[#fcfbf9] border border-black/5 rounded-3xl p-3 hover:shadow-lg transition duration-500">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 mb-4 relative">
                  <img src={acc.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={acc.name} />
                  <span className="absolute top-3 left-3 bg-neutral-950 text-white text-[8px] font-mono tracking-widest px-2.5 py-1 rounded-full">{acc.category}</span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 leading-tight mb-1">{acc.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono mb-3">{fmt(acc.price)}</p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        id: acc.id,
                        name: acc.name,
                        price: acc.price,
                        images: [acc.image],
                        category: 'Accessories',
                        sizes: [acc.size],
                        colors: [acc.color]
                      }, acc.size, acc.color, 1)
                      setAddedAccessories(prev => ({ ...prev, [acc.id]: true }))
                    }}
                    disabled={isAdded}
                    className={`w-full py-2.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition duration-300 ${
                      isAdded 
                        ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' 
                        : 'bg-neutral-950 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {isAdded ? '✓ Added To Bag' : 'Add Accessory'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Size recommendation overlay modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative">
            <PremiumSizeGuide 
              product={product}
              onClose={() => setShowSizeModal(false)}
              onApplySize={(calculatedSize) => {
                setSize(calculatedSize);
                setShowSizeModal(false);
              }}
              setRoute={setRoute}
            />
          </div>
        </div>
      )}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-display font-bold mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{related.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}</div>
        </div>
      )}

      {/* Floating Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showSticky && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-4 py-3 z-40 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.06)] md:px-8"
          >
            <div className="flex items-center gap-3">
              <img src={product.images[0]} className="w-10 h-12 object-cover rounded-md" alt="" />
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 truncate max-w-[150px] md:max-w-[300px]">{product.name}</h4>
                <p className="text-xs text-neutral-500 font-bold">{fmt(product.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 mr-2">
                <span>Size: <strong>{size || 'Default'}</strong></span>
                <span>·</span>
                <span>Color: <strong>{color || 'Default'}</strong></span>
              </div>
              <Button 
                onClick={() => addToCart(product, size, color, qty)} 
                size="sm" 
                className="bg-neutral-950 text-white hover:bg-neutral-800 rounded-full text-[10px] tracking-widest uppercase font-bold px-6 py-2.5 h-auto"
              >
                Add to Bag
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CartPage = () => {
  const { cart, updateCart, removeFromCart, setRoute } = useShop()
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  // TEMPORARY TESTING PRODUCT - START
  // Calculate subtotal of other products (excluding VELORA Payment Test) for shipping logic
  const otherSubtotal = cart
    .filter(i => i.id !== 'p-payment-test' && i.slug !== 'velora-payment-test')
    .reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = (otherSubtotal > 1499 || otherSubtotal === 0) ? 0 : 99
  // TEMPORARY TESTING PRODUCT - END
  const total = subtotal + shipping

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <ShoppingBag className="w-20 h-20 text-neutral-300 mb-6" />
      <h2 className="text-3xl font-display font-bold mb-3">Your bag is empty</h2>
      <p className="text-neutral-500 mb-8">Time to add some future to your closet.</p>
      <Button onClick={() => setRoute({ view: 'shop' })} className="rounded-full bg-neutral-900 text-white h-12 px-8">Continue Shopping</Button>
    </div>
  )

  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-8">Your Bag</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((i) => (
            <div key={i.key} className="glass rounded-2xl p-4 flex gap-4 border border-black/10">
              <button onClick={() => setRoute({ view: 'product', id: i.id })} className="w-24 h-32 rounded-xl overflow-hidden bg-black/[0.02] flex-shrink-0">
                <img src={i.image} className="w-full h-full object-cover" alt="" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-neutral-500 mt-1">Size: {i.size} · Color: {i.color}</p>
                <p className="font-semibold mt-2">{fmt(i.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="glass rounded-full flex items-center border border-black/10">
                    <button onClick={() => updateCart(i.key, Math.max(1, i.qty - 1))} className="w-8 h-8 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => updateCart(i.key, i.qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeFromCart(i.key)} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-6 h-fit sticky top-24 border border-black/10">
          <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-neutral-700"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-neutral-700"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : fmt(shipping)}</span></div>
            {otherSubtotal > 0 && otherSubtotal < 1499 && <p className="text-xs text-blue-400">Add ₹{1499 - otherSubtotal} more for FREE shipping</p>}
          </div>
          <div className="border-t border-black/10 my-4" />
          <div className="flex justify-between font-bold text-lg mb-6"><span>Total</span><span className="silver-text">{fmt(total)}</span></div>
          <Button onClick={() => setRoute({ view: 'checkout' })} className="w-full h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">Checkout <ArrowRight className="ml-2 w-4 h-4" /></Button>
          <div className="flex items-center justify-center gap-3 mt-4 text-neutral-500 text-xs"><Shield className="w-3.5 h-3.5" /> Secure checkout · SSL encrypted</div>
        </div>
      </div>
    </div>
  )
}

const WishlistPage = () => {
  const { products, wishlist, setRoute } = useShop()
  const items = products.filter(p => wishlist.includes(p.id))
  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <Heart className="w-20 h-20 text-neutral-300 mb-6" />
      <h2 className="text-3xl font-display font-bold mb-3">Your wishlist is empty</h2>
      <p className="text-neutral-500 mb-8">Save your favorites and revisit them anytime.</p>
      <Button onClick={() => setRoute({ view: 'shop' })} className="rounded-full bg-neutral-900 text-white h-12 px-8">Discover</Button>
    </div>
  )
  return (
    <div className="pt-8 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-8">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{items.map((p, i) => <ProductCard key={p.id} p={p} idx={i} />)}</div>
    </div>
  )
}

/* ============================== PAYMENT SUCCESS DIALOG ============================== */
const PaymentSuccessDialog = ({ order, onClose }) => {
  const { setRoute } = useShop()
  const [confetti, setConfetti] = useState(false)
  useEffect(() => { if (order) setTimeout(() => setConfetti(true), 200) }, [order])
  if (!order) return null

  const trackAndClose = () => { onClose(); setRoute({ view: 'track-order', orderId: order.id }) }
  const shopAndClose = () => { onClose(); setRoute({ view: 'home' }) }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Confetti dots */}
          {confetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => {
                const colors = ['bg-blue-500','bg-indigo-500','bg-purple-500','bg-emerald-500','bg-amber-400','bg-rose-400']
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: -30, x: `${(i * 17) % 100}%`, rotate: 0 }}
                    animate={{ opacity: 0, y: 700, rotate: 720 }}
                    transition={{ duration: 3 + (i % 5) * 0.4, ease: 'easeOut', delay: (i % 10) * 0.05 }}
                    className={`absolute w-2 h-3 rounded-sm ${colors[i % colors.length]}`}
                  />
                )
              })}
            </div>
          )}

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -15, 15, 0] }} transition={{ duration: 0.7, type: 'spring' }}
              className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center mb-4"
            >
              <Check className="w-14 h-14 text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-3xl font-display font-bold mb-1">Order Successfully Placed!</h2>
            <p className="text-white/90 text-sm">Thank you for shopping with Velora ✨</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">ORDER ID</p>
                <p className="font-mono text-sm font-bold text-blue-600 truncate">{order.id}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">AMOUNT PAID</p>
                <p className="font-display text-lg font-bold silver-text">{fmt(order.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">PAYMENT</p>
                <p className="text-sm font-semibold">{(order.payment || '').toUpperCase()} <span className="text-emerald-600 ml-1">✓ Verified</span></p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mb-1">DELIVERY BY</p>
                <p className="text-sm font-semibold">{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">Confirmation sent to <b>{order.email}</b>. You'll receive tracking updates via email and SMS.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={trackAndClose} className="flex-1 h-12 rounded-full bg-neutral-900 text-white hover:bg-blue-600">
                <Package className="w-4 h-4 mr-2" /> Track Order
              </Button>
              <Button onClick={shopAndClose} variant="outline" className="flex-1 h-12 rounded-full border-black/15">
                Continue Shopping
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const CheckoutPage = () => {
  const { cart, setRoute, clearCart, user, updateCart, removeFromCart } = useShop()
  const [step, setStep] = useState(1)
  
  // Premium Saved Addresses state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      name: user?.name || 'Aarav Sharma',
      email: user?.email || 'aarav.sharma@gmail.com',
      phone: '9876543210',
      line1: 'Flat 402, Sunset Vista, 12th Main Road',
      line2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true
    },
    {
      id: 'addr-2',
      name: user?.name ? `${user.name} (Office)` : 'Isha Patel',
      email: user?.email || 'isha.patel@gmail.com',
      phone: '9123456789',
      line1: '15, Sea Breeze Heights, Marine Drive',
      line2: 'Backbay Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: false
    }
  ])
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  
  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    gst: ''
  })

  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeMessage, setPincodeMessage] = useState('')
  const [coupon, setCoupon] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('velora_offline_reward_coupon') || ''
      }
    } catch(e) {}
    return ''
  })
  const [applied, setApplied] = useState(null)
  const [payment, setPayment] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)

  // Memoized checkout pricing
  const subtotal = useMemo(() => {
    return cart.reduce((s, i) => s + i.price * i.qty, 0)
  }, [cart])

  // TEMPORARY TESTING PRODUCT - START
  const otherSubtotal = useMemo(() => {
    return cart
      .filter(i => i.id !== 'p-payment-test' && i.slug !== 'velora-payment-test')
      .reduce((s, i) => s + i.price * i.qty, 0)
  }, [cart])

  const shipping = useMemo(() => {
    return (otherSubtotal > 1499 || otherSubtotal === 0) ? 0 : 99
  }, [otherSubtotal])
  // TEMPORARY TESTING PRODUCT - END

  const discount = useMemo(() => {
    return applied?.discount || 0
  }, [applied])

  const total = useMemo(() => {
    return subtotal + shipping - discount
  }, [subtotal, shipping, discount])

  const activeAddress = useMemo(() => {
    if (selectedAddressId === 'new') {
      return form
    }
    return addresses.find(a => a.id === selectedAddressId) || form
  }, [selectedAddressId, addresses, form])

  const canProceed = useMemo(() => {
    if (step === 1) {
      return (
        activeAddress.name &&
        activeAddress.email &&
        activeAddress.phone &&
        activeAddress.phone.length >= 10 &&
        activeAddress.line1 &&
        activeAddress.city &&
        activeAddress.state &&
        activeAddress.pincode &&
        activeAddress.pincode.length === 6
      )
    }
    return true
  }, [step, activeAddress])

  // Automatically apply offline reward coupon on mount / reconnection
  useEffect(() => {
    if (coupon && !applied) {
      const autoApply = async () => {
        try {
          const r = await fetch('/api/coupon', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: coupon, subtotal }) 
          }).then(x => x.json())
          
          if (!r.error) {
            setApplied(r)
            toast.success(`✨ Runway Reward Applied: ${r.label}!`)
          }
        } catch (e) {
          console.log("Awaiting connection to validate Stylist Reward...", e)
        }
      }
      autoApply()
    }
  }, [coupon, applied, subtotal])

  // Auto-fill City & State on 6-digit Pincode input
  useEffect(() => {
    const pin = form.pincode
    if (pin && pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true)
      const timer = setTimeout(() => {
        setPincodeLoading(false)
        if (pin.startsWith('560')) {
          setForm(f => ({ ...f, city: 'Bengaluru', state: 'Karnataka' }))
          setPincodeMessage('Bengaluru, Karnataka')
        } else if (pin.startsWith('400')) {
          setForm(f => ({ ...f, city: 'Mumbai', state: 'Maharashtra' }))
          setPincodeMessage('Mumbai, Maharashtra')
        } else if (pin.startsWith('110')) {
          setForm(f => ({ ...f, city: 'New Delhi', state: 'Delhi' }))
          setPincodeMessage('New Delhi, Delhi')
        } else if (pin.startsWith('600')) {
          setForm(f => ({ ...f, city: 'Chennai', state: 'Tamil Nadu' }))
          setPincodeMessage('Chennai, Tamil Nadu')
        } else if (pin.startsWith('700')) {
          setForm(f => ({ ...f, city: 'Kolkata', state: 'West Bengal' }))
          setPincodeMessage('Kolkata, West Bengal')
        } else if (pin.startsWith('500')) {
          setForm(f => ({ ...f, city: 'Hyderabad', state: 'Telangana' }))
          setPincodeMessage('Hyderabad, Telangana')
        } else {
          setPincodeMessage('Verified')
        }
      }, 400)
      return () => clearTimeout(timer)
    } else {
      setPincodeMessage('')
    }
  }, [form.pincode])

  const applyCoupon = async () => {
    try {
      const res = await fetch('/api/coupon', { method: 'POST', body: JSON.stringify({ code: coupon, subtotal }) });
      const r = await res.json().catch(() => ({ error: 'Unable to parse server response' }));
      if (r.error) return toast.error(r.error)
      setApplied(r); toast.success(`${r.label} applied!`)
    } catch (e) {
      toast.error('Could not apply coupon');
    }
  }

  const handleEditAddress = (addr, e) => {
    e.stopPropagation()
    setEditingAddressId(addr.id)
    setForm({
      name: addr.name,
      email: addr.email,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      gst: addr.gst || ''
    })
    setSelectedAddressId('new')
    setIsAddingNew(true)
  }

  const handleDeleteAddress = (id, e) => {
    e.stopPropagation()
    setAddresses(prev => prev.filter(a => a.id !== id))
    if (selectedAddressId === id) {
      setSelectedAddressId('new')
    }
    toast.success('Address deleted')
  }

  const handleSaveAddress = () => {
    if (!form.name) return toast.error('Full name is required')
    if (!form.email || !form.email.includes('@')) return toast.error('Valid email is required')
    if (!form.phone || form.phone.length < 10) return toast.error('Valid phone number (min 10 digits) is required')
    if (!form.line1) return toast.error('Address Line 1 is required')
    if (!form.city) return toast.error('City is required')
    if (!form.state) return toast.error('State is required')
    if (!form.pincode || form.pincode.length !== 6) return toast.error('Pincode must be exactly 6 digits')

    if (editingAddressId) {
      setAddresses(prev => prev.map(a => a.id === editingAddressId ? { ...a, ...form } : a))
      setSelectedAddressId(editingAddressId)
      toast.success('Address updated')
    } else {
      const newId = 'addr-' + Date.now()
      const newAddr = {
        id: newId,
        ...form,
        isDefault: addresses.length === 0
      }
      setAddresses(prev => [...prev, newAddr])
      setSelectedAddressId(newId)
      toast.success('New address added')
    }
    setIsAddingNew(false)
    setEditingAddressId(null)
  }

  const placeRazorpayOrder = async () => {
    setPlacing(true);

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      const data = await orderRes.json();

      if (!data.success) {
        setPlacing(false);
        return toast.error(data.error || "Unable to create Razorpay order");
      }

      const orderPayload = {
        items: cart,
        address: activeAddress,
        email: activeAddress.email,
        name: activeAddress.name,
        phone: activeAddress.phone,
        payment: "razorpay",
        coupon: applied?.code || null,
        subtotal,
        shipping,
        discount,
        total,
      };

      await openRazorpayCheckout({
        order: data,
        prefill: {
          name: activeAddress.name,
          email: activeAddress.email,
          contact: activeAddress.phone,
        },
        description: "Velora Luxury Order",
        orderPayload,
        onVerified: (verifiedData) => {
          toast.success("Payment Successful");
          clearCart();
          setSuccessOrder(verifiedData.order);
          setPlacing(false);
        },
        onDismiss: () => {
          setPlacing(false);
        }
      });

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setPlacing(false);
    }
  };

  const placeOrder = async () => {
    if (payment === "razorpay") {
      return await placeRazorpayOrder();
    }

    setPlacing(true);

    const body = {
      items: cart,
      address: activeAddress,
      email: activeAddress.email,
      name: activeAddress.name,
      phone: activeAddress.phone,
      payment,
      coupon: applied?.code,
      subtotal,
      shipping,
      discount,
      total,
    };

    const r = await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }).then((x) => x.json());

    setPlacing(false);

    if (r.error) return toast.error(r.error);

    clearCart();
    setSuccessOrder(r.order);
  };

  useEffect(() => { if (cart.length === 0 && !successOrder) setRoute({ view: 'cart' }) }, [cart, successOrder])

  const shouldRender = cart.length > 0 || successOrder;

  return (
    <>
      {!shouldRender ? null : (
        <div className="pt-8 pb-24 px-4 md:px-12 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-black/5">
        <div>
          <h1 className="text-huge font-display font-bold silver-text mb-1">Secure Checkout</h1>
          <p className="text-sm text-neutral-500">Every connection is encrypted with industrial 256-bit SSL protocols.</p>
        </div>
        <div className="flex items-center gap-3 text-sm mt-4 md:mt-0 flex-wrap">
          {['Delivery Address', 'Payment Method', 'Review & Pay'].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <button 
                disabled={i + 1 > step && !canProceed}
                onClick={() => setStep(i + 1)}
                className={`flex items-center gap-2 transition text-xs tracking-wider uppercase font-semibold ${step === i + 1 ? 'text-blue-500 font-bold' : 'text-neutral-400 hover:text-neutral-600 disabled:opacity-40'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${step === i + 1 ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20' : 'border-neutral-300'}`}>
                  {step > i + 1 ? <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} /> : i + 1}
                </div>
                <span>{s}</span>
              </button>
              {i < 2 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Columns */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-display font-bold text-neutral-900">Select Delivery Address</h2>
                  {!isAddingNew && (
                    <Button 
                      onClick={() => {
                        setEditingAddressId(null)
                        setForm({ name: '', email: user?.email || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', gst: '' })
                        setSelectedAddressId('new')
                        setIsAddingNew(true)
                      }}
                      variant="outline" 
                      className="rounded-full border-black/10 text-xs h-9 px-4 hover:bg-neutral-50"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add New
                    </Button>
                  )}
                </div>

                {/* Grid of Address Cards */}
                {!isAddingNew ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 border text-left flex flex-col justify-between h-[180px] ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50/20 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/30' 
                              : 'border-black/10 hover:border-black/20 bg-white shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm text-neutral-900">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] tracking-wider uppercase font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 line-clamp-2 mb-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-xs text-neutral-500 mb-2">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-2">
                            <span className="text-xs text-neutral-400 font-mono">{addr.phone}</span>
                            <div className="flex gap-3 text-xs">
                              <button 
                                onClick={(e) => handleEditAddress(addr, e)} 
                                className="text-blue-500 hover:text-blue-600 font-semibold"
                              >
                                Edit
                              </button>
                              {!addr.isDefault && (
                                <button 
                                  onClick={(e) => handleDeleteAddress(addr.id, e)} 
                                  className="text-red-400 hover:text-red-500 font-semibold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Selected Check Indicator */}
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {/* Dashed Add Card */}
                    <div 
                      onClick={() => {
                        setEditingAddressId(null)
                        setForm({ name: '', email: user?.email || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', gst: '' })
                        setSelectedAddressId('new')
                        setIsAddingNew(true)
                      }}
                      className="border-2 border-dashed border-black/10 hover:border-black/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[180px] cursor-pointer transition hover:bg-neutral-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5 text-neutral-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700">Add New Shipping Address</p>
                      <p className="text-xs text-neutral-400 mt-1">For delivery anywhere in India</p>
                    </div>
                  </div>
                ) : (
                  // Address Form Slide-In
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-3xl p-6 border border-black/10 space-y-4 shadow-xl"
                  >
                    <h3 className="font-display font-semibold text-lg text-neutral-900">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Shipping Address'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Full Name *</label>
                        <Input placeholder="e.g. Shayan Akhtar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Email Address *</label>
                        <Input placeholder="e.g. shayan@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Mobile Number *</label>
                        <Input placeholder="10-digit mobile number" value={form.phone} maxLength={12} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Pincode (Auto-fills City/State) *</label>
                        <div className="relative">
                          <Input placeholder="6-digit PIN code" value={form.pincode} maxLength={6} onChange={e => setForm({ ...form, pincode: e.target.value })} className="bg-black/[0.02] border-black/10 h-11 pr-10" />
                          {pincodeLoading && (
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400 absolute right-3 top-3.5" />
                          )}
                          {pincodeMessage && !pincodeLoading && (
                            <span className="absolute right-3 top-3.5 text-xs text-emerald-600 font-medium">✓ {pincodeMessage}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Street Address (Line 1) *</label>
                      <Input placeholder="House/Flat No, Building Name, Street Name" value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">Landmark / Locality (Line 2)</label>
                      <Input placeholder="Area, Landmark, Colony, Suite" value={form.line2} onChange={e => setForm({ ...form, line2: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">City *</label>
                        <Input placeholder="Bengaluru" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">State *</label>
                        <Input placeholder="Karnataka" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1 block">GSTIN for Business Invoice (Optional)</label>
                      <Input placeholder="29XXXXX0000X0Z0" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} className="bg-black/[0.02] border-black/10 h-11" />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-black/5">
                      <Button 
                        onClick={() => {
                          setIsAddingNew(false)
                          setEditingAddressId(null)
                          setSelectedAddressId('addr-1')
                        }} 
                        variant="outline" 
                        className="rounded-full border-black/10 h-11 px-6 hover:bg-neutral-50 text-neutral-600"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveAddress} 
                        className="rounded-full bg-blue-500 text-white hover:bg-blue-400 h-11 px-8 shadow-lg shadow-blue-500/10"
                      >
                        Save & Use Address
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-display font-bold text-neutral-900 mb-2">Select Payment Method</h2>
                <div className="glass rounded-3xl p-6 border border-black/10 space-y-3 shadow-sm bg-white">
                  {[
                    {
                      v: "razorpay",
                      l: "Online Payments",
                      s: "UPI, Credit/Debit Cards, Net Banking, and Wallets",
                      badge: "Razorpay Secure",
                      icon: CreditCard,
                    },
                    {
                      v: "cod",
                      l: "Cash on Delivery",
                      s: "Pay with Cash or UPI upon physical package delivery",
                      badge: "₹49 handling fee",
                      icon: Package,
                    },
                  ].map((o) => {
                    const isSelected = payment === o.v
                    return (
                      <button
                        key={o.v}
                        onClick={() => setPayment(o.v)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-300 relative ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30"
                            : "border-black/10 hover:border-black/20 bg-white"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-500/10 text-blue-500' : 'bg-black/[0.03] text-neutral-500'
                        }`}>
                          <o.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-neutral-900 text-sm md:text-base">{o.l}</span>
                            <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full border border-black/5">
                              {o.badge}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500">{o.s}</p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-black/20"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex items-center gap-2 px-2 text-xs text-neutral-500">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Payments are processed with 256-bit encryption. We never save card details.</span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-display font-bold text-neutral-900">Review Items & Bag</h2>
                  <button onClick={() => setRoute({ view: 'cart' })} className="text-xs text-blue-500 hover:underline font-semibold">Modify Cart</button>
                </div>

                <div className="glass rounded-3xl p-6 border border-black/10 space-y-4 bg-white shadow-sm">
                  {cart.map((item) => (
                    <div key={item.key} className="flex gap-4 items-center pb-4 last:pb-0 border-b border-black/5 last:border-0">
                      <img src={item.image} className="w-16 h-20 rounded-xl object-cover border border-black/5 flex-shrink-0" alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500 mb-2">{item.size} · {item.color}</p>
                        
                        {/* Premium Inline Quantity Editor */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-black/10 rounded-full h-8 overflow-hidden bg-black/[0.01]">
                            <button 
                              onClick={() => {
                                if (item.qty > 1) {
                                  updateCart(item.key, item.qty - 1)
                                } else {
                                  removeFromCart(item.key)
                                  toast.success('Item removed')
                                }
                              }} 
                              className="w-8 h-full flex items-center justify-center hover:bg-black/[0.05] transition"
                            >
                              <Minus className="w-3 h-3 text-neutral-600" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-neutral-800">{item.qty}</span>
                            <button 
                              onClick={() => updateCart(item.key, item.qty + 1)} 
                              className="w-8 h-full flex items-center justify-center hover:bg-black/[0.05] transition"
                            >
                              <Plus className="w-3 h-3 text-neutral-600" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => {
                              removeFromCart(item.key)
                              toast.success('Item removed')
                            }} 
                            className="text-xs text-red-400 hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-sm text-neutral-900">{fmt(item.price * item.qty)}</p>
                        <p className="text-[10px] text-neutral-400">{item.qty} × {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery details briefing */}
                <div className="glass rounded-3xl p-5 border border-black/5 bg-neutral-50/50 grid md:grid-cols-2 gap-4">
                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Delivering To</p>
                    <p className="font-semibold text-neutral-800">{activeAddress.name}</p>
                    <p className="text-neutral-500 line-clamp-1">{activeAddress.line1}, {activeAddress.city}</p>
                    <p className="text-neutral-500">{activeAddress.state} - {activeAddress.pincode}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-1">Payment Selection</p>
                    <p className="font-semibold text-neutral-800">
                      {payment === 'razorpay' ? 'Secure Credit/Debit/UPI (Razorpay)' : 'Cash on Delivery (COD)'}
                    </p>
                    <p className="text-neutral-500 mt-1">Est. Delivery: 4-6 Days (Pan-India Express)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Buttons (Back / Forward) */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button 
                onClick={() => setStep(step - 1)} 
                variant="outline" 
                className="rounded-full border-black/15 h-12 px-6"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button 
                disabled={!canProceed} 
                onClick={() => setStep(step + 1)} 
                className="rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white ml-auto h-12 px-8 shadow-lg transition"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button 
                disabled={placing} 
                onClick={placeOrder} 
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white ml-auto h-12 px-10 shadow-lg shadow-blue-500/10 font-bold tracking-wide"
              >
                {placing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing Secure Order...
                  </span>
                ) : payment === 'razorpay' ? (
                  `Pay Securely · ${fmt(total)}`
                ) : (
                  `Confirm COD Order · ${fmt(total)}`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Sidebar Column */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-black/10 sticky top-24 bg-white/70 shadow-lg backdrop-blur space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-900">Order Summary</h3>
              <p className="text-xs text-neutral-400">Indian Rupee pricing inclusive of taxes.</p>
            </div>

            {/* Coupons inside Sidebar */}
            <div className="space-y-2">
              <div className="flex gap-2 p-1.5 border border-black/10 rounded-full bg-black/[0.01]">
                <input 
                  value={coupon} 
                  onChange={e => setCoupon(e.target.value)} 
                  placeholder="Promo Code" 
                  className="flex-1 bg-transparent px-3 outline-none text-xs" 
                />
                <button 
                  onClick={applyCoupon} 
                  className="bg-neutral-900 hover:bg-blue-500 text-white rounded-full text-xs font-semibold px-4 py-2 transition"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 px-1">
                Try: <span className="font-mono bg-neutral-100 px-1 rounded">VELORA10</span>, <span className="font-mono bg-neutral-100 px-1 rounded">FUTURE20</span>
              </p>
              {applied && (
                <div className="text-[11px] bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl flex items-center justify-between border border-emerald-200">
                  <span className="font-medium">Coupon Applied: {applied.code}</span>
                  <button onClick={() => setApplied(null)} className="underline font-bold text-red-500 ml-2">Remove</button>
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="space-y-3 pt-3 border-t border-black/5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((s,i)=>s+i.qty, 0)} items)</span>
                <span className="font-medium text-neutral-900">{fmt(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-medium text-neutral-900">{fmt(shipping)}</span>
                )}
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({applied?.code})</span>
                  <span>-{fmt(discount)}</span>
                </div>
              )}

              {payment === 'cod' && (
                <div className="flex justify-between text-amber-700">
                  <span>COD Handling Fee</span>
                  <span>+₹49</span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>GST (18% Included)</span>
                <span>{fmt(Math.round((total - (payment === 'cod' ? 49 : 0)) * 0.18))}</span>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-neutral-800">Grand Total</span>
                <span className="text-2xl font-display font-bold silver-text text-blue-600">
                  {fmt(total + (payment === 'cod' ? 49 : 0))}
                </span>
              </div>
            </div>

            {/* Trust assurances block */}
            <div className="pt-4 border-t border-black/5 space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">100% Buyer Protection</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Secure payments with instant support</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-500">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">Easy 15-Day Returns</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">No-questions-asked refunds & sizes swap</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-600">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-500">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-semibold text-neutral-900 leading-none">Express Tracked Shipping</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5">Fulfilled by BlueDart, Delhivery & Bluedart</p>
                </div>
              </div>
            </div>

            {/* Payment Secure Badge */}
            <div className="p-3 bg-neutral-50 rounded-2xl border border-black/5 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Razorpay Secured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Mobile Bar */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-black/10 flex items-center justify-between md:hidden z-40">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Grand Total</p>
            <p className="text-xl font-bold font-display silver-text text-blue-600">
              {fmt(total + (payment === 'cod' ? 49 : 0))}
            </p>
          </div>
          <Button 
            disabled={placing} 
            onClick={placeOrder} 
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6 h-11 text-sm font-bold shadow-lg"
          >
            {placing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : payment === 'razorpay' ? (
              'Pay Securely'
            ) : (
              'Confirm Order'
            )}
          </Button>
        </div>
      )}

      <PaymentSuccessDialog order={successOrder} onClose={() => setSuccessOrder(null)} />
        </div>
      )}
    </>
  )
}

const OrderSuccessPage = () => {
  const { route, setRoute } = useShop()
  const order = route.order
  const shouldRender = !!order
  return (
    <>
      {!shouldRender ? null : (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
          <div className="max-w-2xl w-full">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.7 }} className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
              <Check className="w-12 h-12 text-blue-400" />
            </motion.div>
            <h1 className="text-huge font-display font-bold silver-text text-center mb-3">Order Confirmed</h1>
            <p className="text-neutral-600 text-center mb-8">Your future is on its way. Confirmation sent to <b className="text-neutral-900">{order.email}</b></p>
            <div className="glass rounded-2xl p-6 border border-black/10 space-y-4">
              <div className="flex justify-between"><span className="text-neutral-600">Order ID</span><span className="font-mono text-blue-400">{order.id}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Amount</span><span className="font-bold">{fmt(order.total)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Payment</span><span>{order.payment?.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Estimated Delivery</span><span>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</span></div>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button onClick={() => setRoute({ view: 'track-order', orderId: order.id })} className="flex-1 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white h-12">Track Order</Button>
              <Button onClick={() => setRoute({ view: 'home' })} variant="outline" className="flex-1 rounded-full border-black/15 h-12">Continue Shopping</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const TrackOrderPage = () => {
  const { route } = useShop()
  const [orderId, setOrderId] = useState(route.orderId || '')
  const [order, setOrder] = useState(null)
  const track = async (id) => {
    const useId = id || orderId
    if (!useId) return
    try {
      const res = await fetch(`/api/order/${useId}`);
      const r = await res.json().catch(() => ({ error: 'Order not found' }));
      if (r.error) return toast.error('Order not found')
      setOrder(r.order)
    } catch (e) {
      toast.error('Order not found')
    }
  }
  useEffect(() => { if (route.orderId) track(route.orderId) }, [route.orderId])
  return (
    <div className="pt-12 pb-20 px-6 md:px-12 max-w-3xl mx-auto">
      <h1 className="text-huge font-display font-bold silver-text mb-2">Track Order</h1>
      <p className="text-neutral-500 mb-8">Enter your order ID to check status</p>
      <div className="glass rounded-full p-2 flex gap-2 border border-black/10 mb-8">
        <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g. VEL..." className="flex-1 bg-transparent px-4 outline-none" />
        <Button onClick={() => track()} className="rounded-full bg-neutral-900 text-white">Track</Button>
      </div>
      {order && (
        <div className="glass rounded-2xl p-6 border border-black/10">
          <div className="flex justify-between mb-6">
            <div><p className="text-xs text-neutral-500">ORDER</p><p className="font-mono">{order.id}</p></div>
            <div className="text-right"><p className="text-xs text-neutral-500">TOTAL</p><p className="font-bold">{fmt(order.total)}</p></div>
          </div>
          <div className="space-y-0">
            {order.tracking.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.at ? 'bg-blue-500' : 'bg-black/5'}`}>{t.at ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4 text-neutral-500" />}</div>
                  {i < order.tracking.length - 1 && <div className={`w-px flex-1 ${t.at ? 'bg-blue-500' : 'bg-black/5'}`} />}
                </div>
                <div className="flex-1 pb-6">
                  <p className={`font-medium ${t.at ? 'text-neutral-900' : 'text-neutral-500'}`}>{t.label}</p>
                  {t.at && <p className="text-xs text-neutral-500 mt-1">{new Date(t.at).toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const AuthPage = () => {
  return <PremiumAuth useShop={useShop} />
}

const AccountPage = () => {
  return <PremiumAccount useShop={useShop} />
}

const StaticPage = ({ title, subtitle, children }) => (
  <div className="pt-8 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
    <p className="text-xs tracking-[0.3em] text-blue-400 mb-3">◆ {subtitle}</p>
    <h1 className="text-huge font-display font-bold silver-text mb-8">{title}</h1>
    <div className="text-neutral-700 leading-relaxed space-y-4">{children}</div>
  </div>
)

const AboutPage = () => (
  <StaticPage title="Our Story" subtitle="ABOUT VELORA">
    <p className="text-2xl font-serif-lux italic text-neutral-900">"Velora exists at the intersection of Indian craftsmanship and modern design."</p>
    <p>Founded in 2024 in Bengaluru, Velora is India's next-generation luxury fashion house. We design for the modern individual — those who refuse to compromise between artistry, sustainability and premium silhouettes.</p>
    <p>Every piece is engineered in our Bengaluru facility using premium fabrics, ethical manufacturing partners, and obsessive attention to construction. From our signature 480 GSM oversized hoodies to our bias-cut mulberry silk slip dresses, each garment is designed to last generations.</p>
    <div className="grid grid-cols-3 gap-6 my-12">
      {[{ n: '2M+', l: 'CUSTOMERS' }, { n: '48', l: 'CITIES' }, { n: '100%', l: 'ETHICAL' }].map(x => (
        <div key={x.l} className="glass rounded-2xl p-6 border border-black/10 text-center"><p className="text-5xl font-display font-bold silver-text neon-text">{x.n}</p><p className="text-xs tracking-[0.3em] text-neutral-500 mt-2">{x.l}</p></div>
      ))}
    </div>
    <h2 className="text-2xl font-display font-bold text-neutral-900">Our Values</h2>
    <ul className="list-disc list-inside space-y-2">
      <li><b className="text-neutral-900">Craftsmanship:</b> Every stitch matters.</li>
      <li><b className="text-neutral-900">Sustainability:</b> Recycled materials, ethical wages.</li>
      <li><b className="text-neutral-900">Innovation:</b> Blending traditional textile mastery with modern design.</li>
      <li><b className="text-neutral-900">Community:</b> Building the future of Indian fashion together.</li>
    </ul>
  </StaticPage>
)

const ContactPage = () => {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const send = async () => {
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(f) })
    setSent(true); toast.success('Message sent. We\'ll respond within 24h.')
  }
  return (
    <StaticPage title="Get in Touch" subtitle="CONTACT US">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">EMAIL</p><p className="font-medium">hello@velora.in</p></div>
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">SUPPORT</p><p className="font-medium">+91 80 4000 5000</p><p className="text-xs text-neutral-500 mt-1">Mon-Sat, 10 AM to 8 PM IST</p></div>
          <div className="glass p-6 rounded-2xl border border-black/10"><p className="text-xs text-neutral-500 mb-2">HEADQUARTERS</p><p className="font-medium">Velora HQ, Indiranagar<br />Bengaluru 560038, India</p></div>
        </div>
        <div className="glass rounded-2xl p-6 border border-black/10 space-y-3">
          {sent ? <div className="text-center py-12"><Check className="w-16 h-16 text-neutral-900 mx-auto mb-4" /><p>We got your message</p></div> : <>
            <Input placeholder="Your name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Input placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Textarea placeholder="Message" rows={5} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} className="bg-black/[0.02] border-black/10" />
            <Button onClick={send} className="w-full rounded-full bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white">Send Message</Button>
          </>}
        </div>
      </div>
    </StaticPage>
  )
}

const FaqPage = () => {
  const faqs = [
    ['How long does delivery take?', 'Standard delivery within 3-7 business days across India. Metro cities usually receive orders in 2-4 days.'],
    ['What is your return policy?', 'Easy 15-day return from date of delivery. Items must be unused with tags. Instant refund for prepaid orders.'],
    ['Do you ship internationally?', 'We currently ship pan-India. International shipping coming Q1 2026.'],
    ['How do I know my size?', 'Check our detailed size guide on every product page. Our sizing runs slightly oversized — refer to the fit note.'],
    ['Is COD available?', 'Yes, Cash on Delivery is available for most pincodes in India with a small ₹49 handling fee.'],
    ['How can I track my order?', 'Use the order ID sent to your email on our Track Order page, or check your account dashboard.'],
    ['Are your products authentic?', 'Every Velora piece is designed and manufactured in-house at our Bengaluru facility. 100% authentic, always.'],
  ]
  return (
    <StaticPage title="Frequently Asked" subtitle="HELP CENTER">
      <Accordion type="single" collapsible>
        {faqs.map(([q, a], i) => <AccordionItem value={String(i)} key={i} className="border-black/10"><AccordionTrigger className="text-left">{q}</AccordionTrigger><AccordionContent className="text-neutral-600">{a}</AccordionContent></AccordionItem>)}
      </Accordion>
    </StaticPage>
  )
}

const SizeGuidePage = () => {
  const { setRoute } = useShop()
  return <PremiumSizeGuide onClose={() => setRoute({ view: 'home' })} setRoute={setRoute} />
}

const PolicyPage = ({ title }) => (
  <StaticPage title={title} subtitle="LEGAL">
    <p>Last updated: January 2025</p>
    <p>{title} for Velora. We take your privacy and rights seriously. This document outlines our terms in accordance with Indian law. Full document at hello@velora.in.</p>
    <h2 className="text-xl font-bold text-white mt-6">Key Points</h2>
    <ul className="list-disc list-inside space-y-2">
      <li>All transactions are secured with 256-bit SSL encryption.</li>
      <li>We do not sell your personal information to third parties.</li>
      <li>Cookies are used only for essential functionality and analytics.</li>
      <li>Payment processing is handled by PCI-DSS compliant partners.</li>
      <li>You may request data deletion at any time by emailing hello@velora.in.</li>
    </ul>
  </StaticPage>
)

/* ============================== AI CHAT WIDGET ============================== */
const QUICK_OPTIONS = [
  { icon: Package, label: 'Track my order', q: 'How can I track my order?' },
  { icon: TruckIcon, label: 'Shipping & delivery', q: 'How long does delivery take?' },
  { icon: RotateCcw, label: 'Returns & refund', q: 'What is your return policy?' },
  { icon: Gift, label: 'Coupon codes', q: 'Show me current coupon codes' },
  { icon: Award, label: 'Size guide', q: 'Help me pick the right size' },
  { icon: CreditCard, label: 'Payment options', q: 'What payment methods do you accept?' },
  { icon: Sparkles, label: 'Product recommendations', q: 'Recommend me a best-seller product' },
  { icon: Phone, label: 'Talk to a human', q: 'I want to speak to a human agent' },
]

const AIChatWidget = () => {
  const [open, setOpen] = useState(false)
  const { products, setRoute } = useShop()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi ✨ I'm **Vera**, your Velora AI concierge. I can help with sizing, orders, returns, payments and styling — powered by Gemini. How can I help today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [showQuick, setShowQuick] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    let sid = ''
    try { sid = localStorage.getItem('velora_chat_sid') || '' } catch (e) {}
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      try { localStorage.setItem('velora_chat_sid', sid) } catch (e) {}
    }
    setSessionId(sid)
  }, [])

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setShowQuick(false)
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: q })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || "I'm having trouble responding right now. Try again in a moment?",
        recommendations: data.recommendations || []
      }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network issue — please try again." }])
    } finally { setLoading(false) }
  }

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[70] w-16 h-16 rounded-full bg-neutral-950 text-white shadow-2xl flex items-center justify-center hover:bg-neutral-900 transition-all group border border-white/15"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition text-white" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-neutral-300 border-2 border-neutral-950" />
        </motion.button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22 }}
            className="fixed bottom-6 right-6 z-[70] w-[min(400px,calc(100vw-2rem))] h-[min(620px,calc(100vh-3rem))] glass-strong rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-black/10"
          >
            {/* Header */}
            <div className="bg-neutral-950 text-white p-4 flex items-center gap-3 relative overflow-hidden">
              <div className="relative w-11 h-11 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-neutral-300" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-neutral-300 border-2 border-neutral-950" />
              </div>
              <div className="relative flex-1">
                <p className="font-semibold text-sm">Vera · Velora Concierge</p>
                <p className="text-[11px] text-white/60 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-neutral-300" /> Stylist Concierge · Usually replies instantly</p>
              </div>
              <button onClick={() => setOpen(false)} className="relative w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafaf9]">
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 flex-shrink-0 flex items-center justify-center mr-2 mt-1">
                        <Bot className="w-3.5 h-3.5 text-neutral-300" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm bubble-in ${m.role === 'user' ? 'bg-neutral-950 text-white rounded-br-md' : 'bg-white border border-black/5 text-neutral-800 rounded-bl-md shadow-sm'}`}>
                      <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>

                  {/* Recommendations renderer */}
                  {m.role === 'assistant' && m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-2 pl-9 pr-2 space-y-2">
                      {m.recommendations.map(recId => {
                        const p = products?.find(prod => prod.id === recId)
                        if (!p) return null
                        return (
                          <div key={recId} className="flex gap-3 bg-white border border-black/5 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition duration-300">
                            <img src={p.images?.[0]} className="w-16 h-20 object-cover rounded-xl bg-neutral-100 flex-shrink-0" alt="" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <p className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-bold">STYLING SELECTION</p>
                                <h4 className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{p.name}</h4>
                                <p className="text-xs font-medium text-neutral-500 mt-0.5">{fmt(p.price)}</p>
                              </div>
                              <button 
                                onClick={() => { setOpen(false); setRoute({ view: 'product', id: p.id }); }} 
                                className="w-fit text-[11px] font-semibold text-neutral-900 border-b border-neutral-900 pb-px hover:text-neutral-500 hover:border-neutral-500 transition"
                              >
                                View Detailed Details
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 border border-white/10 flex-shrink-0 flex items-center justify-center mr-2 mt-1"><Bot className="w-3.5 h-3.5 text-neutral-300" /></div>
                  <div className="bg-white border border-black/5 px-4 py-3 rounded-2xl shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* Quick options */}
              {showQuick && !loading && (
                <div className="pt-3">
                  <p className="text-[11px] tracking-[0.2em] text-neutral-400 mb-2 px-1 font-bold">HELPFUL SHORTCUTS</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_OPTIONS.map(opt => (
                      <button key={opt.label} onClick={() => send(opt.q)} className="text-left p-3 rounded-xl bg-white border border-black/5 hover:border-neutral-950 hover:bg-neutral-50/50 transition group">
                        <opt.icon className="w-4 h-4 text-neutral-900 mb-1.5" />
                        <p className="text-xs font-semibold text-neutral-800 leading-tight">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href="tel:+918040005000" className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-full bg-neutral-950 text-white justify-center hover:bg-neutral-900 transition font-medium"><Phone className="w-3 h-3" /> Call Us</a>
                    <a href="mailto:hello@velora.in" className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-black/10 justify-center hover:border-black transition font-medium"><Mail className="w-3 h-3" /> Email Us</a>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-black/5 p-3 bg-white">
              <div className="flex items-center gap-2 rounded-full bg-neutral-100 pl-4 pr-2 py-1.5">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send() }}
                  placeholder="Inquire with Vera..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-neutral-400"
                />
                <button onClick={() => send()} disabled={loading || !input.trim()} className="w-9 h-9 rounded-full bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-900 disabled:opacity-40 transition">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 text-center mt-2">Powered by Gemini · Velora Concierge · <button onClick={() => { setMessages([messages[0]]); setShowQuick(true) }} className="underline hover:text-neutral-950">Reset Dialogue</button></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const VeloraOfflineShutter = ({ isOpen }) => {
  const slats = Array.from({ length: 32 })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="velora-storefront-shutter"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ ease: [0.25, 1, 0.5, 1], duration: 1.2 }}
          className="fixed inset-0 z-[9999] w-full h-full overflow-hidden flex flex-col justify-center items-center pointer-events-auto bg-[#333538]"
        >
          {/* Shutter Slats Background */}
          <div className="absolute inset-0 w-full h-full flex flex-col pointer-events-none bg-neutral-900">
            {slats.map((_, i) => (
              <div
                key={i}
                className="h-[3.2vh] w-full relative border-b border-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex-shrink-0"
                style={{
                  background: 'linear-gradient(to bottom, #d2d4d6 0%, #b3b5ba 25%, #9da0a6 50%, #82858b 75%, #6a6c71 100%)',
                }}
              >
                {/* Accent horizontal micro-groove line for extreme realism of a rolled slat */}
                <div className="absolute top-[40%] left-0 right-0 h-[1px] bg-black/10 border-b border-white/5" />
                {/* Slat reflection highlight */}
                <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-white/30" />
                {/* Slat bottom highlight */}
                <div className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-white/10" />
                {/* Slat bottom groove shadow */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/25" />
              </div>
            ))}
            
            {/* Ambient brushed metal vertical/horizontal glare overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none mix-blend-overlay"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.08) 85%, rgba(255,255,255,0) 100%)'
              }}
            />
            
            {/* Matte finish, fine grain noise overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />
            
            {/* Soft natural shadows/ambient light falloff */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 pointer-events-none" />
          </div>

          {/* Central Stencil Typography Text Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="relative z-20 text-center select-none px-6 pointer-events-none"
          >
            {/* White paint / stencil weathered text */}
            <div className="relative">
              {/* Outer soft shadow on the text to give it 3D realism against metal */}
              <h1 
                className="text-4xl md:text-6xl font-sans font-bold tracking-[0.25em] text-white/90 uppercase text-shadow-sm select-none"
                style={{
                  letterSpacing: '0.3em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  filter: 'contrast(1.2)'
                }}
              >
                STORE OFFLINE
              </h1>
              
              <p 
                className="text-xs md:text-sm font-sans tracking-[0.15em] text-white/70 font-semibold uppercase mt-6 select-none"
                style={{
                  letterSpacing: '0.2em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Please check your internet connection.
              </p>
            </div>
            
            {/* Weathering multiply grain applied exclusively over text layer */}
            <div 
              className="absolute inset-x-0 -top-8 -bottom-8 pointer-events-none mix-blend-multiply opacity-[0.25]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='weatherFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23weatherFilter)'/%3E%3C/svg%3E")`
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const App = () => {
  const [route, setRoute] = useState({ view: 'home' })
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [user, setUser] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loaderComplete, setLoaderComplete] = useState(false)
 
  // Offline support states
  const [isOffline, setIsOffline] = useState(false)
  const [shutterOpen, setShutterOpen] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState([])
 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialOffline = !window.navigator.onLine
      setIsOffline(initialOffline)
      if (initialOffline) {
        setShutterOpen(true)
      }
 
      let timeoutId = null
 
      const goOnline = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        setIsOffline(false)
        setShutterOpen(false)
      }
      const goOffline = () => {
        setIsOffline(true)
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setShutterOpen(true)
        }, 300)
      }
 
      window.addEventListener('online', goOnline)
      window.addEventListener('offline', goOffline)
 
      // Unregister Service Worker and clear stale chunk caches to prevent Unexpected token '<' errors
      if ('serviceWorker' in window.navigator) {
        window.navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        }).catch(err => console.error('SW unregister failed:', err));
      }
      if (typeof window !== 'undefined' && 'caches' in window) {
        window.caches.keys().then((names) => {
          for (let name of names) {
            window.caches.delete(name);
          }
        }).catch(err => console.error('Cache clear failed:', err));
      }
 
      return () => {
        window.removeEventListener('online', goOnline)
        window.removeEventListener('offline', goOffline)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }, [])
 
  useEffect(() => {
    // Fetch products with resilient retries and offline fallback
    const fetchProductsResilient = (attemptsLeft = 3, delayMs = 1500) => {
      fetch('/api/products')
        .then(r => {
          if (!r.ok) {
            throw new Error(`HTTP status ${r.status}`);
          }
          return r.json();
        })
        .then(d => {
          const prodList = d.products || []
          setProducts(prodList)
          setLoading(false)
          try {
            localStorage.setItem('velora_products_cache', JSON.stringify(prodList))
          } catch (e) {}
        })
        .catch(err => {
          if (attemptsLeft > 0) {
            console.warn(`Fetch products failed, retrying in ${delayMs}ms (${attemptsLeft} attempts left)...`, err);
            setTimeout(() => {
              fetchProductsResilient(attemptsLeft - 1, delayMs * 1.5);
            }, delayMs);
          } else {
            console.error("Fetch products failed after all attempts, loading from local cache fallback", err)
            try {
              const cached = JSON.parse(localStorage.getItem('velora_products_cache') || '[]')
              if (cached.length > 0) {
                setProducts(cached)
              }
            } catch (e) {}
            setLoading(false)
          }
        });
    };

    fetchProductsResilient(3, 1500);
 
    try {
      const savedCart = JSON.parse(localStorage.getItem('velora_cart') || '[]')
      const savedWL = JSON.parse(localStorage.getItem('velora_wl') || '[]')
      const savedUser = JSON.parse(localStorage.getItem('velora_user') || 'null')
      const savedRV = JSON.parse(localStorage.getItem('velora_recently_viewed') || '[]')
      setCart(savedCart); setWishlist(savedWL); setUser(savedUser); setRecentlyViewed(savedRV)

      // Automatic secure session restoration and validation on page load
      const verifySession = async () => {
        try {
          const res = await fetch('/api/session-user')
          const data = await res.json()
          if (data && data.user) {
            setUser(data.user)
            localStorage.setItem('velora_user', JSON.stringify(data.user))
          } else {
            setUser(null)
            localStorage.removeItem('velora_user')
          }
        } catch (err) {
          console.warn("Session auto-verify exception:", err)
        }
      }
      verifySession()
    } catch (e) {}
  }, [])
 
  useEffect(() => { try { localStorage.setItem('velora_cart', JSON.stringify(cart)) } catch (e) {} }, [cart])
  useEffect(() => { try { localStorage.setItem('velora_wl', JSON.stringify(wishlist)) } catch (e) {} }, [wishlist])
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo(0, 0) }, [route])
 
  const addToCart = (p, size, color, qty = 1) => {
    const key = `${p.id}-${size}-${color}`
    setCart(prev => {
      const exists = prev.find(i => i.key === key)
      if (exists) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { key, id: p.id, name: p.name, price: p.price, image: p.images[0], size, color, qty }]
    })
    toast.success(`Added ${p.name} to bag`)
  }
 
  const addRecentlyViewed = (p) => {
    if (!p) return
    setRecentlyViewed(prev => {
      const filtered = prev.filter(x => x.id !== p.id)
      const updated = [p, ...filtered].slice(0, 8)
      try {
        localStorage.setItem('velora_recently_viewed', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }
 
  const updateCart = (key, qty) => setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key))
  const clearCart = () => setCart([])
  const toggleWishlist = (id) => {
    setWishlist(prev => {
      if (prev.includes(id)) { toast('Removed from wishlist'); return prev.filter(x => x !== id) }
      toast.success('Added to wishlist'); return [...prev, id]
    })
  }
 
  const ctx = { 
    route, 
    setRoute, 
    products, 
    cart, 
    addToCart, 
    updateCart, 
    removeFromCart, 
    clearCart, 
    wishlist, 
    toggleWishlist, 
    user, 
    setUser, 
    searchOpen, 
    setSearchOpen, 
    mobileNavOpen, 
    setMobileNavOpen,
    isOffline,
    recentlyViewed,
    addRecentlyViewed,
    cartOpen,
    setCartOpen,
    quickViewProduct,
    setQuickViewProduct
  }
 
  const view = route.view || 'home'
  const pages = {
    home: <HomePage />, shop: <ShopPage />, product: <ProductPage />, cart: <CartPage />, wishlist: <WishlistPage />,
    checkout: <CheckoutPage />, 'order-success': <OrderSuccessPage />, 'track-order': <TrackOrderPage />,
    auth: <AuthPage />, account: <AccountPage />, about: <AboutPage />, contact: <ContactPage />,
    faq: <FaqPage />, 'size-guide': <SizeGuidePage />, shipping: <PolicyPage title="Shipping & Returns" />,
    privacy: <PolicyPage title="Privacy Policy" />, terms: <PolicyPage title="Terms & Conditions" />,
    club: <VeloraClub useShop={useShop} />,
    'gift-studio': <GiftStudioView useShop={useShop} />,
  }
 
  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fafaf9]">
      <VeloraLogo size="xl" />
      <div className="mt-8 w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full spin-slow" />
      <p className="mt-4 text-xs tracking-[0.3em] text-neutral-500">LOADING THE FUTURE</p>
    </div>
  )
 
  return (
    <ShopCtx.Provider value={ctx}>
      <AnimatePresence>
        {!loaderComplete && (
          <CinematicLoader onComplete={() => setLoaderComplete(true)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#fafaf9] noise relative">
        <Header />
        
        <main>
          <AnimatePresence mode="wait">
            <motion.div key={view + JSON.stringify(route.filter || route.id || '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {pages[view] || <HomePage />}
            </motion.div>
          </AnimatePresence>
        </main>
        
        <Footer />
        <SearchOverlay />
        <AIChatWidget />
        <MiniCart useShop={useShop} />
        <QuickViewModal />
 
        {/* Realistic luxury storefront shutter overlay */}
        <VeloraOfflineShutter isOpen={shutterOpen} />
      </div>
    </ShopCtx.Provider>
  )
}
 
export default App
