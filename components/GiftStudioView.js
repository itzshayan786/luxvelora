'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gift, Heart, ShoppingBag, Search, ChevronRight, ChevronLeft, Volume2, VolumeX, X, RotateCcw, Sliders, Check
} from 'lucide-react'
import { toast } from 'sonner'

export default function GiftStudioView({ useShop }) {
  const { user, setRoute, toggleWishlist, wishlist, addToCart, setQuickViewProduct, products } = useShop()
  const [introSeen, setIntroSeen] = useState(false)
  const [isPlayingIntro, setIsPlayingIntro] = useState(true)
  const [currentScene, setCurrentScene] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const audioCtxRef = useRef(null)
  const oscillatorsRef = useRef([])

  // Questionnaire / state
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

  // Check localStorage for prior seen status and preload images
  useEffect(() => {
    // Preload all 6 cinematic scenes
    const urls = [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc15aae9?auto=format&fit=crop&q=80&w=1400"
    ]
    try {
      urls.forEach(url => {
        const img = new window.Image()
        img.src = url
      })
    } catch (e) {
      console.warn("Failed to preload cinematic assets:", e)
    }

    const seen = localStorage.getItem('velora_gift_studio_intro_seen') === 'true'
    if (seen) {
      setIntroSeen(true)
      setIsPlayingIntro(false)
    } else {
      setIntroSeen(false)
      setIsPlayingIntro(true)
    }
  }, [])

  // Cinematic Intro Scene cycle (Total: 6 scenes over 5.4 seconds -> 900ms each)
  useEffect(() => {
    if (!isPlayingIntro) return

    const sceneTimer = setInterval(() => {
      setCurrentScene(prev => {
        if (prev < 5) {
          return prev + 1
        } else {
          // Finished intro
          clearInterval(sceneTimer)
          handleFinishIntro()
          return prev
        }
      })
    }, 900)

    return () => clearInterval(sceneTimer)
  }, [isPlayingIntro])

  // Synthesized luxury ambient audio (Web Audio API)
  const initAudio = () => {
    try {
      if (typeof window === 'undefined') return
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return

      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      // Create main gain node for volume
      const mainGain = ctx.createGain()
      mainGain.gain.setValueAtTime(isMuted ? 0 : 0.15, ctx.currentTime)
      mainGain.connect(ctx.destination)

      // Low pass filter to keep it extremely warm and premium
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(450, ctx.currentTime)
      filter.connect(mainGain)

      // Create a chord: C3, G3, C4, E4 for a lush drone
      const freqs = [130.81, 196.00, 261.63, 329.63]
      const oscs = freqs.map((f, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime)

        const oscGain = ctx.createGain()
        // stagger volume to make it rich
        oscGain.gain.setValueAtTime(0.05 + (i * 0.02), ctx.currentTime)
        
        // Add subtle lfo for movement
        const lfo = ctx.createOscillator()
        lfo.frequency.setValueAtTime(0.2 + (i * 0.1), ctx.currentTime)
        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(0.02, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(oscGain.gain)

        osc.connect(oscGain)
        oscGain.connect(filter)

        lfo.start()
        osc.start()

        return { osc, lfo }
      })

      oscillatorsRef.current = oscs
    } catch (err) {
      console.warn("Web Audio API failed to load", err)
    }
  }

  const handleMuteToggle = () => {
    const nextMute = !isMuted
    setIsMuted(nextMute)

    if (!audioCtxRef.current) {
      initAudio()
    } else {
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      // Ramp gain up or down gracefully
      const oscs = oscillatorsRef.current
      if (oscs.length > 0) {
        // Adjust master volume
        const gainNode = audioCtxRef.current.createGain() // or access the node
      }
    }
  }

  // Graceful stop of audio
  const stopAudio = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    } catch (e) {
      // quiet fail
    }
  }

  // Ensure volume reflects isMuted state
  useEffect(() => {
    if (audioCtxRef.current) {
      // Just stop audio if muted, or restart if unmuted
      if (isMuted) {
        stopAudio()
      } else {
        initAudio()
      }
    }
  }, [isMuted])

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const handleFinishIntro = () => {
    stopAudio()
    setIsPlayingIntro(false)
    localStorage.setItem('velora_gift_studio_intro_seen', 'true')
    setIntroSeen(true)
  }

  const handleReplayIntro = () => {
    setCurrentScene(0)
    setIsPlayingIntro(true)
    setIsMuted(true) // muted by default on replay as well
  }

  // Questionnaire details
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
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
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
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800",
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
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800",
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
      image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800",
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
      image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=800",
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
    
    // Map elegant labels to standard filters
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

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

  // Scenes data for Cinematic Intro (exactly matching user-specified scenes, text, and aesthetic)
  const INTRO_SCENES = [
    {
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1400",
      text: "Gift Studio",
      quote: "Thoughtful gifting made simple.",
      badge: "Premium Wrapped Gift Box"
    },
    {
      image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=1400",
      text: "Gift Studio",
      quote: "Thoughtful gifting made simple.",
      badge: "Luxury Folded Kurtis"
    },
    {
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1400",
      text: "Thoughtful gifting made simple.",
      quote: "Exquisite details and handloom artistry.",
      badge: "Embroidery Close-up"
    },
    {
      image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?auto=format&fit=crop&q=80&w=1400",
      text: "Thoughtful gifting made simple.",
      quote: "Pure mulberry silks and organic textures.",
      badge: "Premium Fabric Close-up"
    },
    {
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1400",
      text: "Discover beautiful gifts for every special occasion.",
      quote: "Graceful silhouettes and bespoke craftsmanship.",
      badge: "Elegant Ethnic Fashion"
    },
    {
      image: "https://images.unsplash.com/photo-1566150905458-1bf1fc15aae9?auto=format&fit=crop&q=80&w=1400",
      text: "Let's begin.",
      quote: "Experience the Couture Gifting Concierge.",
      badge: "Luxury Shopping Bag"
    }
  ]

  // Render Cinematic Intro
  if (isPlayingIntro) {
    return (
      <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col justify-between overflow-hidden select-none">
        
        {/* Background Image with Ken Burns Slow Zoom & Smooth Transitions */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1.0, opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="w-full h-full"
            >
              <img 
                src={INTRO_SCENES[currentScene].image} 
                alt="Velora Luxury Scene" 
                className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.05]"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90" />
        </div>

        {/* Top bar controls */}
        <div className="relative z-10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-neutral-400">
              VELORA ATELIER
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button 
              onClick={handleMuteToggle}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Skip Button */}
            <button 
              onClick={handleFinishIntro}
              className="px-4 py-2 border border-white/20 text-[10px] font-mono tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-none"
            >
              Skip Intro
            </button>
          </div>
        </div>

        {/* Cinematic Content with Elegant Mask Reveal & Luxury Typography */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 self-center my-auto space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="overflow-hidden py-1">
                <motion.h2 
                  initial={{ opacity: 0, y: 12, letterSpacing: "0.12em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.03em" }}
                  exit={{ opacity: 0, y: -8, letterSpacing: "0.12em" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-6xl font-display font-light tracking-tight leading-none text-white select-none uppercase"
                >
                  {INTRO_SCENES[currentScene].text}
                </motion.h2>
              </div>

              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "40px", opacity: 0.3 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="h-px bg-white mx-auto" 
              />

              <div className="overflow-hidden py-1 space-y-2">
                <motion.p 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                  className="text-sm md:text-lg text-neutral-300 font-serif-lux italic font-light max-w-xl mx-auto leading-relaxed select-none"
                >
                  "{INTRO_SCENES[currentScene].quote}"
                </motion.p>
                <motion.span 
                  initial={{ opacity: 0, tracking: "0.2em" }}
                  animate={{ opacity: 1, tracking: "0.05em" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
                  className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500 block mt-1 select-none"
                >
                  {INTRO_SCENES[currentScene].badge}
                </motion.span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom progress indicator */}
        <div className="relative z-10 px-8 py-6 border-t border-white/10 flex items-center justify-between text-neutral-500 font-mono text-[9px] tracking-widest uppercase">
          <span>COUTURE FILM CAMPAIGN</span>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div 
                key={idx} 
                className={`h-1.5 transition-all duration-500 ${currentScene === idx ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
              />
            ))}
          </div>
          <span>© 2026 VELORA</span>
        </div>
      </div>
    )
  }

  // Questionnaire view when Intro is seen
  return (
    <div className="bg-[#FAF9F5] min-h-screen text-neutral-900 pb-24 selection:bg-neutral-900 selection:text-white">
      {/* Editorial Page Header */}
      <section className="relative h-[25vh] md:h-[35vh] flex items-center justify-center overflow-hidden border-b border-neutral-200/40">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=1800" 
            alt="Velora Luxury Fabric" 
            className="w-full h-full object-cover filter grayscale contrast-125 opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F5]/20 via-[#FAF9F5] to-[#FAF9F5]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-4 pt-12">
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-neutral-450"></span>
            <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-neutral-500 font-bold">
              GIFT CONCIERGE STUDIO
            </span>
            <span className="h-[1px] w-8 bg-neutral-450"></span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-light text-neutral-950 tracking-tight leading-none">
            Gift Studio
          </h1>

          <p className="text-xs md:text-sm text-neutral-500 font-serif-lux italic font-light max-w-xl mx-auto leading-relaxed">
            Exquisite artisanal ensembles curated with thoughtfulness for your most special gestures.
          </p>
        </div>
      </section>

      {/* Main container area: interactive advisor or results split */}
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8">
        <div className="bg-white border border-neutral-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col lg:flex-row min-h-[650px]">
          
          {/* LEFT PANEL: LUXURY CAMPAIGN PHOTO & DETAIL PANEL */}
          <div className="lg:w-[40%] bg-neutral-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-white min-h-[350px] lg:min-h-[600px]">
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={step + '-' + loadingState}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 0.35, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.8 }}
                  src={loadingState === 'results' ? "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800" : currentStep?.image} 
                  alt="Velora Editorial Campaign View" 
                  className="w-full h-full object-cover filter grayscale contrast-125"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/60" />
            </div>

            {/* Logo details */}
            <div className="relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-display tracking-widest font-bold">V</span>
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-400">ELORA</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 block mt-1 uppercase">
                Artisan Curation Coterie
              </span>
            </div>

            {/* Interactive selections tracker */}
            <div className="relative z-10 max-w-sm space-y-6">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-neutral-400 block">
                  Curation Progress
                </span>
                <h3 className="text-2xl font-display font-light text-white leading-tight">
                  The Art of <span className="font-serif-lux italic text-neutral-100">Couture Gifting</span>
                </h3>
              </div>

              {/* Real-time selections summary board */}
              <div className="border-t border-white/10 pt-4 space-y-3.5 text-xs">
                {[
                  { label: "Recipient", val: selections.recipient },
                  { label: "Occasion", val: selections.occasion },
                  { label: "Budget Limit", val: selections.budget === '100000' ? 'No Limit' : selections.budget ? `₹${selections.budget}` : '' },
                  { label: "Color Family", val: selections.color },
                  { label: "Textile Sourcing", val: selections.style }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-0.5 font-mono text-[10px]">
                    <span className="text-neutral-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-white tracking-wide font-semibold uppercase">{item.val || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Replay Intro button for curiosities */}
              <button
                onClick={handleReplayIntro}
                className="pt-4 text-[9px] font-mono tracking-[0.2em] text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 uppercase"
              >
                <RotateCcw className="w-3 h-3" /> Replay Cinematic Intro
              </button>
            </div>

            <div className="relative z-10 text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
              © VELORA BOUTIQUE COUTURE
            </div>
          </div>

          {/* RIGHT PANEL: DYNAMIC INTERACTIVE EXPERIENCE AREA */}
          <div className="flex-1 flex flex-col bg-[#FCFBF9] overflow-hidden relative justify-between p-6 md:p-12">
            
            {loadingState === 'selection' && (
              <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full py-4">
                
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 font-semibold">
                    Step {step.toString().padStart(2, '0')} / 05
                  </span>
                  <div className="w-32 h-px bg-neutral-200 relative overflow-hidden">
                    <motion.div 
                      initial={{ left: "-100%" }}
                      animate={{ left: `${(step / 5) * 100 - 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute inset-0 bg-neutral-950"
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-light text-neutral-950 tracking-tight leading-tight">
                    {currentStep?.title}
                  </h2>
                  <p className="text-xs text-neutral-500 font-serif-lux italic font-light mt-1.5">
                    {currentStep?.subtitle}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-3.5 mb-10">
                  {currentStep?.options.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(opt.label)}
                      className="w-full text-left p-4 rounded-none border border-neutral-200 bg-white hover:border-neutral-950 transition-all duration-300 flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-950 block">{opt.label}</span>
                        <span className="text-[11px] text-neutral-500 font-sans leading-normal block">
                          {opt.desc}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-950 transition-colors" />
                    </button>
                  ))}
                </div>

                {/* Back and restart buttons */}
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
                    onClick={handleReset}
                    className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase"
                  >
                    Restart Selection
                  </button>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {loadingState === 'loading' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
                <div className="relative mb-6">
                  <div className="w-12 h-12 border border-neutral-200 border-t-neutral-950 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
                </div>
                <div className="h-16 flex items-center justify-center">
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
                  VELORA LUXURY GIFT DIERECTORY
                </p>
              </div>
            )}

            {/* RESULTS VIEW */}
            {loadingState === 'results' && (
              <div className="flex-1 flex flex-col h-full justify-between">
                
                {/* Results Header */}
                <div className="border-b border-neutral-100 pb-6 mb-6">
                  <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-400 uppercase font-bold mb-1 block">
                    CURATED RESULTS
                  </span>
                  <h3 className="text-xl md:text-2xl font-display font-light text-neutral-950 leading-relaxed max-w-2xl">
                    {results.greeting || "We curated these gorgeous recommendations for you."}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 font-sans">
                    Exquisite ethnic ensembles tailored exactly to your specified gift parameters.
                  </p>
                </div>

                {/* Recommendations Grid Container */}
                <div className="overflow-y-auto max-h-[420px] pr-2 space-y-4 mb-6">
                  {results.products.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-neutral-500 text-xs font-serif-lux italic">No exact designs match your filters. Let us reset our search variables to explore our designer inventory.</p>
                      <button 
                        onClick={handleReset} 
                        className="bg-neutral-950 hover:bg-neutral-800 text-white px-8 py-3 rounded-none text-xs font-semibold uppercase tracking-widest transition-colors duration-300"
                      >
                        Reset Variables
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.products.map((p) => {
                        const inWL = wishlist.includes(p.id)
                        return (
                          <div 
                            key={p.id} 
                            className="bg-white border border-neutral-200/60 p-4 rounded-none flex flex-col justify-between hover:border-neutral-800 transition-colors group"
                          >
                            <div>
                              {/* Image */}
                              <div 
                                className="relative aspect-[3/4] bg-neutral-100 mb-4 cursor-pointer overflow-hidden" 
                                onClick={() => setRoute({ view: 'product', id: p.id })}
                              >
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id) }} 
                                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:scale-105 transition"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${inWL ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
                                </button>
                              </div>

                              {/* Info */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">
                                  {p.category}
                                </span>
                                <h3 
                                  className="text-xs font-semibold text-neutral-950 leading-snug line-clamp-1 hover:underline cursor-pointer uppercase tracking-wider" 
                                  onClick={() => setRoute({ view: 'product', id: p.id })}
                                >
                                  {p.name}
                                </h3>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-neutral-950">{fmt(p.price)}</span>
                                  <span className="text-[10px] text-neutral-400 line-through">{fmt(p.mrp)}</span>
                                  <span className="text-[9px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">-{p.discount}%</span>
                                </div>

                                {p.aiReason && (
                                  <div className="mt-3 p-3 bg-neutral-50 border border-neutral-150 text-[10.5px] text-neutral-600 leading-normal italic">
                                    "{p.aiReason}"
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-2 border-t border-neutral-100">
                              <button 
                                onClick={() => { addToCart(p, p.sizes[0], p.colors[0]); toast.success(`Added ${p.name} to cart!`) }}
                                className="flex-1 py-2 bg-neutral-950 text-white font-semibold text-[10px] tracking-widest uppercase flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                              </button>
                              <button 
                                onClick={() => setQuickViewProduct(p)}
                                className="p-2 bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 transition-colors"
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

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <button 
                    onClick={handleReset}
                    className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase"
                  >
                    Restart Personal Curation
                  </button>
                  <button 
                    onClick={() => setRoute({ view: 'shop' })}
                    className="px-6 py-3 bg-neutral-950 text-white rounded-none text-[10px] font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                  >
                    Browse Collections
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  )
}
