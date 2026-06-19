import axios from 'axios';

const BASE = 'http://localhost:8081/api/v1';
const ADMIN_PASS = 'admin123';
const USER_PASS = 'user12345';

const productImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', // headphones
  'https://images.unsplash.com/photo-1546868871-af0de0ae72f4?w=400', // smartwatch
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', // speaker
  'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400', // usb hub
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400', // laptop stand
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', // mouse
  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400', // keyboard
  'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', // webcam
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400', // powerbank
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', // phone case
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', // tshirt
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', // jeans
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', // shoes
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', // belt
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', // sunglasses
  'https://images.unsplash.com/photo-1621927415495-7d8f1c08a020?w=400', // sweater
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', // casual shirt
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', // yoga pants
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', // scarf
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', // formal shoes
  'https://images.unsplash.com/photo-1584990347449-a5f3f6e0b1d0?w=400', // pressure cooker
  'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400', // blender
  'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', // coffee maker
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400', // cutlery
  'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400', // bedsheet
  'https://images.unsplash.com/photo-1583338917451-6c8da7f2e4f6?w=400', // yoga mat
  'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?w=400', // dumbbell
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400', // books
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', // watch luxury
  'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400', // bag
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400', // perfume
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', // skincare
  'https://images.unsplash.com/photo-1533139502658-0198f920d8e1?w=400', // jewelry
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', // home decor
  'https://images.unsplash.com/photo-1577003837929-5f4f3e5b1d5b?w=400', // toy
];

const categories = [
  { name: 'Electronics', description: 'Premium electronic gadgets and devices' },
  { name: 'Fashion', description: 'Luxury clothing and accessories' },
  { name: 'Home & Kitchen', description: 'Premium home appliances and kitchenware' },
  { name: 'Books', description: 'Curated books and magazines' },
  { name: 'Sports', description: 'Professional sports equipment' },
  { name: 'Beauty', description: 'Premium beauty and skincare' },
  { name: 'Jewelry', description: 'Fine jewelry and accessories' },
  { name: 'Home Decor', description: 'Elegant home decor pieces' },
];

const products = [
  { name: 'Wireless Headphones Pro', category: 'Electronics', price: 1999, stock: 50 },
  { name: 'Smart Watch Ultra', category: 'Electronics', price: 4999, stock: 30 },
  { name: 'Premium Bluetooth Speaker', category: 'Electronics', price: 2499, stock: 40 },
  { name: 'USB-C Multiport Hub', category: 'Electronics', price: 1299, stock: 60 },
  { name: 'Ergonomic Laptop Stand', category: 'Electronics', price: 1799, stock: 25 },
  { name: 'Silent Wireless Mouse', category: 'Electronics', price: 899, stock: 80 },
  { name: 'Mechanical Keyboard RGB', category: 'Electronics', price: 3499, stock: 35 },
  { name: '4K Webcam Pro', category: 'Electronics', price: 2999, stock: 20 },
  { name: '20000mAh Power Bank', category: 'Electronics', price: 1499, stock: 100 },
  { name: 'Premium Phone Case', category: 'Electronics', price: 499, stock: 200 },
  { name: 'Egyptian Cotton T-Shirt', category: 'Fashion', price: 999, stock: 150 },
  { name: 'Designer Denim Jeans', category: 'Fashion', price: 2499, stock: 80 },
  { name: 'Italian Leather Shoes', category: 'Fashion', price: 3999, stock: 60 },
  { name: 'Premium Leather Belt', category: 'Fashion', price: 899, stock: 100 },
  { name: 'Designer Sunglasses', category: 'Fashion', price: 1499, stock: 70 },
  { name: 'Cashmere Wool Sweater', category: 'Fashion', price: 2999, stock: 45 },
  { name: 'Linen Casual Shirt', category: 'Fashion', price: 1299, stock: 90 },
  { name: 'Luxury Yoga Pants', category: 'Fashion', price: 1499, stock: 75 },
  { name: 'Silk Scarf Collection', category: 'Fashion', price: 1299, stock: 55 },
  { name: 'Handcrafted Formal Shoes', category: 'Fashion', price: 4499, stock: 40 },
  { name: 'Premium Pressure Cooker', category: 'Home & Kitchen', price: 2499, stock: 35 },
  { name: 'Professional Blender', category: 'Home & Kitchen', price: 3999, stock: 40 },
  { name: 'Espresso Coffee Maker', category: 'Home & Kitchen', price: 5999, stock: 25 },
  { name: 'Gold-Plated Cutlery Set', category: 'Home & Kitchen', price: 1999, stock: 60 },
  { name: 'Luxury Bed Sheet Set', category: 'Home & Kitchen', price: 2999, stock: 50 },
  { name: 'Premium Yoga Mat', category: 'Sports', price: 1499, stock: 100 },
  { name: 'Adjustable Dumbbell Set', category: 'Sports', price: 7999, stock: 20 },
  { name: 'Resistance Bands Kit', category: 'Sports', price: 699, stock: 150 },
  { name: 'Design Thinking Book', category: 'Books', price: 499, stock: 200 },
  { name: 'Luxury Leather Watch', category: 'Jewelry', price: 8999, stock: 15 },
  { name: 'Designer Handbag', category: 'Fashion', price: 5999, stock: 25 },
  { name: 'Premium Perfume', category: 'Beauty', price: 3499, stock: 40 },
  { name: 'Gold Necklace Set', category: 'Jewelry', price: 12999, stock: 10 },
  { name: 'Crystal Home Decor', category: 'Home Decor', price: 2499, stock: 30 },
  { name: 'Aromatherapy Diffuser', category: 'Home Decor', price: 1499, stock: 45 },
  { name: 'Luxury Skincare Set', category: 'Beauty', price: 2999, stock: 35 },
];

const users = [
  { name: 'Aarav Sharma', email: 'aarav@amazon.local' },
  { name: 'Diya Patel', email: 'diya@amazon.local' },
  { name: 'Kabir Singh', email: 'kabir@amazon.local' },
  { name: 'Isha Verma', email: 'isha@amazon.local' },
  { name: 'Rohan Mehta', email: 'rohan@amazon.local' },
  { name: 'Ananya Roy', email: 'ananya@amazon.local' },
  { name: 'Vivaan Gupta', email: 'vivaan@amazon.local' },
  { name: 'Meera Nair', email: 'meera@amazon.local' },
  { name: 'Arjun Das', email: 'arjun@amazon.local' },
  { name: 'Sara Khan', email: 'sara@amazon.local' },
];

async function login(email, password) {
  const r = await axios.post(`${BASE}/auth/login`, { email, password });
  return r.data.data.accessToken;
}

async function registerUser(name, email, password) {
  const r = await axios.post(`${BASE}/auth/register`, {
    fullName: name, email, password, phone: '9999999999'
  });
  return r.data.data;
}

async function createCategory(token, name, description, index) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const r = await axios.post(`${BASE}/admin/categories`, {
    name, slug, description, imageUrl: productImages[30 + index] || null
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function createProduct(token, product, categoryId, imgIndex) {
  const r = await axios.post(`${BASE}/admin/products`, {
    name: product.name,
    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + imgIndex,
    description: `Premium ${product.name.toLowerCase()} - crafted for those who appreciate the finer things in life.`,
    price: product.price,
    discountPrice: product.price > 3000 ? Math.round(product.price * 0.85) : null,
    active: true,
    brand: product.category,
    sku: `SKU-${String(imgIndex + 1).padStart(5, '0')}`,
    categoryId,
    imageUrls: [productImages[imgIndex % productImages.length]],
    stockQuantity: product.stock,
    lowStockThreshold: 5,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function addAddress(token) {
  const r = await axios.post(`${BASE}/addresses`, {
    fullName: 'User', phone: '9876543210', addressLine1: '123 Luxury Avenue',
    city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India',
    addressType: 'HOME', isDefault: true
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function addToCart(token, productId) {
  const r = await axios.post(`${BASE}/cart/items`, {
    productId, quantity: 1
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function placeOrder(token, addressId) {
  const r = await axios.post(`${BASE}/orders`, {
    addressId, paymentMethod: 'COD'
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function main() {
  console.log('=== Seeding full database with images ===');
  
  // Login as admin
  const adminToken = await login('admin@velora.com', ADMIN_PASS);
  console.log('Admin logged in');

  // Create categories
  console.log('Creating categories...');
  for (const cat of categories) {
    try {
      await createCategory(adminToken, cat.name, cat.description, categories.indexOf(cat));
      console.log(`  Created: ${cat.name}`);
    } catch (e) {
      if (!e.response?.data?.message?.includes('already exists')) throw e;
      console.log(`  Exists: ${cat.name}`);
    }
  }

  // Get categories map
  const catRes = await axios.get(`${BASE}/categories/tree`);
  const catMap = new Map();
  catRes.data.data.forEach(c => catMap.set(c.name, c.id));

  // Create products with images
  console.log('Creating products...');
  for (const prod of products) {
    try {
      await createProduct(adminToken, prod, catMap.get(prod.category), products.indexOf(prod));
      console.log(`  Created: ${prod.name}`);
    } catch (e) {
      if (!e.response?.data?.message?.includes('already exists')) throw e;
      console.log(`  Exists: ${prod.name}`);
    }
  }

  // Get products
  const prodRes = await axios.get(`${BASE}/products/search?page=0&size=100`);
  const allProducts = prodRes.data.data.content || [];

  // Register users
  console.log('Registering users...');
  for (const user of users) {
    try {
      await registerUser(user.name, user.email, USER_PASS);
      console.log(`  Registered: ${user.email}`);
    } catch (e) {
      console.log(`  Exists: ${user.email}`);
    }
  }

  // Place orders
  console.log('Placing orders...');
  for (const user of users) {
    try {
      const token = await login(user.email, USER_PASS);
      const addr = await addAddress(token);
      const randProd = allProducts[Math.floor(Math.random() * allProducts.length)];
      if (randProd) {
        await addToCart(token, randProd.id);
        await placeOrder(token, addr.id);
        console.log(`  Order placed: ${user.email}`);
      }
    } catch (e) {
      console.log(`  Order failed for ${user.email}: ${e.message}`);
    }
  }

  console.log('=== Seeding complete ===');
}

main().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});