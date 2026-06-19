import axios from 'axios';

const BASE = 'http://localhost:8081/api/v1';
const ADMIN_PASS = 'admin123';
const USER_PASS = 'user12345';

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

async function registerUser(token, name, email, password) {
  const r = await axios.post(`${BASE}/auth/register', {
    fullName: name, email, password, phone: '9999999999'
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

async function addToWishlist(token, productId) {
  const r = await axios.post(`${BASE}/wishlist/items`, {
    productId, priceAtAdd: 499
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function placeOrder(token, addressId, productId) {
  const r = await axios.post(`${BASE}/orders`, {
    addressId, couponCode: 'J12345',
    items: [{ productId, quantity: 1, purchasePrice: 499 }],
    paymentMethod: 'COD'
  }, { headers: { Authorization: `Bearer ${token}` } });
  return r.data.data;
}

async function main() {
  console.log('=== Seeding data via API ===');
  
  // Register admin
  const adminToken = await login('admin@velora.com', ADMIN_PASS);
  console.log('Admin logged in');
  
  // Get products
  const prodRes = await axios.get(`${BASE}/products?limit=20`);
  const products = prodRes.data.data.content || prodRes.data.data || [];
  console.log('Products found:', products.length);
  
  // Register users and create data
  for (const u of users) {
    console.log('Seeding:', u.name);
    const token = await login(u.email, USER_PASS);
    const addr = await addAddress(token, u.email);
    const pid = products[0]?.id;
    if (pid) {
      await addToWishlist(token, pid);
      await placeOrder(token, addr.id, pid);
    }
  }
  
  console.log('=== Done ===');
}

main().catch(console.error);