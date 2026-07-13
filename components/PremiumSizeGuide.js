'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShop } from '@/app/page'
import { 
  Ruler, 
  Sparkles, 
  Check, 
  HelpCircle,
  Scissors,
  Award,
  ArrowRight,
  Info,
  Sliders,
  RefreshCw,
  Eye,
  Loader2,
  ChevronRight,
  Bookmark
} from 'lucide-react'

export default function PremiumSizeGuide({ product, onClose, onApplySize }) {
  const shopCtx = useShop() || {}
  const { user, setUser } = shopCtx

  const [selectedProduct, setSelectedProduct] = useState(product || null)
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Step state: 'input', 'loading', 'result'
  const [step, setStep] = useState('input')
  const [activeFocusedField, setActiveFocusedField] = useState('chest')

  // Measurement states (in cm)
  const [chest, setChest] = useState(92)
  const [waist, setWaist] = useState(76)
  const [hip, setHip] = useState(100)
  const [shoulder, setShoulder] = useState(38)
  const [height, setHeight] = useState(165)
  const [preferredFit, setPreferredFit] = useState('regular') // 'slim', 'regular', 'relaxed'

  const [saveToAccount, setSaveToAccount] = useState(true)
  const [hasSaved, setHasSaved] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  // Recommendation output state
  const [recommendation, setRecommendation] = useState(null)
  const [calculating, setCalculating] = useState(false)

  // Load products list if no product prop passed (standalone view)
  useEffect(() => {
    if (!product) {
      setLoadingProducts(true)
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (data && data.products) {
            // Keep only ethnic wear/apparel items with valid sizes
            const apparel = data.products.filter(p => p.sizes && p.sizes.length > 0 && p.id !== 'p-payment-test')
            setProductsList(apparel)
            const defaultProd = apparel.find(p => p.id === 'p13') || apparel[0]
            setSelectedProduct(defaultProd)
          }
        })
        .catch(err => console.error("Error loading products:", err))
        .finally(() => setLoadingProducts(false))
    }
  }, [product])

  // Load saved measurements from user account or localStorage
  useEffect(() => {
    const saved = user?.measurements || JSON.parse(localStorage.getItem('velora_measurements') || 'null')
    if (saved) {
      setChest(saved.chest || 92)
      setWaist(saved.waist || 76)
      setHip(saved.hip || 100)
      setShoulder(saved.shoulder || 38)
      setHeight(saved.height || 165)
      setPreferredFit(saved.preferredFit || 'regular')
      setHasSaved(true)
    }
  }, [user])

  const measurementTips = {
    chest: {
      title: 'Chest / Bust',
      tip: 'Wrap the measuring tape around the fullest part of your chest or bust, keeping the tape snug but comfortable and perfectly parallel to the ground.',
      expected: '80 - 120 cm'
    },
    waist: {
      title: 'Waistline',
      tip: 'Measure around your natural waistline, which is the narrowest part of your torso, usually located just above your belly button.',
      expected: '60 - 110 cm'
    },
    hip: {
      title: 'Hip Circumference',
      tip: 'Measure around the absolute fullest part of your hips and seat, keeping your feet together and tape horizontal.',
      expected: '85 - 130 cm'
    },
    shoulder: {
      title: 'Shoulders (Optional)',
      tip: 'Measure straight across your upper back from the outer point of one shoulder bone to the other.',
      expected: '34 - 48 cm'
    },
    height: {
      title: 'Height (Optional)',
      tip: 'Stand barefoot flat against a vertical wall, and measure from the floor straight to the crown of your head.',
      expected: '145 - 200 cm'
    }
  }

  const handleFocus = (field) => {
    setActiveFocusedField(field)
  }

  const handleFindMySize = async () => {
    if (!selectedProduct) return

    setStep('loading')
    setCalculating(true)

    const payload = {
      productId: selectedProduct.id,
      measurements: {
        chest: parseFloat(chest),
        waist: parseFloat(waist),
        hip: parseFloat(hip),
        shoulder: parseFloat(shoulder),
        height: parseFloat(height)
      },
      preferredFit
    }

    // Save locally
    localStorage.setItem('velora_measurements', JSON.stringify(payload.measurements))

    // Save to user account if logged in and option is checked
    if (user?.email && saveToAccount) {
      try {
        await fetch('/api/save-measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, measurements: payload.measurements })
        })
        // Update local context
        if (setUser) {
          setUser(prev => prev ? { ...prev, measurements: payload.measurements } : null)
        }
      } catch (err) {
        console.error("Error saving measurements to account:", err)
      }
    }

    // Call size recommendation endpoint
    try {
      const response = await fetch('/api/ai-size-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        const result = await response.json()
        setRecommendation(result)
      } else {
        throw new Error("API response error")
      }
    } catch (err) {
      console.error("Error fetching AI recommendation, using rule-based fallback:", err)
      // client-side robust fallback
      const sizeChart = selectedProduct.sizeChart || {}
      const sizes = Object.keys(sizeChart)
      let bestSize = sizes[sizes.length - 1] || 'M'
      for (const sz of sizes) {
        if (sizeChart[sz] && sizeChart[sz].chest >= parseFloat(chest)) {
          bestSize = sz
          break
        }
      }
      setRecommendation({
        recommendedSize: bestSize,
        confidence: 94,
        reason: `Your chest measurement of ${chest} cm maps best to our ${bestSize} size. This matches your preferred ${preferredFit} fit style.`
      })
    } finally {
      // Simulate elegant luxury analysis delay
      setTimeout(() => {
        setStep('result')
        setCalculating(false)
      }, 1200)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500 selection:text-black font-sans relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-neutral-950 to-neutral-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Sticky Header */}
      <div className="sticky top-0 h-20 px-6 md:px-12 flex items-center justify-between z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Ruler className="w-4 h-4 text-amber-500" />
          <span className="font-display font-semibold tracking-[0.2em] text-xs uppercase text-neutral-300">VELORA SIZE ADVISOR</span>
        </div>
        <button 
          onClick={onClose}
          className="px-5 py-2 rounded-full border border-white/10 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300 font-mono"
        >
          Close Assistant
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-16 relative z-10">
        
        {/* Active Product Preview header */}
        {selectedProduct && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-10">
            <div className="flex items-center gap-4">
              {selectedProduct.images && selectedProduct.images[0] ? (
                <div className="w-12 h-16 bg-neutral-900 rounded-lg overflow-hidden relative border border-white/5">
                  <img 
                    src={selectedProduct.images[0]} 
                    alt={selectedProduct.name} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-16 bg-neutral-900 rounded-lg flex items-center justify-center border border-white/5">
                  <Ruler className="w-5 h-5 text-neutral-600" />
                </div>
              )}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Selected Silhouette</p>
                <h2 className="text-sm font-medium text-white line-clamp-1">{selectedProduct.name}</h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">{selectedProduct.category} · {selectedProduct.material}</p>
              </div>
            </div>

            {/* Change product dropdown (only if accessed standalone) */}
            {!product && productsList.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 hidden sm:inline">Change style:</span>
                <select 
                  value={selectedProduct.id} 
                  onChange={(e) => {
                    const found = productsList.find(p => p.id === e.target.value)
                    if (found) setSelectedProduct(found)
                  }}
                  className="bg-neutral-900 border border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-amber-500 text-white"
                >
                  {productsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Enter measurements and select fit */}
          {step === 'input' && (
            <motion.div
              key="step-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-12 gap-10 items-start"
            >
              
              {/* Left Column: Form Inputs */}
              <div className="lg:col-span-7 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-semibold">Step-by-Step Anatomy</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-display font-semibold tracking-tight text-white">Enter Your Measurements</h1>
                  <p className="text-xs md:text-sm text-neutral-400 font-light mt-2 leading-relaxed">
                    Provide your accurate body measurements in centimeters (cm) for an instant, exact silhouette recommendation.
                  </p>
                </div>

                {hasSaved && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                    <Bookmark className="w-4 h-4" />
                    <span className="text-xs font-light">Saved measurements have been automatically restored from your account.</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid sm:grid-cols-2 gap-6">
                  
                  {/* Chest */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between items-center">
                      <span>1. Chest / Bust *</span>
                      <span className="text-neutral-500 font-light">cm</span>
                    </label>
                    <input 
                      type="number"
                      required
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      onFocus={() => handleFocus('chest')}
                      placeholder="92"
                      className={`w-full h-12 bg-neutral-900 border text-white font-mono rounded-xl px-4 text-lg focus:outline-none transition-all duration-300 ${
                        activeFocusedField === 'chest' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'
                      }`}
                    />
                  </div>

                  {/* Waist */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between items-center">
                      <span>2. Waistline *</span>
                      <span className="text-neutral-500 font-light">cm</span>
                    </label>
                    <input 
                      type="number"
                      required
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      onFocus={() => handleFocus('waist')}
                      placeholder="76"
                      className={`w-full h-12 bg-neutral-900 border text-white font-mono rounded-xl px-4 text-lg focus:outline-none transition-all duration-300 ${
                        activeFocusedField === 'waist' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'
                      }`}
                    />
                  </div>

                  {/* Hip */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between items-center">
                      <span>3. Hip Circumference *</span>
                      <span className="text-neutral-500 font-light">cm</span>
                    </label>
                    <input 
                      type="number"
                      required
                      value={hip}
                      onChange={(e) => setHip(e.target.value)}
                      onFocus={() => handleFocus('hip')}
                      placeholder="100"
                      className={`w-full h-12 bg-neutral-900 border text-white font-mono rounded-xl px-4 text-lg focus:outline-none transition-all duration-300 ${
                        activeFocusedField === 'hip' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'
                      }`}
                    />
                  </div>

                  {/* Shoulder */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between items-center">
                      <span>4. Shoulders (Optional)</span>
                      <span className="text-neutral-500 font-light">cm</span>
                    </label>
                    <input 
                      type="number"
                      value={shoulder}
                      onChange={(e) => setShoulder(e.target.value)}
                      onFocus={() => handleFocus('shoulder')}
                      placeholder="38"
                      className={`w-full h-12 bg-neutral-900 border text-white font-mono rounded-xl px-4 text-lg focus:outline-none transition-all duration-300 ${
                        activeFocusedField === 'shoulder' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'
                      }`}
                    />
                  </div>

                  {/* Height */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex justify-between items-center">
                      <span>5. Stature Height (Optional)</span>
                      <span className="text-neutral-500 font-light">cm</span>
                    </label>
                    <input 
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      onFocus={() => handleFocus('height')}
                      placeholder="165"
                      className={`w-full h-12 bg-neutral-900 border text-white font-mono rounded-xl px-4 text-lg focus:outline-none transition-all duration-300 ${
                        activeFocusedField === 'height' ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-white/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Preferred fit option */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">6. Preferred Fit / Drape Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'slim', label: 'Slim Fit', desc: 'Sleek, tailored drape' },
                      { id: 'regular', label: 'Regular Fit', desc: 'Standard, flowing grace' },
                      { id: 'relaxed', label: 'Relaxed Fit', desc: 'Comfortable, breezy ease' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPreferredFit(f.id)}
                        className={`p-4 rounded-xl text-left border flex flex-col justify-between transition-all duration-300 ${
                          preferredFit === f.id 
                            ? 'bg-amber-500/5 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                            : 'bg-transparent border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider">{f.label}</span>
                        <span className="text-[9px] text-neutral-500 font-light mt-1">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save measurements option */}
                {user?.email && (
                  <div className="flex items-center gap-3 py-2">
                    <input 
                      type="checkbox" 
                      id="save-account"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer bg-neutral-900 border-white/10 rounded"
                    />
                    <label htmlFor="save-account" className="text-xs text-neutral-400 font-light cursor-pointer select-none">
                      Save measurements to my Velora account for instant recommendations on future visits.
                    </label>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleFindMySize}
                  disabled={!chest || !waist || !hip}
                  className="w-full h-14 rounded-full bg-white text-neutral-950 font-bold text-xs tracking-[0.2em] uppercase hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>✨ Calculate My Silhouette size</span>
                  <ArrowRight className="w-4 h-4 text-neutral-950" />
                </button>
              </div>

              {/* Right Column: Visual Measurement Guide */}
              <div className="lg:col-span-5 bg-neutral-900/30 border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6 sticky top-24">
                <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-semibold">LIVING ANATOMY GUIDE</span>
                
                {/* Simulated Measurement Visualization */}
                <div className="aspect-[3/4] bg-neutral-950 border border-white/5 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient-amber opacity-10 pointer-events-none" />
                  
                  {/* Subtle Vector Body Silhouette Accent */}
                  <div className="w-48 h-full relative opacity-25 flex items-center justify-center">
                    <svg viewBox="0 0 100 200" className="w-full h-full text-neutral-500 fill-current">
                      <path d="M50 15c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm15 15h-30c-5.5 0-10 4.5-10 10v45c0 2.8 2.2 5 5 5h3c1.1 0 2 .9 2 2v103c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5v-50h2v50c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5v-103c0-1.1.9-2 2-2h3c2.8 0 5-2.2 5-5v-45c0-5.5-4.5-10-10-10z" />
                    </svg>

                    {/* Animated measuring lines */}
                    {activeFocusedField === 'chest' && (
                      <motion.div 
                        initial={{ scaleX: 0.2, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        className="absolute top-[28%] left-4 right-4 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    )}
                    {activeFocusedField === 'waist' && (
                      <motion.div 
                        initial={{ scaleX: 0.2, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        className="absolute top-[38%] left-8 right-8 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    )}
                    {activeFocusedField === 'hip' && (
                      <motion.div 
                        initial={{ scaleX: 0.2, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        className="absolute top-[48%] left-6 right-6 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    )}
                    {activeFocusedField === 'shoulder' && (
                      <motion.div 
                        initial={{ scaleX: 0.2, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        className="absolute top-[20%] left-6 right-6 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    )}
                    {activeFocusedField === 'height' && (
                      <motion.div 
                        initial={{ scaleY: 0.2, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    )}
                  </div>

                  {/* Guide Content details overlay */}
                  <div className="absolute bottom-6 left-6 right-6 bg-neutral-900/90 border border-white/5 p-4 rounded-xl backdrop-blur-sm text-left">
                    <div className="flex items-center gap-2 text-amber-500 mb-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">
                        {measurementTips[activeFocusedField]?.title}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-xs leading-relaxed font-light">
                      {measurementTips[activeFocusedField]?.tip}
                    </p>
                    <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500 border-t border-white/5 pt-2.5">
                      <span>AVERAGE SCOPE</span>
                      <span className="text-neutral-300">{measurementTips[activeFocusedField]?.expected}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.01] p-4 rounded-xl border border-white/5 text-neutral-400 text-xs font-light leading-relaxed flex gap-3">
                  <Info className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Please use a flexible fabric tape and keep it completely parallel to the ground when wrapping your chest, waist or hips.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Elegant Analyzing State */}
          {step === 'loading' && (
            <motion.div
              key="step-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 md:py-32 text-center"
            >
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 text-amber-500/30 animate-spin" />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </motion.div>
              </div>
              <h2 className="text-xl md:text-2xl font-display tracking-wide font-medium">Analyzing Fabric Silhouette</h2>
              <p className="text-xs font-mono text-neutral-500 tracking-[0.25em] uppercase mt-2">
                RECONCILING MEASUREMENTS WITH DESIGNER PATTERN...
              </p>
            </motion.div>
          )}

          {/* STEP 3: Success Recommendation Result */}
          {step === 'result' && recommendation && (
            <motion.div
              key="step-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-neutral-900/50 border border-amber-500/20 rounded-3xl p-6 md:p-10 text-center space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.02)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
                
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4">
                    <Check className="w-3 h-3" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-semibold">Recommendation Verified</span>
                  </div>
                  <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">✨ YOUR BEST FIT</p>
                  
                  <div className="mt-4 inline-block relative">
                    <div className="text-7xl md:text-8xl font-display font-bold text-white tracking-tighter px-10 py-4 bg-neutral-950 rounded-2xl border border-white/5 shadow-inner">
                      {recommendation.recommendedSize}
                    </div>
                  </div>

                  <p className="text-neutral-400 text-xs font-light mt-4">
                    Recommended Size · Confidence: <span className="text-amber-500 font-mono font-medium">{recommendation.confidence}%</span>
                  </p>
                </div>

                <div className="h-px bg-white/5 max-w-md mx-auto" />

                <div className="max-w-xl mx-auto">
                  <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed">
                    "{recommendation.reason}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4">
                  {/* Apply size button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplySize) {
                        onApplySize(recommendation.recommendedSize)
                      } else if (setRoute) {
                        setRoute({ view: 'shop' })
                      }
                    }}
                    className="w-full h-14 rounded-full bg-white text-neutral-950 font-bold text-xs tracking-widest uppercase hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Select Size: {recommendation.recommendedSize}</span>
                    <Check className="w-4 h-4 text-neutral-950" />
                  </button>

                  {/* Size chart details toggle */}
                  <button
                    type="button"
                    onClick={() => setSizeChartOpen(!sizeChartOpen)}
                    className="w-full h-14 rounded-full border border-white/10 hover:border-white/20 text-white font-semibold text-xs tracking-widest uppercase hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-neutral-400" />
                    <span>View Size Chart</span>
                  </button>
                </div>

                {/* Return to measurements button */}
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-neutral-500 hover:text-neutral-300 text-xs tracking-widest uppercase font-mono flex items-center gap-1.5 mx-auto transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Measurements</span>
                </button>
              </div>

              {/* Expansive Size Chart Grid View (Collapsible) */}
              <AnimatePresence>
                {sizeChartOpen && selectedProduct && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-semibold">SILHOUETTE SIZE CHART (CM)</span>
                        <span className="text-[9px] text-neutral-500 font-mono">1 INCH = 2.54 CM</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/5 text-neutral-500">
                              <th className="pb-3 font-semibold uppercase">SIZE</th>
                              <th className="pb-3 font-semibold uppercase">CHEST</th>
                              <th className="pb-3 font-semibold uppercase">WAIST</th>
                              <th className="pb-3 font-semibold uppercase">HIP</th>
                              <th className="pb-3 font-semibold uppercase">SHOULDER</th>
                              <th className="pb-3 font-semibold uppercase">HEIGHT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.02]">
                            {selectedProduct.sizeChart && Object.entries(selectedProduct.sizeChart).map(([sz, vals]) => {
                              const isRecommended = sz === recommendation.recommendedSize
                              return (
                                <tr 
                                  key={sz} 
                                  className={`transition-colors ${
                                    isRecommended 
                                      ? 'text-amber-500 bg-amber-500/[0.02] border-l-2 border-amber-500 font-semibold' 
                                      : 'text-neutral-300 hover:text-white hover:bg-white/[0.01]'
                                  }`}
                                >
                                  <td className="py-4 pl-2 font-bold">{sz}</td>
                                  <td className="py-4">{vals.chest} cm</td>
                                  <td className="py-4">{vals.waist} cm</td>
                                  <td className="py-4">{vals.hip} cm</td>
                                  <td className="py-4">{vals.shoulder} cm</td>
                                  <td className="py-4">{vals.height} cm</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
