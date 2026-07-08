import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getDb } from '@/lib/server/db'

export const runtime = 'nodejs'

const CURRENCY = 'INR'
const FREE_SHIPPING_THRESHOLD = 1499
const STANDARD_SHIPPING = 99
const COUPONS = {
  VELORA10: { type: 'pct', value: 10, min: 0, label: '10% off' },
  FUTURE20: { type: 'pct', value: 20, min: 2000, label: '20% off (min ₹2000)' },
  FLAT500: { type: 'flat', value: 500, min: 3000, label: '₹500 off (min ₹3000)' },
  FIRST15: { type: 'pct', value: 15, min: 1500, label: '15% off first order' },
}

const toPaise = (amount) => Math.round(Number(amount) * 100)

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured')
  }

  return new Razorpay({ key_id, key_secret })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const productId = String(body.productId || body.id || '').trim()
    const requestedItems = Array.isArray(body.items) && body.items.length
      ? body.items.map((item) => ({
        productId: String(item.productId || item.id || '').trim(),
        quantity: Math.max(1, Math.min(10, Number.parseInt(item.quantity || item.qty || 1, 10) || 1)),
        size: item.size || '',
        color: item.color || '',
      })).filter((item) => item.productId)
      : [{
        productId,
        quantity: Math.max(1, Math.min(10, Number.parseInt(body.quantity || body.qty || 1, 10) || 1)),
        size: body.size || '',
        color: body.color || '',
      }].filter((item) => item.productId)

    if (!requestedItems.length) {
      return NextResponse.json({ error: 'Product id is required' }, { status: 400 })
    }

    const database = await getDb()
    const productIds = [...new Set(requestedItems.map((item) => item.productId))]
    const products = await database.collection('products').find({ id: { $in: productIds } }).toArray()
    const productMap = new Map(products.map((product) => [product.id, product]))

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const outOfStock = requestedItems.find((item) => {
      const product = productMap.get(item.productId)
      return product?.stock !== undefined && Number(product.stock) <= 0
    })

    if (outOfStock) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 409 })
    }

    const pricedItems = requestedItems.map((item) => {
      const product = productMap.get(item.productId)
      return {
        ...item,
        name: product.name,
        image: product.images?.[0] || '',
        price: Number(product.price),
        mrp: Number(product.mrp || product.price),
        lineTotal: Number(product.price) * item.quantity,
        lineMrp: Number(product.mrp || product.price) * item.quantity,
      }
    })

    const subtotal = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const mrpTotal = pricedItems.reduce((sum, item) => sum + item.lineMrp, 0)
    const productDiscount = Math.max(0, mrpTotal - subtotal)
    const couponCode = String(body.coupon || '').trim().toUpperCase()
    const coupon = couponCode ? COUPONS[couponCode] : null

    if (couponCode && !coupon) {
      return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 })
    }

    if (coupon && subtotal < coupon.min) {
      return NextResponse.json({ error: 'Coupon minimum cart value is not met' }, { status: 400 })
    }

    const couponDiscount = coupon ? (coupon.type === 'pct' ? Math.round(subtotal * coupon.value / 100) : coupon.value) : 0
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
    const total = Math.max(0, subtotal + shipping - couponDiscount)
    const amount = toPaise(total)
    const receipt = `VEL${Date.now().toString(36).toUpperCase()}`

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount,
      currency: CURRENCY,
      receipt,
      notes: {
        productIds: productIds.join(','),
        itemCount: String(pricedItems.length),
      },
    })

    await database.collection('razorpay_orders').insertOne({
      receipt,
      razorpayOrderId: order.id,
      items: pricedItems,
      amount,
      currency: CURRENCY,
      subtotal,
      mrp: mrpTotal,
      productDiscount,
      coupon: coupon ? { code: couponCode, label: coupon.label, discount: couponDiscount } : null,
      discount: couponDiscount,
      shipping,
      total,
      status: 'created',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      order_id: order.id,
      amount,
      currency: CURRENCY,
      summary: {
        product: pricedItems.length === 1 ? {
          id: pricedItems[0].productId,
          name: pricedItems[0].name,
          image: pricedItems[0].image,
          price: pricedItems[0].price,
          mrp: pricedItems[0].mrp,
        } : null,
        items: pricedItems,
        quantity: pricedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        mrp: mrpTotal,
        productDiscount,
        coupon: coupon ? { code: couponCode, label: coupon.label, discount: couponDiscount } : null,
        discount: couponDiscount,
        shipping,
        total,
      },
    })
  } catch (error) {
    const message = error?.message === 'Razorpay credentials are not configured' || error?.message === 'MONGO_URL is not configured'
      ? error.message
      : 'Unable to create payment order'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
