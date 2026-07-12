import { MongoClient } from "mongodb";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";

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
        },
        async deleteMany(query) {
          const initialLength = data.length;
          const remaining = data.filter(item => !matchesQuery(item, query));
          data.length = 0;
          data.push(...remaining);
          return { deletedCount: initialLength - remaining.length };
        },
        async deleteOne(query) {
          const idx = data.findIndex(item => matchesQuery(item, query));
          if (idx !== -1) {
            data.splice(idx, 1);
            return { deletedCount: 1 };
          }
          return { deletedCount: 0 };
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

function isPlaceholderConnectionString(connectionString) {
  if (!connectionString) return true;
  const str = connectionString.toLowerCase();
  return (
    str.includes("...") ||
    str.includes("placeholder") ||
    str.includes("your-cluster") ||
    str.includes("your_cluster") ||
    str.includes("username:password") ||
    str.includes("example.com")
  );
}

async function resolveMongoSrvOverDoH(connectionString) {
  if (!connectionString || !connectionString.startsWith("mongodb+srv://") || isPlaceholderConnectionString(connectionString)) {
    return connectionString;
  }

  try {
    console.log("[AI Studio] Intercepted mongodb+srv:// connection string. Resolving SRV and TXT via DNS-over-HTTPS (DoH)...");
    
    // Parse: mongodb+srv://[username:password@]host[/database][?options]
    // Use URL parser by replacing protocol with https://
    const httpsEquivalent = connectionString.replace(/^mongodb\+srv:\/\//, "https://");
    const parsedUrl = new URL(httpsEquivalent);

    const srvHost = parsedUrl.hostname;
    const username = parsedUrl.username ? decodeURIComponent(parsedUrl.username) : "";
    const password = parsedUrl.password ? decodeURIComponent(parsedUrl.password) : "";
    const databasePath = parsedUrl.pathname ? parsedUrl.pathname.slice(1) : ""; // remove leading slash
    const originalQueryOptions = parsedUrl.search ? parsedUrl.search.slice(1) : ""; // remove leading ?

    let credentials = "";
    if (username) {
      credentials = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }

    console.log(`[AI Studio] Resolving SRV records for _mongodb._tcp.${srvHost}...`);
    
    let srvAnswers = [];
    let txtAnswers = [];
    
    // Try Google DoH first, then Cloudflare
    const srvUrls = [
      `https://dns.google/resolve?name=_mongodb._tcp.${srvHost}&type=SRV`,
      `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${srvHost}&type=SRV`
    ];

    for (const url of srvUrls) {
      try {
        const response = await fetch(url, {
          headers: { 'accept': 'application/dns-json' },
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.Answer && data.Answer.length > 0) {
            srvAnswers = data.Answer;
            console.log(`[AI Studio] Successfully resolved ${srvAnswers.length} SRV records using ${url}`);
            break;
          }
        }
      } catch (e) {
        // Silent fallback/ignore
      }
    }

    if (srvAnswers.length === 0) {
      throw new Error("No SRV answers returned from DoH");
    }

    // Now parse the SRV answers to get hostnames and ports
    const hosts = srvAnswers
      .map(ans => {
        const srvStr = ans.data.replace(/"/g, "").trim();
        const parts = srvStr.split(/\s+/);
        if (parts.length >= 4) {
          const port = parts[2];
          let host = parts[3];
          if (host.endsWith(".")) {
            host = host.slice(0, -1);
          }
          return `${host}:${port}`;
        }
        return null;
      })
      .filter(Boolean);

    if (hosts.length === 0) {
      throw new Error("No hosts found");
    }

    console.log("[AI Studio] Resolved hosts:", hosts);

    // Resolve TXT records for default options
    console.log(`[AI Studio] Resolving TXT records for ${srvHost}...`);
    const txtUrls = [
      `https://dns.google/resolve?name=${srvHost}&type=TXT`,
      `https://cloudflare-dns.com/dns-query?name=${srvHost}&type=TXT`
    ];

    for (const url of txtUrls) {
      try {
        const response = await fetch(url, {
          headers: { 'accept': 'application/dns-json' },
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.Answer && data.Answer.length > 0) {
            txtAnswers = data.Answer;
            console.log(`[AI Studio] Successfully resolved ${txtAnswers.length} TXT records using ${url}`);
            break;
          }
        }
      } catch (e) {
        // Silent fallback/ignore
      }
    }

    // Extract TXT options
    const txtOptions = txtAnswers
      .map(ans => {
        let text = ans.data;
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1);
        }
        return text;
      })
      .filter(Boolean)
      .join("&");

    console.log("[AI Studio] Resolved TXT options:", txtOptions);

    const finalOptionsList = [];
    if (txtOptions) finalOptionsList.push(txtOptions);
    if (originalQueryOptions) finalOptionsList.push(originalQueryOptions);
    
    const allOptionsJoined = finalOptionsList.join("&");
    if (!allOptionsJoined.includes("authSource=")) {
      finalOptionsList.push("authSource=admin");
    }
    if (!allOptionsJoined.includes("ssl=") && !allOptionsJoined.includes("tls=")) {
      finalOptionsList.push("ssl=true");
    }

    const finalQuery = finalOptionsList.join("&");
    const resolvedConnectionString = `mongodb://${credentials}${hosts.join(",")}/${databasePath}${finalQuery ? "?" + finalQuery : ""}`;
    
    // Secure logging: mask password
    const maskedString = resolvedConnectionString.replace(/\/\/([^:]+):([^@]+)@/, "//srv-user:***masked***@");
    console.log("[AI Studio] Transformed connection string successfully:", maskedString);
    return resolvedConnectionString;

  } catch (err) {
    // Quiet fallback
    return connectionString;
  }
}

export async function getDb() {
  if (useMockDb) {
    return createMockDb();
  }

  const connectionString = process.env.MONGO_URL || process.env.DATABASE_URL;
  const dbName = process.env.DB_NAME || "velora";
  const hasMongoEnv = !!connectionString;

  if (!hasMongoEnv || isPlaceholderConnectionString(connectionString)) {
    console.log("[AI Studio] Using the sandbox in-memory database.");
    useMockDb = true;
    return createMockDb();
  }

  if (!mongoClient) {
    try {
      const finalConnectionString = await resolveMongoSrvOverDoH(connectionString);
      mongoClient = new MongoClient(finalConnectionString, {
        serverSelectionTimeoutMS: 3000, // fail fast
      });
    } catch (e) {
      useMockDb = true;
      return createMockDb();
    }
  }
  
  if (!db) {
    try {
      await mongoClient.connect();
      db = mongoClient.db(dbName);
    } catch (err) {
      console.log("[AI Studio] Sandbox database fallback activated.");
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
