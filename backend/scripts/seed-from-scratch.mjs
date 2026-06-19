import axios from 'axios';

const BASE = 'http://localhost:8081/api/v1';
const ADMIN_PASS = 'admin123';
const USER_PASS = 'user12345';

const admin = { email: 'admin@velora.com', password: ADMIN_PASS };

const categories = [
  { name: 'Electronics', description: 'Electronic gadgets and devices' },
  { name: 'Fashion', description: 'Clothing and accessories' },
  { name: 'Home & Kitchen', description: 'Home appliances and kitchenware' },
  { name: 'Books', description: 'Books and magazines' },
  { name: 'Sports', description: 'Sports equipment and accessories' },
];

const products = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 1999, stock: 50 },
  { name: 'Smart Watch', category: 'Electronics', price: 2999, stock: 30 },
  { name: 'Bluetooth Speaker', category: 'Electronics', price: 1499, stock: 40 },
  { name: 'USB-C Hub', category: 'Electronics', price: 899, stock: 60 },
  { name: 'Laptop Stand', category: 'Electronics', price: 1299, stock: 25 },
  { name: 'Wireless Mouse', category: 'Electronics', price: 599, stock: 80 },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 2499, stock: 35 },
  { name: 'Webcam HD', category: 'Electronics', price: 1799, stock: 20 },
  { name: 'Power Bank', category: 'Electronics', price: 999, stock: 100 },
  { name: 'Phone Case', category: 'Electronics', price: 299, stock: 200 },
  { name: 'Cotton T-Shirt', category: 'Fashion', price: 499, stock: 150 },
  { name: 'Denim Jeans', category: 'Fashion', price: 1299, stock: 80 },
  { name: 'Running Shoes', category: 'Fashion', price: 1999, stock: 60 },
  { name: 'Leather Belt', category: 'Fashion', price: 399, stock: 100 },
  { name: 'Sunglasses', category: 'Fashion', price: 799, stock: 70 },
  { name: 'Wool Sweater', category: 'Fashion', price: 1499, stock: 45 },
  { name: 'Casual Shirt', category: 'Fashion', price: 699, stock: 90 },
  { name: 'Yoga Pants', category: 'Fashion', price: 899, stock: 75 },
  { name: 'Silk Scarf', category: 'Fashion', price: 599, stock: 55 },
  { name: 'Formal Shoes', category: 'Fashion', price: 2299, stock: 40 },
  { name: 'Pressure Cooker', category: 'Home & Kitchen', price: 1599, stock: 35 },
  { name: 'Blender', category: 'Home & Kitchen', price: 1199, stock: 40 },
  { name: 'Coffee Maker', category: 'Home & Kitchen', price: 2499, stock: 25 },
  { name: 'Cutlery Set', category: 'Home & Kitchen', price: 699, stock: 60 },
  { name: 'Bed Sheet Set', category: 'Home & Kitchen', price: 899, stock: 50 },
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

async function createCategory(token, name, description) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const r = await axios.post(`${BASE}/admin/categories`, {
    name, slug, description, imageUrl: null
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function createProduct(token, product, categoryId) {
  const r = await axios.post(`${BASE}/admin/products`, {
    name: product.name,
    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: `${product.name} in ${product.category}`,
    price: product.price,
    discountPrice: null,
    active: true,
    brand: product.category,
    sku: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
    categoryId,
    imageUrls: [],
    stockQuantity: product.stock,
    lowStockThreshold: 5,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function createCoupon(token) {
  const r = await axios.post(`${BASE}/admin/coupons`, {
    code: 'WELCOME20',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscountAmount: 200,
    usageLimit: 100,
    usedCount: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function addAddress(token, userId) {
  const r = await axios.post(`${BASE}/addresses`, {
    fullName: 'User', phone: '9876543210', addressLine1: '123 Street',
    city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India',
    addressType: 'HOME', isDefault: true
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function addToCart(token, productId) {
  const r = await axios.post(`${BASE}/cart/items`, {
    productId,
    quantity: 1
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function placeOrder(token, addressId) {
  const r = await axios.post(`${BASE}/orders`, {
    addressId,
    paymentMethod: 'COD'
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function main() {
  console.log('=== Seeding database from scratch ===');
  
  // Login as admin
  const adminToken = await login(admin.email, admin.password);
  console.log('Admin logged in');

  // Create 5 categories
  console.log('Creating categories...');
  const categoryIds = [];
  for (const cat of categories) {
    try {
      const created = await createCategory(adminToken, cat.name, cat.description);
      categoryIds.push(created.id);
      console.log(`  Created category: ${cat.name}`);
    } catch (e) {
      if (e.response?.data?.message?.includes('already exists')) {
        console.log(`  Category exists: ${cat.name}`);
      } else {
        throw e;
      }
    }
  }

  // Get all categories
  const catRes = await axios.get(`${BASE}/categories/tree`);
  const allCategories = catRes.data.data;
  const catIdMap = new Map();
  allCategories.forEach(c => catIdMap.set(c.name, c.id));

  // Create 20 products
  console.log('Creating products...');
  const productIdMap = new Map();
  for (const prod of products) {
    try {
      const created = await createProduct(adminToken, prod, catIdMap.get(prod.category));
      productIdMap.set(prod.name, created.id);
      console.log(`  Created product: ${prod.name}`);
    } catch (e) {
      if (e.response?.data?.message?.includes('already exists')) {
        console.log(`  Product exists: ${prod.name}`);
      } else {
        throw e;
      }
    }
  }

  // Get all products
  const prodRes = await axios.get(`${BASE}/products/search?page=0&size=100`);
  const allProducts = prodRes.data.data.content || [];
  const prodIdAndPrice = new Map();
  allProducts.forEach(p => prodIdAndPrice.set(p.id, p.price));

  // Coupon already inserted directly

  // Register 10 users
  console.log('Registering users...');
  const userTokens = [];
  for (const user of users) {
    try {
      const userData = await registerUser(user.name, user.email, USER_PASS);
      console.log(`  Registered user: ${user.email}`);
      userTokens.push({ ...user, userId: userData.user.id });
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (msg.includes('already registered')) {
        console.log(`  User exists: ${user.email}`);
        userTokens.push({ ...user, userId: null });
      } else {
        console.error(`  Failed to register ${user.email}: ${msg}`);
        userTokens.push({ ...user, userId: null });
      }
    }
  }

  // For each user: add address, add item to cart, then place order
  console.log('Creating orders for users...');
  for (const user of userTokens) {
    const token = await login(user.email, USER_PASS);
    const addr = await addAddress(token, user.userId);
    const prodList = allProducts.filter(p => p.name !== 'Cotton T-Shirt');
    const randomProduct = prodList[Math.floor(Math.random() * prodList.length)];
    if (!randomProduct) continue;
    await addToCart(token, randomProduct.id);
    await placeOrder(token, addr.id);
    console.log(`  Order placed for ${user.email}`);
  }

  console.log('=== Seeding completed successfully ===');
}

main().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});