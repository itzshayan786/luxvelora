'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || 'Confirmed'
  const paymentId = searchParams.get('payment_id') || 'Verified'

  return (
    <main className="min-h-screen bg-[#fafaf9] noise flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="aurora" />
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative w-full max-w-2xl text-center">
        <motion.div initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }} className="mx-auto mb-7 w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
          <Check className="w-14 h-14 text-emerald-500" />
        </motion.div>
        <p className="text-[11px] tracking-[0.35em] text-emerald-600 mb-3 flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" /> PAYMENT VERIFIED</p>
        <h1 className="text-huge font-display font-bold silver-text mb-4">Order Secured</h1>
        <p className="text-neutral-600 max-w-lg mx-auto mb-8">Your Velora payment was verified successfully. A confirmation will follow with your order and shipping details.</p>
        <div className="glass-strong rounded-3xl p-6 border border-black/10 text-left space-y-4 mb-8">
          <div className="flex justify-between gap-4"><span className="text-neutral-500">Order ID</span><span className="font-mono text-blue-600 text-right break-all">{orderId}</span></div>
          <div className="flex justify-between gap-4"><span className="text-neutral-500">Payment ID</span><span className="font-mono text-emerald-600 text-right break-all">{paymentId}</span></div>
        </div>
        <Button asChild className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">
          <Link href="/"><ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping</Link>
        </Button>
      </motion.section>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
