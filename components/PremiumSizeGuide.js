'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Ruler, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Sliders, 
  HelpCircle,
  Scissors,
  Award,
  ArrowRight
} from 'lucide-react'

export default function PremiumSizeGuide({ onClose, setRoute, onApplySize }) {
  const [activeStep, setActiveStep] = useState(1)
  const [activePart, setActivePart] = useState('neck')
  const [activeSizeCard, setActiveSizeCard] = useState('M')
  const [activeFit, setActiveFit] = useState('regular')
  const [stretchPercent, setStretchPercent] = useState(15)
  const [activeSilhouette, setActiveSilhouette] = useState('regular')

  // Live Recommendation Calculator state
  const [calcHeight, setCalcHeight] = useState(165) // cm
  const [calcWeight, setCalcWeight] = useState(62)  // kg
  const [calcAge, setCalcAge] = useState(28)        // age
  const [calcChest, setCalcChest] = useState(38)    // inches
  const [calcFit, setCalcFit] = useState('regular')
  const [calculatedSize, setCalculatedSize] = useState('M')
  const [confidence, setConfidence] = useState(96)

  // Sizing formula
  useEffect(() => {
    let size = 'M'
    let conf = 95

    if (calcWeight < 52) {
      size = 'XS'
    } else if (calcWeight >= 52 && calcWeight < 60) {
      size = 'S'
    } else if (calcWeight >= 60 && calcWeight < 70) {
      size = 'M'
    } else if (calcWeight >= 70 && calcWeight < 78) {
      size = 'L'
    } else if (calcWeight >= 78 && calcWeight < 88) {
      size = 'XL'
    } else {
      size = 'XXL'
    }

    if (calcChest > 44 && size !== 'XXL') size = 'XXL'
    else if (calcChest > 41 && ['XS', 'S', 'M'].includes(size)) size = 'L'
    else if (calcChest > 38 && ['XS', 'S'].includes(size)) size = 'M'

    // Comfort preference adjustment for age
    if (calcAge > 48) {
      if (size === 'XS') size = 'S'
      else if (size === 'S') size = 'M'
      else if (size === 'M') size = 'L'
      else if (size === 'L') size = 'XL'
      else if (size === 'XL') size = 'XXL'
    }

    if (calcFit === 'slim') {
      conf = 92
    } else if (calcFit === 'oversized') {
      conf = 98
    } else {
      conf = 96
    }

    setCalculatedSize(size)
    setConfidence(conf)
  }, [calcHeight, calcWeight, calcChest, calcFit, calcAge])

  const sizeDetails = {
    XS: { height: '150 - 162 cm', weight: '45 - 55 kg', chest: '34 - 36 in', label: 'Extra Small', desc: 'Sleek structural fit for slender silhouettes.' },
    S: { height: '160 - 170 cm', weight: '55 - 65 kg', chest: '36 - 38 in', label: 'Small Fit', desc: 'Slightly boxy classic fit for leaner silhouettes.' },
    M: { height: '168 - 176 cm', weight: '65 - 75 kg', chest: '38 - 40 in', label: 'Medium Fit', desc: 'Perfect daily drop shoulder drape for average builds.' },
    L: { height: '174 - 182 cm', weight: '75 - 85 kg', chest: '40 - 42 in', label: 'Large Fit', desc: 'Signature oversized Velora cut with beautiful shoulder falls.' },
    XL: { height: '180 - 188 cm', weight: '85 - 95 kg', chest: '42 - 45 in', label: 'Extra Large Fit', desc: 'Streetwear-forward bold volume with maximum comfort.' },
    XXL: { height: '186 - 195 cm', weight: '95 - 110 kg', chest: '45 - 48 in', label: 'Double Extra Large', desc: 'Substantial architectural cut for strong, tall builds.' },
  }

  const measurementTips = {
    neck: { title: 'Neck Measurement', tip: 'Wrap tape around the base of your neck where a collar sits, leaving room for one finger.', value: '14" - 15.5"' },
    shoulder: { title: 'Shoulders', tip: 'Measure from the outer edge of one shoulder bone straight across your back to the other.', value: '18" - 21"' },
    chest: { title: 'Chest Width', tip: 'Measure around the absolute fullest part of your chest, keeping tape snug and parallel to the floor.', value: '38" - 48"' },
    sleeve: { title: 'Sleeve Length', tip: 'Measure from your shoulder tip down to your wrist bone for our signature drop-sleeve draping.', value: '23" - 26"' },
    waist: { title: 'Waist Size', tip: 'Measure around your natural waistline (usually near your belly button) where you wear your trousers.', value: '30" - 42"' },
  }

  const steps = [
    { id: 1, label: 'Measurements', desc: 'Body Measurements' },
    { id: 2, label: 'Fit Style', desc: 'Select Fit Preference' },
    { id: 3, label: 'Fabric Feel', desc: 'Select Fabric Stretch' },
    { id: 4, label: 'Size Calculator', desc: 'Personal Size Recommendation' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-white selection:text-black font-sans relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* Static Header */}
      <div className="sticky top-0 h-20 px-6 md:px-12 flex items-center justify-between z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Ruler className="w-4 h-4 text-amber-500" />
          <span className="font-display font-semibold tracking-[0.25em] text-xs uppercase text-neutral-200">VELORA SIZE ASSISTANT</span>
        </div>
        <button 
          onClick={onClose}
          className="px-5 py-2 rounded-full border border-white/10 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300"
        >
          Close Assistant
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20 relative z-10">
        
        {/* Top Hero Heading */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 mb-4">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Interactive Sizing Guide</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4">Find Your Perfect Fit</h1>
          <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed">
            At Velora, we design garments that offer a beautiful drape and daily comfort. Use our interactive size assistant to find your correct size in seconds.
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto pb-px mb-12 scrollbar-none">
          {steps.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStep(st.id)}
              className={`flex-shrink-0 pb-4 px-1 mr-8 md:mr-16 text-left border-b-2 transition-all duration-300 ${
                activeStep === st.id 
                  ? 'border-amber-500 text-white' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <p className="text-[10px] font-mono tracking-widest uppercase mb-1">STEP 0{st.id}</p>
              <p className="text-sm font-medium tracking-wide">{st.label}</p>
            </button>
          ))}
        </div>

        {/* Dynamic Content Sections */}
        <div className="min-h-[50vh]">
          
          {/* STEP 1: Precision Anatomy */}
          {activeStep === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-2 block">01 / PHYSICAL ANATOMY</span>
                  <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight">How to Measure</h2>
                  <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                    Select a zone below to learn the optimal way to measure your body for a Velora drape.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries(measurementTips).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setActivePart(key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        activePart === key 
                          ? 'bg-neutral-900 border-amber-500/40 text-white' 
                          : 'bg-transparent border-white/5 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider">{item.title}</span>
                        <span className="text-[10px] font-mono text-neutral-400">{item.value}</span>
                      </div>
                      {activePart === key && (
                        <p className="text-neutral-400 text-xs font-light mt-2 leading-relaxed">{item.tip}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Illustration Card */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 max-w-md w-full flex flex-col items-center justify-center text-center">
                  <Ruler className="w-12 h-12 text-amber-500/80 mb-6" />
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 mb-2 uppercase">Currently Focused Zone</span>
                  <h3 className="text-lg font-medium text-white mb-2 uppercase tracking-wide">
                    {measurementTips[activePart].title}
                  </h3>
                  <div className="h-px w-16 bg-amber-500/40 my-3" />
                  <p className="text-neutral-400 text-xs font-light leading-relaxed max-w-xs">
                    {measurementTips[activePart].tip}
                  </p>
                  <div className="mt-8 bg-neutral-950/80 border border-white/5 px-6 py-3 rounded-lg text-xs font-mono tracking-wider text-neutral-200">
                    Expected Range: {measurementTips[activePart].value}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Choose Silhouette */}
          {activeStep === 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="max-w-xl">
                <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-2 block">02 / SILHOUETTE CRAFT</span>
                <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight">The Volumetric Index</h2>
                <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                  Our fits are tailored to fall perfectly. Select a size card below to review specific dimensions and height/weight standards.
                </p>
              </div>

              {/* Fit toggle */}
              <div className="flex gap-2 max-w-sm border-b border-white/5 pb-4">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setActiveSizeCard(sz)}
                    className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg border transition-all duration-300 ${
                      activeSizeCard === sz 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent border-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Card specs */}
              <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-900/30 border border-white/5 rounded-2xl p-6 md:p-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">SPECIFICATION CARD</span>
                  <h3 className="text-xl font-medium tracking-tight text-white">{sizeDetails[activeSizeCard].label}</h3>
                  <p className="text-neutral-400 text-xs md:text-sm font-light leading-relaxed">{sizeDetails[activeSizeCard].desc}</p>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[9px] font-mono text-neutral-500 tracking-widest">HEIGHT</p>
                      <p className="text-xs font-medium text-white mt-1">{sizeDetails[activeSizeCard].height}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-neutral-500 tracking-widest">WEIGHT</p>
                      <p className="text-xs font-medium text-white mt-1">{sizeDetails[activeSizeCard].weight}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-neutral-500 tracking-widest">CHEST RANGE</p>
                      <p className="text-xs font-medium text-white mt-1">{sizeDetails[activeSizeCard].chest}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-white/5 bg-neutral-950/80 rounded-xl p-6 space-y-4 text-center">
                  <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">STYLING NOTE</span>
                  <p className="text-neutral-400 text-xs leading-relaxed italic font-light">
                    "If you prefer a closer, traditional fit, we recommend selecting one size smaller than your standard size. For our signature flowing luxury silhouette, stick to your calculated recommendation."
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Fabric Stretch */}
          {activeStep === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-2 block">03 / PHYSICAL DYNAMICS</span>
                  <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight">Fabric Elasticity</h2>
                  <p className="text-neutral-400 text-xs md:text-sm font-light mt-2 leading-relaxed">
                    Velora's premium silks and pashminas contain natural elasticity. Adjust the stretch slider to see how fiber tension behaves under load.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase flex justify-between">
                    <span>FIBER TENSION (STRETCH)</span>
                    <span className="text-amber-500">+{stretchPercent}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="45" 
                    value={stretchPercent}
                    onChange={(e) => setStretchPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
                  />
                </div>

                <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-500/80 flex-shrink-0 mt-0.5" />
                  <p className="text-neutral-400 text-xs leading-relaxed font-light">
                    Our mulberry silk-cotton blends undergo strict tensile stress testing, retaining complete structural shape and preventing draping sagging.
                  </p>
                </div>
              </div>

              {/* Right column: Interactive Visualizer */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block">SIMULATED WEAVE INTEGRITY</span>
                  
                  {/* Visual Elastic Bar */}
                  <div className="h-16 bg-neutral-950 border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <motion.div 
                      style={{ scaleX: 1 + (stretchPercent / 100) }}
                      className="h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20 w-3/4 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    />
                  </div>

                  <div className="text-xs text-neutral-400 font-light leading-relaxed">
                    {stretchPercent === 0 ? (
                      "No structural strain. Complete shape recovery."
                    ) : stretchPercent < 20 ? (
                      "Perfect micro-adaptation. Material molds gently to curves."
                    ) : (
                      "Higher mobility allowance. Fiber retains luxury soft texture."
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Live Recommendation Calculator */}
          {activeStep === 4 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-12 gap-12 items-center"
            >
              <div className="lg:col-span-6 space-y-6 bg-neutral-900/30 border border-white/5 rounded-2xl p-6 md:p-8">
                <div>
                  <span className="text-xs tracking-[0.3em] text-amber-500 uppercase font-semibold mb-2 block">04 / SIZE VERDICT</span>
                  <h2 className="text-2xl font-display font-medium tracking-tight">Personal Size Calculator</h2>
                  <p className="text-neutral-400 text-xs font-light mt-1">
                    Enter your dimensions for an instant calculation of your perfect size.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Height slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                      <span>HEIGHT</span>
                      <span className="text-white">{calcHeight} cm</span>
                    </div>
                    <input 
                      type="range" 
                      min="145" 
                      max="210" 
                      value={calcHeight}
                      onChange={(e) => setCalcHeight(Number(e.target.value))}
                      className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
                    />
                  </div>

                  {/* Weight slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                      <span>WEIGHT</span>
                      <span className="text-white">{calcWeight} kg</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="130" 
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
                    />
                  </div>

                  {/* Age slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                      <span>AGE</span>
                      <span className="text-white">{calcAge} years</span>
                    </div>
                    <input 
                      type="range" 
                      min="16" 
                      max="90" 
                      value={calcAge}
                      onChange={(e) => setCalcAge(Number(e.target.value))}
                      className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
                    />
                  </div>

                  {/* Chest slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                      <span>CHEST WIDTH</span>
                      <span className="text-white">{calcChest} inches</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="54" 
                      value={calcChest}
                      onChange={(e) => setCalcChest(Number(e.target.value))}
                      className="w-full accent-amber-500 h-[2px] bg-neutral-800 rounded-lg cursor-pointer outline-none"
                    />
                  </div>

                  {/* Fit Style buttons */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">PREFERRED DRAPE STYLE</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'slim', label: 'Tailored' },
                        { id: 'regular', label: 'Classic' },
                        { id: 'oversized', label: 'Architectural' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCalcFit(item.id)}
                          className={`py-2 px-1 text-center rounded-lg border text-xs tracking-wider transition-all duration-300 uppercase ${
                            calcFit === item.id 
                              ? 'bg-white text-black border-white font-semibold' 
                              : 'bg-transparent border-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Results display */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="bg-neutral-900/60 border border-amber-500/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
                  <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block">RECOMMENDED SILHOUETTE</span>
                  
                  <div className="text-7xl font-display font-bold text-white relative inline-block select-none py-2 px-6 bg-neutral-950 rounded-xl border border-white/5">
                    {calculatedSize}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-neutral-400 font-light">Calculated Fit Confidence</p>
                    <p className="text-lg font-medium text-amber-500 font-mono">{confidence}% Accuracy Score</p>
                  </div>

                  <div className="h-px bg-white/5" />

                  <p className="text-neutral-400 text-xs leading-relaxed font-light">
                    Based on a height of <span className="text-white font-medium">{calcHeight}cm</span> and weight of <span className="text-white font-medium">{calcWeight}kg</span>, your body maps perfectly to our luxury <span className="text-white font-medium">{calculatedSize}</span> cut with high drapery retention.
                  </p>

                  <button 
                    onClick={() => {
                      if (onApplySize) {
                        onApplySize(calculatedSize)
                      } else {
                        setRoute({ view: 'shop' })
                      }
                    }}
                    className="w-full bg-white text-neutral-950 hover:bg-neutral-900 hover:text-white h-12 rounded-full font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border border-transparent hover:border-white/10"
                  >
                    <span>{onApplySize ? `Apply Recommended Size: ${calculatedSize}` : `Shop in ${calculatedSize}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  )
}
