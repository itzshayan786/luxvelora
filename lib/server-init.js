import { MongoClient } from "mongodb";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";

// In-memory mock database store
const MEMORY_DB = {
  products: null,
  orders: [],
  payments: [],
  users: [],
  carts: [],
  newsletter: [],
  reviews: [],
  contacts: [],
  conversations: []
};

// Seed products for out-of-the-box demo experience
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Nebula Oversized Hoodie', slug: 'nebula-oversized-hoodie', category: 'oversized', gender: 'unisex', price: 3499, mrp: 5999, discount: 42, images: ['https://images.unsplash.com/photo-1472417583565-62e7bdeda490?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85','https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Chrome Silver','Cyber Blue'], sizes: ['S','M','L','XL','XXL'], stock: 42, rating: 4.8, reviews: 284, tags: ['bestseller','new'], description: 'Engineered from ultra-premium 480 GSM French terry. Drop shoulder cut, boxy silhouette, mirror-metallic Velora emblem. Wear the future.', material: '80% Cotton / 20% Recycled Polyester', badge: 'BESTSELLER' },
  { id: 'p2', name: 'Chrome Utility Cargo', slug: 'chrome-utility-cargo', category: 'bottoms', gender: 'men', price: 2799, mrp: 4499, discount: 38, images: ['https://images.unsplash.com/photo-1557130680-0f816eef4743?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Obsidian','Graphite'], sizes: ['28','30','32','34','36'], stock: 68, rating: 4.7, reviews: 156, tags: ['new'], description: 'Techwear cargo trousers with reinforced knee panels and reflective piping. Water-repellent finish.', material: 'Ripstop Nylon Blend', badge: 'NEW' },
  { id: 'p3', name: 'Ethereal Silk Slip Dress', slug: 'ethereal-silk-slip-dress', category: 'dresses', gender: 'women', price: 4299, mrp: 6999, discount: 39, images: ['https://images.unsplash.com/photo-1541519481457-763224276691?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fGJsYWNrfDE3ODMxMzY1ODN8MA&ixlib=rb-4.1.0&q=85','https://images.unsplash.com/photo-1574015974293-817f0ebebb74?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHxfHxmYXNoaW9uJTIwbW9kZWx8ZW58MHx8fGJsYWNrfDE3ODMxMzY1ODN8MA&ixlib=rb-4.1.0&q=85'], colors: ['Onyx','Champagne','Ice'], sizes: ['XS','S','M','L'], stock: 24, rating: 4.9, reviews: 412, tags: ['bestseller','sale'], description: 'Bias-cut mulberry silk slip. Cowl neck, adjustable straps, unfinished raw edge. Made in Bengaluru.', material: '100% Mulberry Silk', badge: 'LIMITED' },
  { id: 'p4', name: 'Void Cropped Bomber', slug: 'void-cropped-bomber', category: 'outerwear', gender: 'women', price: 5499, mrp: 8999, discount: 39, images: ['https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Steel'], sizes: ['XS','S','M','L','XL'], stock: 18, rating: 4.9, reviews: 89, tags: ['new','bestseller'], description: 'Cropped satin bomber with holographic zipper and elasticated hem. Statement outerwear.', material: 'Satin Polyester with Recycled Lining', badge: 'NEW' },
  { id: 'p5', name: 'Titan Tech Tee', slug: 'titan-tech-tee', category: 'tops', gender: 'men', price: 1899, mrp: 2999, discount: 37, images: ['https://images.unsplash.com/photo-1508216310976-c518daae0cdc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Chrome','Deep Blue'], sizes: ['S','M','L','XL','XXL'], stock: 120, rating: 4.6, reviews: 542, tags: ['bestseller'], description: 'Heavyweight 260 GSM combed cotton. Boxy fit, drop shoulder, ribbed collar with signature Velora tab.', material: '100% Combed Cotton', badge: 'BESTSELLER' },
  { id: 'p6', name: 'Astral Wide-Leg Trouser', slug: 'astral-wide-leg-trouser', category: 'bottoms', gender: 'women', price: 3299, mrp: 4999, discount: 34, images: ['https://images.pexels.com/photos/31466152/pexels-photo-31466152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Jet','Slate'], sizes: ['XS','S','M','L','XL'], stock: 55, rating: 4.7, reviews: 203, tags: ['new'], description: 'Fluid wide-leg trousers with pleated front and satin waistband. High-rise architectural cut.', material: 'Viscose Twill', badge: 'NEW' },
  { id: 'p7', name: 'Phantom Zip Hoodie', slug: 'phantom-zip-hoodie', category: 'oversized', gender: 'men', price: 3899, mrp: 5999, discount: 35, images: ['https://images.unsplash.com/photo-1649877705659-adf38e1f68f1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxvdmVyc2l6ZWQlMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTczfDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Ash'], sizes: ['S','M','L','XL','XXL'], stock: 33, rating: 4.8, reviews: 178, tags: ['sale','bestseller'], description: 'Full-zip hoodie with kangaroo pocket and reflective back print. 100% brushed fleece interior.', material: '480 GSM Cotton Fleece', badge: 'SALE' },
  { id: 'p8', name: 'Lumen Corset Top', slug: 'lumen-corset-top', category: 'tops', gender: 'women', price: 2499, mrp: 3999, discount: 38, images: ['https://images.pexels.com/photos/11844304/pexels-photo-11844304.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Onyx','Ivory','Silver'], sizes: ['XS','S','M','L'], stock: 40, rating: 4.8, reviews: 312, tags: ['bestseller'], description: 'Structured corset top with metallic bone details and adjustable lacing. Statement evening piece.', material: 'Duchess Satin with Steel Boning', badge: 'BESTSELLER' },
  { id: 'p9', name: 'Quantum Denim Jacket', slug: 'quantum-denim-jacket', category: 'outerwear', gender: 'unisex', price: 4599, mrp: 7499, discount: 39, images: ['https://images.pexels.com/photos/32969128/pexels-photo-32969128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Deep Indigo','Washed Black'], sizes: ['S','M','L','XL'], stock: 28, rating: 4.7, reviews: 145, tags: ['new'], description: 'Oversized boxy denim jacket with acid-wash finish and holographic embroidery on the back panel.', material: '14oz Selvedge Denim', badge: 'NEW' },
  { id: 'p10', name: 'Nova Leather Skirt', slug: 'nova-leather-skirt', category: 'bottoms', gender: 'women', price: 3999, mrp: 6499, discount: 38, images: ['https://images.pexels.com/photos/5493535/pexels-photo-5493535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'], colors: ['Void Black','Espresso'], sizes: ['XS','S','M','L'], stock: 22, rating: 4.9, reviews: 98, tags: ['limited','new'], description: 'Vegan leather mini skirt with asymmetric hem and side zip. Buttery-soft hand feel.', material: 'Premium Vegan Leather', badge: 'LIMITED' },
  { id: 'p11', name: 'Solstice Puffer Vest', slug: 'solstice-puffer-vest', category: 'outerwear', gender: 'unisex', price: 4199, mrp: 6299, discount: 33, images: ['https://images.unsplash.com/photo-1472417583565-62e7bdeda490?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmYXNoaW9ufGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Onyx','Metallic Silver'], sizes: ['S','M','L','XL'], stock: 36, rating: 4.6, reviews: 76, tags: ['new'], description: 'Cropped puffer vest with recycled down fill and matte metallic shell fabric.', material: 'Recycled Nylon Shell / Down Fill', badge: 'NEW' },
  { id: 'p12', name: 'Eclipse Cargo Shorts', slug: 'eclipse-cargo-shorts', category: 'bottoms', gender: 'men', price: 1999, mrp: 2999, discount: 33, images: ['https://images.unsplash.com/photo-1557130680-0f816eef4743?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxzdHJlZXR3ZWFyfGVufDB8fHxibGFja3wxNzgzMTM2NTY3fDA&ixlib=rb-4.1.0&q=85'], colors: ['Void Black','Sand','Olive'], sizes: ['28','30','32','34','36'], stock: 88, rating: 4.5, reviews: 234, tags: ['sale'], description: 'Utility cargo shorts with multiple pockets and drawstring waist. Perfect drop.', material: 'Cotton Twill', badge: 'SALE' },
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
];

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
            item = { id: query.id || query.email || Math.random().toString() };
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
            return { modifiedCount: 1, upsertedCount: options.upsert ? 1 : 0, matchedCount: 1 };
          }
          return { modifiedCount: 0, matchedCount: 0 };
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

// Validates required environment variables and prints a warning if any are missing
export function validateEnv() {
  const missing = [];
  const REQUIRED_ENV_VARS = ["MONGO_URL", "DB_NAME", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
  for (const name of REQUIRED_ENV_VARS) {
    if (!process.env[name] || process.env[name].trim() === "") {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    console.warn(`[AI Studio] Missing environment variables: ${missing.join(", ")}. Mocks will be used where applicable.`);
  }
}

// 1. MongoDB Initialization
let mongoClient = null;
let db = null;
let useMockDb = false;

export async function getDb() {
  if (useMockDb) {
    return createMockDb();
  }

  const hasMongoEnv = process.env.MONGO_URL && process.env.DB_NAME;
  if (!hasMongoEnv) {
    console.warn("[AI Studio] MONGO_URL or DB_NAME not configured. Using in-memory mock database.");
    useMockDb = true;
    return createMockDb();
  }
  
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 3000, // fail fast
    });
  }
  
  if (!db) {
    try {
      await mongoClient.connect();
      db = mongoClient.db(process.env.DB_NAME);
    } catch (err) {
      console.warn(`[AI Studio] Failed to connect to MongoDB (${err.message}). Falling back to in-memory mock database.`);
      useMockDb = true;
      return createMockDb();
    }
  }
  return db;
}

// 2. Razorpay Server Initialization
let razorpayInstance = null;

export function getRazorpay() {
  const hasRazorpayEnv = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  if (!hasRazorpayEnv) {
    console.warn("[AI Studio] Razorpay environment variables not configured. Using mock Razorpay client.");
    return {
      orders: {
        create: async (options) => {
          console.log("[AI Studio Mock Razorpay] Creating order", options);
          return {
            id: `order_mock_${Date.now()}`,
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            status: "created",
          };
        }
      }
    };
  }
  
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// 3. Gemini Initialization
let geminiClient = null;

export function getGemini() {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
      console.warn("[AI Studio] GEMINI_API_KEY is not configured. Falling back to rule-based assistance.");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClient;
}
