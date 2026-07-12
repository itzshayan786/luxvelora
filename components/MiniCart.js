'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, X, Sparkles } from 'lucide-react'
import { useShop } from '@/app/page' // Wait, page exports App, let's make sure context is imported correctly.
// Actually, we can import or hook into useShop if it's exported or defined in page.js, or we can just import from app context if we structure it.
// Wait! Let's check if useShop is exported from page.js.
// Line 24: const useShop = () => useContext(ShopCtx)
// It is not currently exported! We should export useShop and ShopCtx from app/page.js so that we can import them in our other premium components.
// That is extremely clean and standard.

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

const LuxuryPriceCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = displayValue
    const end = value
    if (start === end) return

    const totalDuration = 600 // ms
    const startTime = performance.now()

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / totalDuration, 1)
      const ease = progress * (2 - progress) // easeOutQuad
      const current = Math.floor(start + (end - start) * ease)
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(end)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return <span>{fmt(displayValue)}</span>
}

export default function MiniCart({ useShop }) {
  if (!useShop) return null;
  const shop = useShop();
  if (!shop) return null;
  const { cart, updateCart, removeFromCart, setRoute, cartOpen, setCartOpen } = shop;

  const isOpen = cartOpen;
  const onClose = () => setCartOpen(false);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }, [cart])

  const freeShippingLimit = 1499
  const isFreeShipping = subtotal >= freeShippingLimit
  const amountNeededForFree = freeShippingLimit - subtotal

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md"
          />

          {/* Sliding Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-[130] w-full max-w-md bg-neutral-950 text-white shadow-2xl border-l border-white/10 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span className="font-display font-semibold tracking-wider text-sm uppercase">Your Bag ({cart.reduce((s, i) => s + i.qty, 0)})</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Alert banner */}
            {cart.length > 0 && (
              <div className="bg-neutral-900 border-b border-white/5 py-3 px-6 text-center text-xs tracking-wider">
                {isFreeShipping ? (
                  <p className="text-amber-400 flex items-center justify-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> YOU QUALIFY FOR FREE DELIVERY!
                  </p>
                ) : (
                  <p className="text-neutral-400">
                    Add <span className="text-white font-semibold">{fmt(amountNeededForFree)}</span> more for free delivery
                  </p>
                )}
              </div>
            )}

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-neutral-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-semibold text-sm tracking-widest uppercase">Your Bag is Empty</h3>
                    <p className="text-xs text-neutral-500 font-light max-w-[200px]">Add premium items from our festive or everyday collection to get started.</p>
                  </div>
                  <button 
                    onClick={() => { onClose(); setRoute({ view: 'shop' }) }}
                    className="px-6 py-2.5 rounded-full border border-white/20 text-xs tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {cart.map((item, idx) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className="p-4 rounded-xl bg-neutral-900/40 border border-white/5 flex gap-4"
                      >
                        {/* Image */}
                        <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-950 flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex justify-between gap-2">
                              <h4 className="text-xs font-semibold leading-snug line-clamp-1 uppercase text-neutral-100">{item.name}</h4>
                              <button 
                                onClick={() => removeFromCart(item.key)}
                                className="text-neutral-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">SIZE {item.size} · COLOR {item.color}</p>
                          </div>

                          <div className="flex justify-between items-end pt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1 scale-90 origin-left">
                              <button 
                                onClick={() => item.qty > 1 ? updateCart(item.key, item.qty - 1) : removeFromCart(item.key)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 text-neutral-400 hover:text-white transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-mono">{item.qty}</span>
                              <button 
                                onClick={() => updateCart(item.key, item.qty + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 text-neutral-400 hover:text-white transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-semibold font-mono tracking-tight text-white">{fmt(item.price * item.qty)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Checkout Actions */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-neutral-950 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs tracking-wider font-semibold text-neutral-400 uppercase">
                    <span>ESTIMATED SUBTOTAL</span>
                    <span className="text-white font-mono"><LuxuryPriceCounter value={subtotal} /></span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 tracking-wider">
                    <span>DELIVERY CHARGES</span>
                    <span className="uppercase">{isFreeShipping ? 'FREE' : fmt(99)}</span>
                  </div>
                  {!isFreeShipping && (
                    <div className="flex justify-between text-[10px] text-neutral-500 tracking-wider">
                      <span>DELIVERY FEE</span>
                      <span className="font-mono">{fmt(99)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose()
                      setRoute({ view: 'checkout' })
                    }}
                    className="w-full relative overflow-hidden group bg-white text-black font-display font-semibold text-xs tracking-widest uppercase py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2"
                  >
                    {/* Subtle continuous golden pulse sheen */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>

                <p className="text-[9px] text-center text-neutral-600 font-mono tracking-widest uppercase">
                  ◆ SECURE TRANSACTION · CASH ON DELIVERY AVAILABLE
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
