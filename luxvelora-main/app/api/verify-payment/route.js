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

function createOrderId() {
  return 'VEL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase()
}

function cleanDoc(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const razorpay_payment_id = String(body.razorpay_payment_id || '').trim()
    const razorpay_order_id = String(body.razorpay_order_id || '').trim()
    const razorpay_signature = String(body.razorpay_signature || '').trim()
    const orderPayload = body.orderPayload && typeof body.orderPayload === 'object' ? body.orderPayload : null

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification fields are required' }, { status: 400 })
    }

    const verified = isValidSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
    }

    const database = await getDb()
    const razorpayOrder = await database.collection('razorpay_orders').findOne({ razorpayOrderId: razorpay_order_id })

    if (!razorpayOrder) {
      return NextResponse.json({ success: false, error: 'Razorpay order not found' }, { status: 404 })
    }

    const existingOrder = await database.collection('orders').findOne({ razorpayOrderId: razorpay_order_id })

    if (existingOrder) {
      await database.collection('razorpay_orders').updateOne(
        { razorpayOrderId: razorpay_order_id },
        {
          $set: {
            status: 'paid',
            razorpayPaymentId: razorpay_payment_id,
            verifiedAt: new Date().toISOString(),
            checkoutOrderId: existingOrder.id,
          },
        }
      )

      return NextResponse.json({
        success: true,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        order: cleanDoc(existingOrder),
      })
    }

    const now = new Date().toISOString()
    const customerOrder = orderPayload ? {
      id: createOrderId(),
      items: Array.isArray(orderPayload.items) && orderPayload.items.length ? orderPayload.items : razorpayOrder.items,
      address: orderPayload.address || null,
      email: orderPayload.email || '',
      name: orderPayload.name || '',
      phone: orderPayload.phone || '',
      payment: 'razorpay',
      coupon: orderPayload.coupon || razorpayOrder.coupon?.code || null,
      subtotal: Number(razorpayOrder.subtotal || orderPayload.subtotal || 0),
      shipping: Number(razorpayOrder.shipping || orderPayload.shipping || 0),
      discount: Number(razorpayOrder.discount || orderPayload.discount || 0),
      total: Number(razorpayOrder.total || orderPayload.total || 0),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'confirmed',
      tracking: [
        { stage: 'confirmed', at: now, label: 'Order Confirmed' },
        { stage: 'processing', at: null, label: 'Processing at warehouse' },
        { stage: 'shipped', at: null, label: 'Shipped' },
        { stage: 'out-for-delivery', at: null, label: 'Out for delivery' },
        { stage: 'delivered', at: null, label: 'Delivered' },
      ],
      createdAt: now,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    } : null

    if (customerOrder) {
      await database.collection('orders').insertOne(customerOrder)
    }

    await database.collection('razorpay_orders').updateOne(
      { razorpayOrderId: razorpay_order_id },
      {
        $set: {
          status: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          verifiedAt: new Date().toISOString(),
          ...(customerOrder ? { checkoutOrderId: customerOrder.id } : {}),
        },
      }
    )

    return NextResponse.json({
      success: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      order: cleanDoc(customerOrder),
    })
  } catch (error) {
    const message = error?.message === 'Razorpay secret is not configured' || error?.message === 'MONGO_URL is not configured'
      ? error.message
      : 'Unable to verify payment'

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
