'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Award, Scissors, Wind, ShieldCheck } from 'lucide-react'

export default function LuxuryShowcase() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startAngle = useRef(0)

  // Premium luxury kurti visual angles
  const angleImages = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', // Front view
    'https://images.unsplash.com/photo-1631856955355-15a00bd7708c?auto=format&fit=crop&q=80&w=800', // Close-up 1
    'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800', // Close-up 2
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', // Close-up 3
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800', // Close-up 4
  ]

  const activeAngleIdx = Math.min(
    angleImages.length - 1,
    Math.floor((rotationAngle % 360) / (360 / angleImages.length))
  )

  const handleDragStart = (e) => {
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    startX.current = clientX
    startAngle.current = rotationAngle
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - startX.current
    const sensitivity = 0.6
    let nextAngle = (startAngle.current + deltaX * sensitivity) % 360
    if (nextAngle < 0) nextAngle += 360
    setRotationAngle(nextAngle)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const stories = [
    {
      title: "Artisanal Hand-Embroidered Neckline",
      subtitle: "THE ROYAL NECKLINE",
      desc: "An elegant crew-neck collar decorated with authentic zardozi embroidery, featuring genuine gold-wrapped threads hand-laid by hereditary artisans.",
      img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Exquisite Silk Weave Draping",
      subtitle: "THE DRAPE ANATOMY",
      desc: "Meticulously balanced silk-cotton blend with a perfect heavy-yet-fluid fall. Designed to flow organically and create an effortless, majestic silhouette.",
      img: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Heritage Lucknowi Sleeve",
      subtitle: "THE ARTISAN SLEEVE",
      desc: "Sleeves woven with traditional Jamdani and Chikankari motifs, finished with a delicate scalloped organza border and fine thread pipings.",
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Scalloped Hemline Embellishment",
      subtitle: "THE ARCHITECTURAL HEM",
      desc: "An engineered, structural bottom hem featuring delicate hand-cut scallops, reinforced with fine micro-stitches to prevent rolling and maintain weight.",
      img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600"
    },
  ]

  const fabricLabels = [
    { label: "Premium Mulberry Silk", desc: "Hand-woven with high-density premium mulberry silk threads for a rich, royal lustre.", icon: Sparkles },
    { label: "Gold Zari Threadwork", desc: "Genuine metallic zari borders meticulously embroidered by master weavers.", icon: Award },
    { label: "Lucknowi Chikankari Art", desc: "Intricate, hand-crafted shadow work embroidery from the heart of Lucknow.", icon: Scissors },
    { label: "Breathable Cotton-Silk Weave", desc: "A lightweight, hyper-breathable blend perfect for warm climates.", icon: Wind },
  ]

  return (
    <div className="bg-[#0a0a0a] text-white py-24 md:py-32 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Intro Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-20 md:mb-28"
        >
          <span className="text-xs tracking-[0.4em] text-amber-500 uppercase font-semibold mb-3 block">ATELIER CRAFTSMANSHIP</span>
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-6">Designed to Feel Extraordinary</h2>
          <p className="text-neutral-400 text-sm md:text-base tracking-wide leading-relaxed font-light">
            Each Velora garment is a marriage of time-honored traditional techniques and sharp, modern silhouettes, crafted slowly and with unmatched care in our Bengaluru studio.
          </p>
        </motion.div>

        {/* 360 & Anatomy Interactive Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24 md:mb-36">
          
          {/* Left Column: Draggable 360 Interactive Display */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center justify-center text-center"
          >
            <span className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono mb-4">DRAG OR SWIPE TO EXPLORE SILHOUETTE</span>
            
            <div 
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              className="relative w-full max-w-[450px] aspect-[3/4] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden bg-neutral-900/50 border border-white/5 shadow-2xl flex items-center justify-center select-none group"
            >
              <img 
                src={angleImages[activeAngleIdx]} 
                alt="Velora 360 degree product rotation view" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300 pointer-events-none group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Interaction Overlay Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[10px] tracking-wider text-neutral-300 uppercase pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>360° Studio Angle {activeAngleIdx + 1}</span>
              </div>
            </div>

            {/* Slider control as alternative */}
            <div className="w-full max-w-[320px] mt-6 px-4">
              <input 
                type="range" 
                min="0" 
                max="359" 
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 tracking-wider mt-2">
                <span>FRONT VIEW</span>
                <span>PROFILE</span>
                <span>BACK VIEW</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clickable Anatomy hotspots & story details */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-8"
          >
            <div>
              <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-2 block">◆ SPECIFICATIONS & DETAIL</span>
              <h3 className="text-2xl md:text-3xl font-display font-medium tracking-tight mb-4 text-white">Anatomy of the Perfect Garment</h3>
              <p className="text-neutral-400 text-sm leading-relaxed font-light">
                Tap on any element below to isolate and inspect our specific construction guidelines.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2">
              {stories.map((story, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                    activeStoryIndex === idx 
                      ? 'bg-neutral-900 border-amber-500/40 text-white' 
                      : 'bg-transparent border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10'
                  }`}
                >
                  <p className="text-[9px] font-mono tracking-widest text-amber-500/80 mb-1">0{idx + 1}</p>
                  <p className="text-xs font-semibold tracking-wider uppercase truncate">{story.subtitle.replace("THE ", "")}</p>
                </button>
              ))}
            </div>

            {/* Active Detail Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStoryIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center"
              >
                <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden bg-neutral-800 border border-white/10 flex-shrink-0">
                  <img 
                    src={stories[activeStoryIndex].img} 
                    alt={stories[activeStoryIndex].title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">{stories[activeStoryIndex].subtitle}</span>
                  <h4 className="text-lg font-medium text-white tracking-tight">{stories[activeStoryIndex].title}</h4>
                  <p className="text-neutral-400 text-xs md:text-sm font-light leading-relaxed">{stories[activeStoryIndex].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>

          </motion.div>
        </div>

        {/* Static Premium Fiber Grid (replacing the scrolling zoom section) */}
        <div className="border-t border-white/5 pt-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16"
          >
            <div className="max-w-xl">
              <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-3 block">◆ ATELIER FIBERS</span>
              <h3 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">The Luxury Fabric Standard</h3>
            </div>
            <p className="text-neutral-400 text-sm font-light max-w-sm leading-relaxed">
              We source and weave fabrics that breathe with your body, drape effortlessly, and last a lifetime.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fabricLabels.map((fib, i) => {
              const IconComp = fib.icon || ShieldCheck
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  className="bg-neutral-900/20 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-neutral-900/40 hover:border-amber-500/20 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center text-amber-500/80 mb-6 group-hover:text-amber-500 transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-medium text-white mb-2 tracking-tight group-hover:text-amber-500 transition-colors">{fib.label}</h4>
                  <p className="text-neutral-400 text-xs font-light leading-relaxed">{fib.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
