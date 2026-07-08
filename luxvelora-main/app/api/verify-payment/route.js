import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/server/db'

export const runtime = 'nodejs'

function isValidSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET

  if (!secret) {
    throw new Error('Razorpay secret is not configured')
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'hex')
  const signatureBuffer = Buffer.from(String(signature), 'hex')

  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const razorpay_payment_id = String(body.razorpay_payment_id || '').trim()
    const razorpay_order_id = String(body.razorpay_order_id || '').trim()
    const razorpay_signature = String(body.razorpay_signature || '').trim()

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification fields are required' }, { status: 400 })
    }

    const verified = isValidSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
    }

    const database = await getDb()
    await database.collection('razorpay_orders').updateOne(
      { razorpayOrderId: razorpay_order_id },
      {
        $set: {
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString(),
        },
      }
    )

    return NextResponse.json({
      success: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    })
  } catch (error) {
    const message = error?.message === 'Razorpay secret is not configured' || error?.message === 'MONGO_URL is not configured'
      ? error.message
      : 'Unable to verify payment'

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
