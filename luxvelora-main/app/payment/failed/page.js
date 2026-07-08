'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id') || ''
  const reason = searchParams.get('reason') || 'The payment could not be completed or verified.'

  return (
    <main className="min-h-screen bg-[#fafaf9] noise flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="aurora" />
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative w-full max-w-2xl text-center">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 15 }} className="mx-auto mb-7 w-28 h-28 rounded-full bg-red-500/10 border border-red-400/40 flex items-center justify-center shadow-2xl shadow-red-500/10">
          <AlertCircle className="w-14 h-14 text-red-500" />
        </motion.div>
        <p className="text-[11px] tracking-[0.35em] text-red-500 mb-3">PAYMENT NOT COMPLETED</p>
        <h1 className="text-huge font-display font-bold silver-text mb-4">Let&apos;s Try Again</h1>
        <p className="text-neutral-600 max-w-lg mx-auto mb-8">No confirmed charge has been recorded by Velora. You can retry payment or return home and continue shopping.</p>
        <div className="glass-strong rounded-3xl p-6 border border-black/10 text-left space-y-4 mb-8">
          {orderId && <div className="flex justify-between gap-4"><span className="text-neutral-500">Order ID</span><span className="font-mono text-blue-600 text-right break-all">{orderId}</span></div>}
          <div className="flex justify-between gap-4"><span className="text-neutral-500">Reason</span><span className="text-neutral-800 text-right break-words">{reason}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-blue-600 hover:text-white">
            <Link href="/"><RotateCcw className="w-4 h-4 mr-2" /> Retry Payment</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 rounded-full border-black/15">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Link>
          </Button>
        </div>
      </motion.section>
    </main>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  )
}
