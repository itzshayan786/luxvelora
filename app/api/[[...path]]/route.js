import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb, getGemini, validateEnv } from '@/lib/server-init'
import { cookies } from 'next/headers'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  sendEmail,
  getWelcomeEmailHtml,
  getVerificationEmailHtml,
  getForgotPasswordOtpEmailHtml,
  getPasswordChangedEmailHtml
} from '@/lib/email'

export const dynamic = "force-dynamic";

let isMock = false

// In-memory mock database
const MEMORY_DB = {
  products: null,
  orders: [],
  payments: [],
  users: [],
  newsletter: [],
  reviews: [],
  contacts: [],
  conversations: []
};

function createMockDb() {
  if (MEMORY_DB.products === null) {
    MEMORY_DB.products = [...(SEED_PRODUCTS || [])];
  }
  return {
    collection(colName) {
      if (!MEMORY_DB[colName]) {
        MEMORY_DB[colName] = [];
      }
      const data = MEMORY_DB[colName];

      return {
        async countDocuments() {
          return data.length;
        },
        async insertMany(docs) {
          data.push(...docs);
          return { insertedCount: docs.length };
        },
        async insertOne(doc) {
          data.push(doc);
          return { insertedId: doc.id || doc._id || Math.random().toString() };
        },
        async findOne(query) {
          return data.find(item => matchesQuery(item, query)) || null;
        },
        find(query) {
          let filtered = data.filter(item => matchesQuery(item, query));
          
          return {
            sort(sortObj) {
              const keys = Object.keys(sortObj || {});
              if (keys.length > 0) {
                const key = keys[0];
                const order = sortObj[key];
                filtered.sort((a, b) => {
                  if (a[key] < b[key]) return -1 * order;
                  if (a[key] > b[key]) return 1 * order;
                  return 0;
                });
              }
              return this;
            },
            limit(n) {
              filtered = filtered.slice(0, n);
              return this;
            },
            async toArray() {
              return filtered;
            }
          };
        },
        async updateOne(query, update, options = {}) {
          let item = data.find(i => matchesQuery(i, query));
          if (!item && options.upsert) {
            item = {};
            data.push(item);
          }
          if (item) {
            if (update.$set) {
              Object.assign(item, update.$set);
            }
            if (update.$setOnInsert && options.upsert) {
              Object.assign(item, update.$setOnInsert);
            }
            if (update.$push) {
              for (const [key, value] of Object.entries(update.$push)) {
                if (!item[key]) item[key] = [];
                if (value && typeof value === 'object' && value.$each) {
                  item[key].push(...value.$each);
                } else {
                  item[key].push(value);
                }
              }
            }
            return { modifiedCount: 1, upsertedCount: options.upsert ? 1 : 0 };
          }
          return { modifiedCount: 0 };
        }
      };
    }
  };
}

function matchesQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true;
  
  if (query.$or) {
    return query.$or.some(subQuery => matchesQuery(item, subQuery));
  }
  
  for (const [key, value] of Object.entries(query)) {
    if (value && typeof value === 'object') {
      if (value.$gte !== undefined || value.$lte !== undefined) {
        const val = item[key];
        if (value.$gte !== undefined && val < value.$gte) return false;
        if (value.$lte !== undefined && val > value.$lte) return false;
        continue;
      }
      if (value.$regex !== undefined) {
        const val = item[key] || '';
        const regex = new RegExp(value.$regex, value.$options || '');
        if (!regex.test(val)) return false;
        continue;
      }
      if (value.$ne !== undefined) {
        if (item[key] === value.$ne) return false;
        continue;
      }
    }
    if (item[key] !== value) return false;
  }
  return true;
}
// Product seed data — premium fashion mockups
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Noor Jahan Silk Anarkali Kurta', slug: 'noor-jahan-silk-anarkali-kurta', category: 'ethnic wear', gender: 'women', price: 3499, mrp: 5999, discount: 42, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800','https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800'], colors: ['Emerald Green','Royal Fuchsia','Void Black'], sizes: ['S','M','L','XL','XXL'], stock: 42, rating: 4.8, reviews: 284, tags: ['bestseller','new'], description: 'An exquisite floor-length pure silk Anarkali kurta featuring handcrafted zardozi motifs and a matching silk dupatta. A masterpiece of traditional design.', material: '100% Mulberry Silk', badge: 'BESTSELLER' },
  { id: 'p2', name: 'Mehrunissa Georgette Kurti', slug: 'mehrunissa-georgette-kurti', category: 'ethnic wear', gender: 'women', price: 2799, mrp: 4499, discount: 38, images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800'], colors: ['Fuchsia Pink','Ivory White'], sizes: ['XS','S','M','L','XL'], stock: 68, rating: 4.7, reviews: 156, tags: ['new'], description: 'Fuchsia-pink premium georgette kurti detailed with ornate threadwork and mini-mirror embellishments for festive light.', material: 'Premium Georgette Silk', badge: 'NEW' },
  { id: 'p3', name: 'Zeenat Royal Velvet Kurti Set', slug: 'zeenat-royal-velvet-kurti-set', category: 'ethnic wear', gender: 'women', price: 4299, mrp: 6999, discount: 39, images: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800','https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800'], colors: ['Ruby Red','Deep Sapphire'], sizes: ['XS','S','M','L'], stock: 24, rating: 4.9, reviews: 412, tags: ['bestseller','sale'], description: 'Luxe ruby-red velvet tunic paired with matching silk palazzos, featuring stunning traditional Kashmiri tilla embroidery.', material: 'Mulberry Velvet Blend', badge: 'LIMITED' },
  { id: 'p4', name: 'Dilkash Chanderi Tunic', slug: 'dilkash-chanderi-tunic', category: 'ethnic wear', gender: 'women', price: 5499, mrp: 8999, discount: 39, images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800'], colors: ['Ivory Gold','Peach Rose'], sizes: ['XS','S','M','L','XL'], stock: 18, rating: 4.9, reviews: 89, tags: ['new','bestseller'], description: 'Lightweight, sheer ivory Chanderi cotton-silk tunic with fine gold zari borders and a breathable, breezy feel.', material: 'Chanderi Cotton Silk', badge: 'NEW' },
  { id: 'p5', name: 'Gulrukh Organza Kurti Set', slug: 'gulrukh-organza-kurti-set', category: 'ethnic wear', gender: 'women', price: 1899, mrp: 2999, discount: 37, images: ['https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800'], colors: ['Powder Blue','Mint Green'], sizes: ['S','M','L','XL','XXL'], stock: 120, rating: 4.6, reviews: 542, tags: ['bestseller'], description: 'Powder-blue organza tunic set with delicate scallop borders and pastel floral handloom embroideries.', material: 'Pure Organza Silk', badge: 'BESTSELLER' },
  { id: 'p6', name: 'Mumtaz Chikankari Kurta', slug: 'mumtaz-chikankari-kurta', category: 'ethnic wear', gender: 'women', price: 3299, mrp: 4999, discount: 34, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800'], colors: ['Lavender','Lilac'], sizes: ['XS','S','M','L','XL'], stock: 55, rating: 4.7, reviews: 203, tags: ['new'], description: 'Lavender pure georgette kurta detailed with hand-embroidered Lucknowi chikankari shadow work, direct from our weavers.', material: 'Georgette with Handwork', badge: 'NEW' },
  { id: 'p7', name: 'Mastani Banarasi Brocade Tunic', slug: 'mastani-banarasi-brocade-tunic', category: 'ethnic wear', gender: 'women', price: 3899, mrp: 5999, discount: 35, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800'], colors: ['Mustard Gold','Crimson'], sizes: ['S','M','L','XL','XXL'], stock: 33, rating: 4.8, reviews: 178, tags: ['sale','bestseller'], description: 'A royal mustard-yellow Banarasi brocade tunic featuring metallic gold motifs and a structured modern collar.', material: 'Banarasi Silk Brocade', badge: 'SALE' },
  { id: 'p8', name: 'Zaria Kashmiri Pashmina Kurti', slug: 'zaria-kashmiri-pashmina-kurti', category: 'ethnic wear', gender: 'women', price: 2499, mrp: 3999, discount: 38, images: ['https://images.unsplash.com/photo-1631856955355-15a00bd7708c?auto=format&fit=crop&w=800'], colors: ['Charcoal Grey','Burgundy'], sizes: ['XS','S','M','L'], stock: 40, rating: 4.8, reviews: 312, tags: ['bestseller'], description: 'Elegant charcoal-grey fine pashmina-blend winter kurti adorned with rich Kashmiri borders.', material: 'Fine Pashmina Blend', badge: 'BESTSELLER' },
  { id: 'p9', name: 'Inayat Cotton-Silk Daily Kurti', slug: 'inayat-cotton-silk-daily-kurti', category: 'ethnic wear', gender: 'women', price: 4599, mrp: 7499, discount: 39, images: ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800'], colors: ['Turquoise Blue','Mustard'], sizes: ['S','M','L','XL'], stock: 28, rating: 4.7, reviews: 145, tags: ['new'], description: 'Turquoise-blue daily wear luxury kurta crafted from breathable, premium cotton-silk.', material: 'Premium Cotton Silk Blend', badge: 'NEW' },
  { id: 'p10', name: 'Afreen Sequin Kurta Set', slug: 'afreen-sequin-kurta-set', category: 'ethnic wear', gender: 'women', price: 3999, mrp: 6499, discount: 38, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&v=10'], colors: ['Sapphire Blue','Emerald'], sizes: ['XS','S','M','L'], stock: 22, rating: 4.9, reviews: 98, tags: ['limited','new'], description: 'Deep sapphire-blue cotton-satin kurti featuring a geometric sequin-embroidered neckline.', material: 'Cotton Satin with Sequins', badge: 'LIMITED' },
  { id: 'p11', name: 'Sultana Banarasi Brocade Kurta', slug: 'sultana-banarasi-brocade-kurta', category: 'ethnic wear', gender: 'women', price: 4199, mrp: 6299, discount: 33, images: ['https://images.unsplash.com/photo-1615214079545-024a71440ca9?auto=format&fit=crop&w=800'], colors: ['Teal Blue','Royal Maroon'], sizes: ['S','M','L','XL'], stock: 36, rating: 4.6, reviews: 76, tags: ['new'], description: 'Teal-blue luxurious silk-brocade kurta featuring elegant traditional zari borders.', material: 'Silk Brocade with Zari', badge: 'NEW' },
  { id: 'p12', name: 'Laila Natural Linen-Cotton Tunic', slug: 'laila-natural-linen-cotton-tunic', category: 'ethnic wear', gender: 'women', price: 1999, mrp: 2999, discount: 33, images: ['https://images.unsplash.com/photo-1611590524161-597467324836?auto=format&fit=crop&w=800'], colors: ['Natural Beige','Soft Olive'], sizes: ['XS','S','M','L','XL'], stock: 88, rating: 4.5, reviews: 234, tags: ['sale'], description: 'Minimalist beige high-thread-count linen tunic with delicate hand-stitched running lines.', material: 'Organic Linen Cotton Blend', badge: 'SALE' },
  // TEMPORARY TESTING PRODUCT - START
  // This is a temporary product used only for Razorpay payment testing before production launch.
  // Can be safely removed later.
  {
    id: 'p-payment-test',
    name: 'VELORA Payment Test',
    slug: 'velora-payment-test',
    category: 'Testing',
    gender: 'unisex',
    price: 1,
    mrp: 99,
    discount: 99,
    images: [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23fcfbf9"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" font-weight="600" fill="%230a0a0a" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.15em">VELORA</text><text x="50%" y="54%" font-family="sans-serif" font-size="14" fill="%23737373" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.05em">PAYMENT TEST (₹1)</text></svg>'
    ],
    colors: ['Default'],
    sizes: ['One Size'],
    stock: 999,
    rating: 5.0,
    reviews: 1,
    tags: ['testing'],
    description: 'Temporary product used only for Razorpay payment testing before production launch.',
    material: 'Premium Digital Voucher',
    badge: 'TESTING'
  },
  // TEMPORARY TESTING PRODUCT - END
  {
    id: 'p13',
    name: 'VELORA Royal Fuchsia Embroidered Kurti Set',
    slug: 'velora-royal-fuchsia-embroidered-kurti-set',
    category: 'ethnic wear',
    gender: 'women',
    price: 1199,
    mrp: 3999,
    discount: 70,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w0NjY2NzF8MHwxfHNlYXJjaHwyfHxwaW5rJTIwc2FyZWV8ZW58MHx8fDE3ODMxMzY1Njd8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w0NjY2NzF8MHwxfHNlYXJjaHwyfHxwaW5rJTIwc2FyZWV8ZW58MHx8fDE3ODMxMzY1Njd8MA&ixlib=rb-4.1.0&q=85&v=2',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w0NjY2NzF8MHwxfHNlYXJjaHwyfHxwaW5rJTIwc2FyZWV8ZW58MHx8fDE3ODMxMzY1Njd8MA&ixlib=rb-4.1.0&q=85&v=3'
    ],
    colors: ['Royal Fuchsia'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 47,
    rating: 4.9,
    reviews: 324,
    tags: ['bestseller', 'new', 'featured'],
    description: "A premium embroidered kurta set featuring luxurious thread embroidery with matching wide-leg bottoms and designer dupatta. Crafted for festive occasions, weddings and elegant celebrations while maintaining VELORA's premium aesthetic.",
    material: 'Premium Silk Blend',
    badge: 'BESTSELLER',
    subcategory: 'Ethnic Wear',
    collection: 'Luxury Festive Collection',
    features: [
      'Premium Silk Blend',
      'Luxury Embroidery',
      'Matching Dupatta',
      'Wide Leg Palazzo',
      'Soft Premium Fabric',
      'Breathable',
      'Wedding Collection',
      'Festive Wear'
    ]
  }
]

async function seedIfEmpty() {
  const database = await getDb()
  const hasOldHoodies = await database.collection('products').findOne({ name: 'Nebula Oversized Hoodie' })
  if (hasOldHoodies) {
    console.log("[VELORA] Old streetwear products detected. Purging and re-seeding with premium ethnic kurtis.")
    await database.collection('products').deleteMany({})
    await database.collection('products').insertMany(SEED_PRODUCTS)
  } else {
    const count = await database.collection('products').countDocuments()
    if (count === 0) {
      await database.collection('products').insertMany(SEED_PRODUCTS)
    } else {
      // Dynamically ensure the fuchsia kurta/kurti set p13 is always seeded & updated with correct name/details
      const p13Doc = SEED_PRODUCTS.find(p => p.id === 'p13')
      if (p13Doc) {
        const hasP13 = await database.collection('products').findOne({ id: 'p13' })
        if (!hasP13) {
          await database.collection('products').insertOne(p13Doc)
          console.log("[VELORA] Dynamically inserted the new Royal Fuchsia Embroidered Kurti Set p13.")
        } else {
          await database.collection('products').updateOne({ id: 'p13' }, { $set: p13Doc })
          console.log("[VELORA] Dynamically updated the existing Royal Fuchsia Embroidered Kurti Set p13.")
        }
      }
    }
  }
}

export function cleanDoc(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

export async function GET(request, { params }) {
  try {
    const database = await getDb()
    const url = new URL(request.url)
    const path = (await params).path || []
    const route = path[0] || ''

    if (route === '' || route === 'health') {
      return NextResponse.json({ status: 'ok', brand: 'Velora' })
    }

    if (route === 'session-user') {
      const cookieStore = await cookies()
      const token = cookieStore.get('velora_session')?.value
      if (!token) return NextResponse.json({ user: null })

      try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET || process.env.JWT_SECRET || 'velora-atelier-secret-key-2026')
        const user = await database.collection('users').findOne({ id: decoded.userId })
        if (!user || (user.sessionVersion || 1) !== decoded.sessionVersion) {
          cookieStore.delete('velora_session')
          return NextResponse.json({ user: null })
        }
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            rewards: user.rewards || 0,
            wallet: user.wallet || 0,
            phone: user.phone || '',
            dob: user.dob || ''
          }
        })
      } catch (err) {
        cookieStore.delete('velora_session')
        return NextResponse.json({ user: null })
      }
    }

    if (route === 'products') {
      await seedIfEmpty()
      const gender = url.searchParams.get('gender')
      const category = url.searchParams.get('category')
      const tag = url.searchParams.get('tag')
      const sort = url.searchParams.get('sort') || 'featured'
      const search = url.searchParams.get('q')
      const minPrice = parseFloat(url.searchParams.get('minPrice') || '0')
      const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '100000')

      const query = { price: { $gte: minPrice, $lte: maxPrice } }
      if (gender && gender !== 'all') query.$or = [{ gender }, { gender: 'unisex' }]
      if (category && category !== 'all') query.category = category
      if (tag) query.tags = tag
      if (search) query.name = { $regex: search, $options: 'i' }

      let sortObj = {}
      if (sort === 'price-low') sortObj = { price: 1 }
      else if (sort === 'price-high') sortObj = { price: -1 }
      else if (sort === 'rating') sortObj = { rating: -1 }
      else if (sort === 'newest') sortObj = { id: -1 }
      else sortObj = { rating: -1 }

      const products = await database.collection('products').find(query).sort(sortObj).limit(100).toArray()
      
      // TEMPORARY TESTING PRODUCT - START
      // Inject testing product dynamically if it doesn't exist in the DB results.
      const testProduct = {
        id: 'p-payment-test',
        name: 'VELORA Payment Test',
        slug: 'velora-payment-test',
        category: 'Testing',
        gender: 'unisex',
        price: 1,
        mrp: 99,
        discount: 99,
        images: [
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23fcfbf9"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" font-weight="600" fill="%230a0a0a" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.15em">VELORA</text><text x="50%" y="54%" font-family="sans-serif" font-size="14" fill="%23737373" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.05em">PAYMENT TEST (₹1)</text></svg>'
        ],
        colors: ['Default'],
        sizes: ['One Size'],
        stock: 999,
        rating: 5.0,
        reviews: 1,
        tags: ['testing'],
        description: 'Temporary product used only for Razorpay payment testing before production launch.',
        material: 'Premium Digital Voucher',
        badge: 'TESTING'
      }

      if (!products.some(p => p.id === 'p-payment-test')) {
        let matches = true
        if (gender && gender !== 'all' && gender !== 'unisex') matches = false
        if (category && category !== 'all' && category !== 'Testing') matches = false
        if (tag && tag !== 'testing') matches = false
        if (search && !/velora|payment|test/i.test(search)) matches = false
        if (minPrice > 1 || maxPrice < 1) matches = false

        if (matches) {
          products.push(testProduct)
        }
      }
      // TEMPORARY TESTING PRODUCT - END

      return NextResponse.json({ products: products.map(cleanDoc) })
    }

    if (route === 'product' && path[1]) {
      await seedIfEmpty()
      let product = await database.collection('products').findOne({ $or: [{ id: path[1] }, { slug: path[1] }] })
      
      // TEMPORARY TESTING PRODUCT - START
      if (!product && (path[1] === 'p-payment-test' || path[1] === 'velora-payment-test')) {
        product = {
          id: 'p-payment-test',
          name: 'VELORA Payment Test',
          slug: 'velora-payment-test',
          category: 'Testing',
          gender: 'unisex',
          price: 1,
          mrp: 99,
          discount: 99,
          images: [
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="100%" height="100%" fill="%23fcfbf9"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" font-weight="600" fill="%230a0a0a" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.15em">VELORA</text><text x="50%" y="54%" font-family="sans-serif" font-size="14" fill="%23737373" dominant-baseline="middle" text-anchor="middle" letter-spacing="0.05em">PAYMENT TEST (₹1)</text></svg>'
          ],
          colors: ['Default'],
          sizes: ['One Size'],
          stock: 999,
          rating: 5.0,
          reviews: 1,
          tags: ['testing'],
          description: 'Temporary product used only for Razorpay payment testing before production launch.',
          material: 'Premium Digital Voucher',
          badge: 'TESTING'
        }
      }
      // TEMPORARY TESTING PRODUCT - END

      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      let related = await database.collection('products').find({ category: product.category, id: { $ne: product.id } }).limit(4).toArray()
      if (related.length === 0) {
        related = await database.collection('products').find({ gender: product.gender, id: { $ne: product.id } }).limit(4).toArray()
      }
      return NextResponse.json({ product: cleanDoc(product), related: related.map(cleanDoc) })
    }

    if (route === 'orders') {
      const email = url.searchParams.get('email')
      const orders = await database.collection('orders').find(email ? { email } : {}).sort({ createdAt: -1 }).limit(50).toArray()
      return NextResponse.json({ orders: orders.map(cleanDoc) })
    }

    if (route === 'user-cart') {
      const email = url.searchParams.get('email')
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const cartDoc = await database.collection('carts').findOne({ email })
      return NextResponse.json({ cart: cartDoc ? cartDoc.cart : [] })
    }

    if (route === 'order' && path[1]) {
      const order = await database.collection('orders').findOne({ id: path[1] })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ order: cleanDoc(order) })
    }

    if (route === 'pincode' && path[1]) {
      const pin = path[1]
      // Simple demo pincode logic
      const serviceable = /^[1-9][0-9]{5}$/.test(pin)
      const days = serviceable ? (parseInt(pin[0]) % 5) + 3 : null
      return NextResponse.json({
        serviceable, pincode: pin,
        days,
        cod: serviceable && parseInt(pin[0]) < 8,
        message: serviceable ? `Delivery in ${days}-${days + 2} days` : 'Not serviceable',
      })
    }

    if (route === 'ai' && path[1] === 'review-summary') {
      const productId = url.searchParams.get('productId')
      if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })
      
      const product = await database.collection('products').findOne({ id: productId })
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      let summary = null

      if (isGeminiConfigured) {
        try {
          const ai = getGemini()
          const prompt = `Based on this luxury ethnic product, generate a JSON object with 3 short bullet highlights and a 1-sentence buyer satisfaction summary.
          Product Name: ${product.name}
          Description: ${product.description}
          Material: ${product.material}
          
          Example JSON output:
          {
            "bullets": ["✓ Highly breathable pure silk", "✓ Exquisite gold zari handwork", "✓ Signature majestic drape"],
            "summary": "Highly praised by patrons for its exquisite hand-embroidery and lightweight, majestic fall."
          }`

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.5,
            }
          })
          summary = JSON.parse(response.text)
        } catch (e) {
          console.error("AI Review Summary generation failed:", e)
        }
      }

      if (!summary) {
        // Fallback
        const defaultBullets = [
          "✓ Premium pure fabric",
          `✓ Authentic ${product.material || 'handcrafted details'}`,
          "✓ Flattering royal drape"
        ]
        const defaultSummary = `Patrons appreciate this piece for its lightweight, elegant fall and premium authentic detailing.`
        summary = { bullets: defaultBullets, summary: defaultSummary }
      }

      return NextResponse.json(summary)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const database = await getDb()
    const path = (await params).path || []
    const route = path[0] || ''
    const body = await request.json().catch(() => ({}))

    if (route === 'ai' && path[1] === 'smart-search') {
      const { q } = body
      if (!q) return NextResponse.json({ products: [] })

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      let searchParams = { correctedQuery: q, filters: {} }

      if (isGeminiConfigured) {
        try {
          const ai = getGemini()
          const prompt = `You are Velora's search intelligence engine. Parse this search query: "${q}".
          Correct any spelling mistakes. Extract category, gender, color, tags, or name keywords.
          Output a JSON object ONLY:
          {
            "correctedQuery": "corrected name or search term",
            "filters": {
              "gender": "women" or "men" or "unisex" or "all",
              "category": "ethnic wear" or other category,
              "tag": "bestseller" or "new" or "sale" or "featured"
            }
          }
          If any field is not found, leave it empty or omit.`

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            }
          })
          searchParams = JSON.parse(response.text)
        } catch (e) {
          console.error("AI Smart Search parsing failed, falling back:", e)
        }
      }

      // Query DB with parameters
      const query = {}
      if (searchParams.correctedQuery) {
        const cq = searchParams.correctedQuery.toLowerCase()
        query.$or = [
          { name: { $regex: cq, $options: 'i' } },
          { description: { $regex: cq, $options: 'i' } }
        ]
      }
      
      const filters = searchParams.filters || {}
      if (filters.gender && filters.gender !== 'all') {
        if (!query.$or) query.$or = []
        query.$or.push({ gender: filters.gender }, { gender: 'unisex' })
      }
      if (filters.category) {
        query.category = filters.category
      }
      if (filters.tag) {
        query.tags = filters.tag
      }

      const products = await database.collection('products').find(query).limit(10).toArray()
      return NextResponse.json({ products: products.map(cleanDoc), correctedQuery: searchParams.correctedQuery })
    }

    if (route === 'ai' && path[1] === 'visual-search') {
      const { image } = body
      if (!image) return NextResponse.json({ error: 'Image data is required' }, { status: 400 })

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      if (!isGeminiConfigured) {
        // Fallback: return 3 random/bestseller products
        const products = await database.collection('products').find({}).limit(4).toArray()
        return NextResponse.json({ products: products.map(cleanDoc), message: "Offline fallback search results" })
      }

      try {
        const ai = getGemini()
        // Extract base64 part
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
        const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg"

        // Load all catalog products to match against
        const catalog = await database.collection('products').find({}).toArray()
        const catalogBrief = catalog.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          colors: p.colors,
          tags: p.tags
        }))

        const prompt = `Analyze this uploaded image and identify its visual attributes (color, pattern, embroidery style, fabric, silhouette, category).
        Compare these attributes against our product catalog:
        ${JSON.stringify(catalogBrief, null, 2)}
        
        Identify the top 3-4 closest matching products in the catalog.
        Output a JSON object ONLY:
        {
          "matches": ["p1", "p13"],
          "matchExplanation": "This image shows a floral embroidered kurtis set, matching our Noor Jahan and Royal Fuchsia sets."
        }`

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          }
        })

        const result = JSON.parse(response.text)
        const matchedProductIds = result.matches || []
        const matchedProducts = catalog.filter(p => matchedProductIds.includes(p.id))
        
        return NextResponse.json({
          products: matchedProducts.map(cleanDoc),
          explanation: result.matchExplanation || "Matching patterns and style detected in Velora's collections."
        })
      } catch (e) {
        console.error("AI Visual Search failed:", e)
        // Fallback
        const products = await database.collection('products').find({}).limit(4).toArray()
        return NextResponse.json({ products: products.map(cleanDoc), message: "Fallback matching items" })
      }
    }

    if (route === 'ai' && path[1] === 'gift-finder') {
      const { recipient, budget, occasion, color, style } = body
      if (!recipient) return NextResponse.json({ error: 'recipient is required' }, { status: 400 })

      // Sourcing all products to do intelligent matching via Gemini
      const catalog = await database.collection('products').find({}).toArray()
      const catalogBrief = catalog.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        colors: p.colors,
        tags: p.tags,
        category: p.category
      }))

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      let result = null

      if (isGeminiConfigured) {
        try {
          const ai = getGemini()
          const prompt = `You are Velora's luxury gifting concierge. Recommend the top 3 best gifts from our catalog:
          ${JSON.stringify(catalogBrief, null, 2)}
          
          Based on these search parameters:
          - Recipient: ${recipient}
          - Budget: ₹${budget || 'Any'}
          - Occasion: ${occasion || 'Any'}
          - Color Preference: ${color || 'Any'}
          - Style Vibe: ${style || 'Any'}
          
          Match these parameters thoughtfully to our premium kurtis and sets (e.g., weddings get heavier velvet/silk, office wear gets lighter cotton/linen, under budget limits).
          Output a JSON object ONLY:
          {
            "recommendations": ["p1", "p3"],
            "greeting": "Dear Patron, for an exquisite wedding celebration, we have curated these royal silk and velvet creations."
          }`

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.6,
            }
          })
          result = JSON.parse(response.text)
        } catch (e) {
          console.error("AI Gift Finder failed:", e)
        }
      }

      if (!result) {
        // Fallback
        const maxPrice = budget ? parseInt(budget) : 100000
        const matched = catalog.filter(p => p.price <= maxPrice).slice(0, 3)
        result = {
          recommendations: matched.map(p => p.id),
          greeting: "We have carefully selected these premium ethnic ensembles matching your gifting preference."
        }
      }

      const recommendedProducts = catalog.filter(p => (result.recommendations || []).includes(p.id))
      return NextResponse.json({
        products: recommendedProducts.map(cleanDoc),
        greeting: result.greeting
      })
    }

    if (route === 'register') {
      const { email, password, name } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
      if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

      const existing = await database.collection('users').findOne({ email })
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

      const hashedPassword = bcryptjs.hashSync(password, 10)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      const user = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        rewards: 100,
        wallet: 0,
        isVerified: false,
        verificationOtp: {
          code: otpCode,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          lastSentAt: Date.now()
        },
        sessionVersion: 1,
        loginAttempts: 0,
        lockoutUntil: null,
        otp: null
      }

      await database.collection('users').insertOne(user)

      // Send verification email
      const verifyHtml = getVerificationEmailHtml(user.name, otpCode)
      await sendEmail({
        to: email,
        subject: 'Verify Your VELORA Account',
        html: verifyHtml,
        text: `Dear Patron,\n\nPlease verify your account with code: ${otpCode}\n\nWarm regards,\nVELORA Security`
      })

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email. Please verify your email to activate your account.',
        email
      })
    }

    if (route === 'verify-email') {
      const { email, code } = body
      if (!email || !code) return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (user.isVerified) return NextResponse.json({ error: 'Account already verified' }, { status: 400 })

      if (!user.verificationOtp || user.verificationOtp.code !== code || user.verificationOtp.expiresAt < Date.now()) {
        return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
      }

      await database.collection('users').updateOne(
        { email },
        {
          $set: { isVerified: true, verificationOtp: null }
        }
      )

      // Send Welcome email
      const welcomeHtml = getWelcomeEmailHtml(user.name)
      await sendEmail({
        to: email,
        subject: 'Welcome to VELORA',
        html: welcomeHtml,
        text: `Dear ${user.name},\n\nWelcome to VELORA. Your account has been verified successfully.\n\nWarm regards,\nVELORA Concierge`
      })

      return NextResponse.json({ success: true, message: 'Account activated successfully!' })
    }

    if (route === 'resend-verification') {
      const { email } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      if (user.isVerified) return NextResponse.json({ error: 'Account already verified' }, { status: 400 })

      // Cooldown check (60 seconds)
      if (user.verificationOtp && Date.now() - user.verificationOtp.lastSentAt < 60000) {
        const waitSecs = Math.ceil((60000 - (Date.now() - user.verificationOtp.lastSentAt)) / 1000)
        return NextResponse.json({ error: `Please wait ${waitSecs} seconds before requesting another code.` }, { status: 429 })
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      await database.collection('users').updateOne(
        { email },
        {
          $set: {
            'verificationOtp.code': otpCode,
            'verificationOtp.expiresAt': Date.now() + 24 * 60 * 60 * 1000,
            'verificationOtp.lastSentAt': Date.now()
          }
        }
      )

      const verifyHtml = getVerificationEmailHtml(user.name, otpCode)
      await sendEmail({
        to: email,
        subject: 'Verify Your VELORA Account',
        html: verifyHtml,
        text: `Dear Patron,\n\nPlease verify your account with code: ${otpCode}\n\nWarm regards,\nVELORA Security`
      })

      return NextResponse.json({ success: true, message: 'Verification code re-dispatched.' })
    }

    if (route === 'login') {
      const { email, password, rememberMe } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

      // Lockout check
      if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
        const waitMins = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60000)
        return NextResponse.json({ error: `Account locked due to consecutive failures. Try again in ${waitMins} minutes.` }, { status: 423 })
      }

      const passwordMatch = bcryptjs.compareSync(password, user.password)
      if (!passwordMatch) {
        const attempts = (user.loginAttempts || 0) + 1
        const updateData = { loginAttempts: attempts }
        if (attempts >= 5) {
          updateData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins lockout
          await database.collection('users').updateOne({ email }, { $set: updateData })
          return NextResponse.json({ error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.' }, { status: 423 })
        }
        await database.collection('users').updateOne({ email }, { $set: updateData })
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      // Reset lockout/attempts
      await database.collection('users').updateOne({ email }, { $set: { loginAttempts: 0, lockoutUntil: null } })

      // Check verification
      if (!user.isVerified) {
        return NextResponse.json({ error: 'EMAIL_NOT_VERIFIED', email: user.email }, { status: 403 })
      }

      // Generate JWT
      const sessionVersion = user.sessionVersion || 1
      const token = jwt.sign(
        { userId: user.id, email: user.email, sessionVersion },
        process.env.AUTH_SECRET || process.env.JWT_SECRET || 'velora-atelier-secret-key-2026',
        { expiresIn: rememberMe ? '30d' : '1d' }
      )

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set('velora_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
      })

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rewards: user.rewards || 0,
          wallet: user.wallet || 0,
          phone: user.phone || '',
          dob: user.dob || ''
        }
      })
    }

    if (route === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete('velora_session')
      return NextResponse.json({ success: true })
    }

    if (route === 'logout-all-devices') {
      const cookieStore = await cookies()
      const token = cookieStore.get('velora_session')?.value
      if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

      try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET || process.env.JWT_SECRET || 'velora-atelier-secret-key-2026')
        await database.collection('users').updateOne(
          { id: decoded.userId },
          { $inc: { sessionVersion: 1 } }
        )
        cookieStore.delete('velora_session')
        return NextResponse.json({ success: true, message: 'Successfully logged out from all devices.' })
      } catch (err) {
        cookieStore.delete('velora_session')
        return NextResponse.json({ success: true })
      }
    }

    if (route === 'forgot-password-request') {
      const apiKey = process.env.RESEND_API_KEY;
      const hasApiKey = !!(apiKey && apiKey.trim() !== "");
      console.log('[API - catchall - forgot-password-request] RESEND_API_KEY exists:', hasApiKey);

      if (!hasApiKey) {
        console.error('[API - catchall - forgot-password-request] RESEND_API_KEY is missing. Aborting.');
        return NextResponse.json({
          success: false,
          error: "RESEND_API_KEY missing"
        }, { status: 500 });
      }

      const { email } = body
      if (!email) return NextResponse.json({ error: 'Email address is required' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user) {
        return NextResponse.json({ error: 'Client email address not found in our registry.' }, { status: 404 })
      }

      // Cooldown rate limit (60 seconds)
      if (user.otp && Date.now() - (user.otp.lastRequestedAt || 0) < 60000) {
        const waitSecs = Math.ceil((60000 - (Date.now() - user.otp.lastRequestedAt)) / 1000)
        return NextResponse.json({ error: `Please wait ${waitSecs} seconds before requesting another code.` }, { status: 429 })
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpEmailHtml = getForgotPasswordOtpEmailHtml(otpCode)

      try {
        const emailResult = await sendEmail({
          to: email,
          subject: 'VELORA • Password Reset Code',
          html: otpEmailHtml,
          text: `Your verification code is:\n\n${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, simply ignore this email.`
        });

        if (!emailResult || !emailResult.success) {
          throw new Error('Email sending returned non-success status.');
        }
      } catch (err) {
        console.error('[API - catchall - forgot-password-request] Resend dispatch failed:', err);
        return NextResponse.json({
          success: false,
          provider: "resend",
          error: err.message || JSON.stringify(err)
        }, { status: 500 });
      }

      await database.collection('users').updateOne(
        { email },
        {
          $set: {
            otp: {
              code: otpCode,
              expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
              lastRequestedAt: Date.now(),
              attempts: 0,
              verified: false
            }
          }
        }
      )

      return NextResponse.json({ success: true, message: 'Premium security reset OTP code has been dispatched to your email.' })
    }

    if (route === 'forgot-password-verify') {
      const { email, code } = body
      if (!email || !code) return NextResponse.json({ error: 'Email and security code are required' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user || !user.otp) return NextResponse.json({ error: 'Invalid or expired session request.' }, { status: 400 })

      if (user.otp.expiresAt < Date.now()) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 })
      }

      if (user.otp.code !== code) {
        const attempts = (user.otp.attempts || 0) + 1
        if (attempts >= 5) {
          await database.collection('users').updateOne({ email }, { $set: { otp: null } })
          return NextResponse.json({ error: 'Too many invalid attempts. Please request a new code.' }, { status: 400 })
        }
        await database.collection('users').updateOne({ email }, { $set: { 'otp.attempts': attempts } })
        return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
      }

      await database.collection('users').updateOne(
        { email },
        {
          $set: { 'otp.verified': true }
        }
      )

      return NextResponse.json({ success: true, message: 'Identity verified. You may now reset your password.' })
    }

    if (route === 'forgot-password-reset') {
      const { email, password } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
      if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

      const user = await database.collection('users').findOne({ email })
      if (!user || !user.otp || !user.otp.verified) {
        return NextResponse.json({ error: 'Verification required.' }, { status: 400 })
      }

      const hashedPassword = bcryptjs.hashSync(password, 10)

      await database.collection('users').updateOne(
        { email },
        {
          $set: { password: hashedPassword, otp: null },
          $inc: { sessionVersion: 1 } // Invalidate all previous session devices
        }
      )

      const changedHtml = getPasswordChangedEmailHtml(user.name)
      await sendEmail({
        to: email,
        subject: 'VELORA • Security Password Updated',
        html: changedHtml,
        text: `Dear ${user.name},\n\nYour VELORA account password has been updated successfully.\n\nWarm regards,\nVELORA Security`
      })

      return NextResponse.json({ success: true, message: 'Password updated successfully!' })
    }

    if (route === 'reset-password') {
      const { email, password } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
      const hashedPassword = bcryptjs.hashSync(password, 10)
      const result = await database.collection('users').updateOne({ email }, { $set: { password: hashedPassword }, $inc: { sessionVersion: 1 } })
      if (result.matchedCount === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }

    if (route === 'update-profile') {
      const { email, name, phone, dob, newPassword } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const updateFields = { name, phone, dob }
      if (newPassword) {
        if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
        updateFields.password = bcryptjs.hashSync(newPassword, 10)
        // Correct sessionVersion structure to properly invalidate on profile update
        const user = await database.collection('users').findOne({ email })
        updateFields.sessionVersion = (user?.sessionVersion || 1) + 1
      }
      const result = await database.collection('users').updateOne({ email }, { $set: updateFields })
      if (result.matchedCount === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }

    if (route === 'user-cart') {
      const { email, cart } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await database.collection('carts').updateOne({ email }, { $set: { cart } }, { upsert: true })
      return NextResponse.json({ ok: true })
    }

    if (route === 'newsletter') {
      const { email } = body
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await database.collection('newsletter').updateOne({ email }, { $set: { email, subscribedAt: new Date().toISOString() } }, { upsert: true })
      return NextResponse.json({ ok: true, message: 'Welcome to the future.' })
    }

    if (route === 'checkout') {
      const { items, address, email, name, phone, payment, coupon, subtotal, shipping, discount, total } = body
      if (!items || !items.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      const order = {
        id: 'VEL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
        items, address, email, name, phone, payment, coupon,
        subtotal, shipping, discount, total,
        status: 'confirmed', tracking: [
          { stage: 'confirmed', at: new Date().toISOString(), label: 'Order Confirmed' },
          { stage: 'processing', at: null, label: 'Processing at warehouse' },
          { stage: 'shipped', at: null, label: 'Shipped' },
          { stage: 'out-for-delivery', at: null, label: 'Out for delivery' },
          { stage: 'delivered', at: null, label: 'Delivered' },
        ],
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      }
      await database.collection('orders').insertOne(order)
      return NextResponse.json({ order: cleanDoc(order) })
    }

    if (route === 'coupon') {
      const { code, subtotal } = body
      const codes = {
        'VELORA10': { type: 'pct', value: 10, min: 0, label: '10% off' },
        'FUTURE20': { type: 'pct', value: 20, min: 2000, label: '20% off (min ₹2000)' },
        'FLAT500': { type: 'flat', value: 500, min: 3000, label: '₹500 off (min ₹3000)' },
        'FIRST15': { type: 'pct', value: 15, min: 1500, label: '15% off first order' },
        'VELORA_RUNWAY_15': { type: 'pct', value: 15, min: 0, label: '15% Runway Stylist Discount' },
        'COUTURE_SHIPPING': { type: 'flat', value: 99, min: 0, label: 'Stylist Free Shipping Reward' },
        'VELORA_MYSTERY': { type: 'flat', value: 350, min: 1499, label: 'Couturier Mystery Gift (₹350 off)' },
      }
      const c = codes[code?.toUpperCase()]
      if (!c) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 })
      if (subtotal < c.min) return NextResponse.json({ error: `Add ₹${c.min - subtotal} more to use this` }, { status: 400 })
      const discount = c.type === 'pct' ? Math.round(subtotal * c.value / 100) : c.value
      return NextResponse.json({ code: code.toUpperCase(), discount, label: c.label })
    }

    if (route === 'review') {
      const review = { id: uuidv4(), ...body, createdAt: new Date().toISOString() }
      await database.collection('reviews').insertOne(review)
      return NextResponse.json({ review: cleanDoc(review) })
    }

    if (route === 'contact') {
      await database.collection('contacts').insertOne({ id: uuidv4(), ...body, createdAt: new Date().toISOString() })
      return NextResponse.json({ ok: true })
    }

    if (route === 'chat') {
      const { sessionId, message, context } = body
      if (!sessionId || !message) return NextResponse.json({ error: 'sessionId and message required' }, { status: 400 })

      // Load conversation history
      const conv = await database.collection('conversations').findOne({ sessionId })
      const history = (conv?.messages || []).slice(-10) // keep last 10 for context

      const allProductsList = await database.collection('products').find({}).toArray()
      const formattedCatalog = allProductsList.map(p => `- ${p.name} (ID: ${p.id}, Price: ₹${p.price}, Material: ${p.material || ''}, Description: ${p.description || ''})`).join('\n')

      const systemPrompt = `You are Vera, the friendly AI fashion advisor for Velora, a premium Indian & Pakistani ethnic fashion brand.
      
BRAND VOICE: Warm, friendly, premium, and helpful. Speak in simple, elegant, and trustworthy English. Keep paragraphs short, clear, and highly professional. Do not use complex luxury jargon like 'atelier', 'bespoke', 'immersive', 'silhouettes', or 'curated'.

WHAT VELORA SELLS (YOUR ACTIVE CATALOG):
${formattedCatalog}

POLICIES & SERVICES:
- Free delivery on orders above ₹1499 · Standard delivery 3-7 business days across India, Pakistan, and Bangladesh · Metro cities: 2-4 days.
- Easy 15-day returns from delivery. Refunds are processed instantly for prepaid orders, and within 3-5 days for Cash on Delivery.
- Cash on Delivery (COD) is available across most postal codes for a small ₹49 handling fee.
- Premium gift-packaging with a handwritten card is free on request at checkout.
- Coupon codes: VELORA10 (10% off), VELORA20 (20% off above ₹2000), FLAT500 (₹500 off above ₹3000), FIRST15 (15% off first order).

STYLE RULES:
- Recommend actual products matching the user's color, occasion, budget, or style preferences from the catalog list above.
- If no exact product matches, politely recommend the closest alternative from the catalog list.
- If you recommend products from the catalog, you MUST append a bracketed recommendations tag [RECOMMEND: id1, id2] with the matching product IDs at the very end of your response (e.g. "[RECOMMEND: p13]" or "[RECOMMEND: p13, p3]").
- Keep responses concise (under 100 words), clear, and extremely helpful.`

      const isGeminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
      let reply = null

      if (isGeminiConfigured) {
        try {
          const ai = getGemini()
          const contents = [
            ...history.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
          ]

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            }
          })
          reply = response.text
        } catch (e) {
          console.error("Gemini failed, falling back to rule-based:", e)
        }
      } else {
        console.warn("AI Chat Concierge running in offline mode because GEMINI_API_KEY is missing.");
      }

      let recommendations = []

      // Fallback: intelligent rule-based support
      if (!reply) {
        const m = message.toLowerCase()
        if (/hello|hi|hey|namaste/.test(m)) {
          reply = `Welcome to Velora ✨ I'm Vera, your personal AI stylist. I am here to help you find the perfect premium kurtis, choose the right size, track your order, or suggest beautiful styles for your festive celebrations. How can I help you today?`
        } else if (/wedding|festive|wedding kurti|shaadi|celebration|eid/.test(m)) {
          reply = `For festive occasions and weddings, I highly recommend our **VELORA Royal Fuchsia Embroidered Kurti Set** (₹1199). It is beautifully tailored in a premium soft silk blend, complete with a matching palazzo and a beautiful designer dupatta. Would you like to view this style? [RECOMMEND: p13]`
        } else if (/fuchsia|pink|embroider|kurti set/.test(m)) {
          reply = `Our current bestseller is the **VELORA Royal Fuchsia Embroidered Kurti Set** (₹1199). It features beautiful embroidery and premium woven borders. [RECOMMEND: p13]`
        } else if (/size|fit|measurement/.test(m)) {
          reply = "Our premium ethnic kurtis are designed for a perfect and comfortable fit. Our standard chest sizes are: S (36\"), M (38\"), L (40\"), XL (42\"), XXL (44\"). You can also click the \"Find My Size\" button on any product page for a custom size recommendation. What size or style can I help you find?"
        } else if (/deliver|shipping|when|arrive/.test(m)) {
          reply = "We offer free delivery across India, Pakistan, and Bangladesh on orders above ₹1499. Shipping takes 3 to 7 business days, and metro cities usually receive orders within 2 to 4 business days."
        } else if (/return|refund|exchange/.test(m)) {
          reply = "We offer an easy 15-day return and exchange policy. Items must be unworn and have their original tags. Simply email hello@velora.in to request a return or replacement."
        } else if (/coupon|discount|code|offer/.test(m)) {
          reply = "We have some special discount codes for you. Apply at checkout:\n- **VELORA10** for 10% off\n- **VELORA20** for 20% off above ₹2000\n- **FLAT500** for ₹500 off above ₹3000\n- **FIRST15** for 15% off your first order."
        } else if (/cod|cash|delivery/.test(m)) {
          reply = "Yes, Cash on Delivery (COD) is available for most postal codes across India, Pakistan and Bangladesh with a small handling fee of ₹49. You can select Cash on Delivery at checkout."
        } else if (/track|order|status/.test(m)) {
          reply = "You can easily track your order using the order ID sent to your email on our Track Order page. Would you like me to guide you there?"
        } else if (/human|agent|talk|call/.test(m)) {
          reply = "You can connect with our support team directly at hello@velora.in or call our customer service at +91 80 4000 5000 (Mon–Sat, 10 AM – 8 PM IST)."
        } else if (/thank|thanks|great|awesome|good/.test(m)) {
          reply = "It is my absolute pleasure ✨ Please let me know if you need help with anything else!"
        } else {
          reply = `I would be happy to help you find the perfect look. Velora specializes in premium silk kurtis and beautifully embroidered ethnic sets, tailored for a perfect fit. Tell me a bit more about what you are shopping for today!`
        }
      }

      // Extract bracket recommendations tag [RECOMMEND: p13]
      const match = reply.match(/\[RECOMMEND:\s*([^\]]+)\]/i)
      if (match) {
        recommendations = match[1].split(',').map(id => id.trim())
        reply = reply.replace(/\[RECOMMEND:\s*[^\]]+\]/gi, '').trim()
      }

      // Save conversation
      const now = new Date().toISOString()
      await database.collection('conversations').updateOne(
        { sessionId },
        {
          $set: { sessionId, updatedAt: now },
          $setOnInsert: { createdAt: now },
          $push: { messages: { $each: [{ role: 'user', content: message, createdAt: now }, { role: 'assistant', content: reply, recommendations, createdAt: now }] } },
        },
        { upsert: true }
      )
      return NextResponse.json({ reply, recommendations, sessionId })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
