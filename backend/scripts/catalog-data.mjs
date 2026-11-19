import fs from 'node:fs/promises';
import path from 'node:path';

const CATEGORY_DESCRIPTIONS = new Map([
  ['Electronics', 'Essential devices and practical tech accessories'],
  ['Fashion', 'Apparel and wardrobe staples'],
  ['Home', 'Functional home and kitchen goods'],
  ['Books', 'Curated reading and learning picks'],
  ['Sports', 'Training and outdoor equipment'],
  ['Beauty', 'Personal care and grooming essentials'],
  ['Accessories', 'Daily carry and finishing pieces'],
]);

const PREFERRED_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Books',
  'Sports',
  'Beauty',
  'Accessories',
];

const BASE_PRICES = [1299, 999, 1499, 499, 1799, 1499, 799];
const PRICE_STEP = 125;

async function tryReadJson(filePath) {
  if (!filePath) return null;
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fallbackCatalog() {
  const categories = PREFERRED_CATEGORIES.map((name) => ({
    name,
    description: CATEGORY_DESCRIPTIONS.get(name) ?? `${name} selections`,
  }));

  const productNames = {
    Electronics: [
      'Wireless Earbuds',
      'Smart Watch',
      'Bluetooth Speaker',
      'USB-C Hub',
      'Laptop Stand',
      'Wireless Mouse',
      'Mechanical Keyboard',
      'HD Webcam',
      'Power Bank',
      'Phone Case',
    ],
    Fashion: [
      'Cotton T-Shirt',
      'Denim Jeans',
      'Running Shoes',
      'Leather Belt',
      'Sunglasses',
      'Wool Sweater',
      'Casual Shirt',
      'Tailored Trousers',
      'Silk Scarf',
      'Formal Shoes',
    ],
    Home: [
      'Pressure Cooker',
      'Blender',
      'Coffee Maker',
      'Cutlery Set',
      'Bed Sheet Set',
      'Storage Basket',
      'Table Lamp',
      'Cookware Set',
      'Dinner Plate Set',
      'Wall Clock',
    ],
    Books: [
      'Design Thinking',
      'JavaScript Patterns',
      'The Product Playbook',
      'Mindful Leadership',
      'Startup Systems',
      'Brand Storytelling',
      'Data Structures Guide',
      'Design Fundamentals',
      'Time Management Handbook',
      'Creative Process Notes',
    ],
    Sports: [
      'Yoga Mat',
      'Dumbbell Set',
      'Resistance Bands',
      'Skipping Rope',
      'Running Belt',
      'Training Gloves',
      'Hydration Bottle',
      'Foam Roller',
      'Gym Towel',
      'Knee Support',
    ],
    Beauty: [
      'Perfume',
      'Skincare Set',
      'Face Serum',
      'Hair Dryer',
      'Beard Trimmer',
      'Body Lotion',
      'Sunscreen',
      'Makeup Kit',
      'Face Wash',
      'Comb Set',
    ],
    Accessories: [
      'Leather Wallet',
      'Passport Holder',
      'Travel Pouch',
      'Sling Bag',
      'Watch Strap',
      'Key Organizer',
      'Laptop Sleeve',
      'Belt Bag',
      'Tote Bag',
      'Card Holder',
    ],
  };

  const products = categories.flatMap((category, categoryIndex) =>
    productNames[category.name].map((name, productIndex) => ({
      name,
      category: category.name,
      price: BASE_PRICES[categoryIndex] + (productIndex * PRICE_STEP),
      stock: 20 + (productIndex * 5),
    }))
  );

  return { categories, products };
}

export async function createCatalogData() {
  const candidates = [
    process.env.PRODUCTS_FILE,
    path.resolve(process.cwd(), 'products_100.json'),
    path.resolve(process.cwd(), '..', 'products_100.json'),
    path.resolve(process.cwd(), '..', '..', 'products_100.json'),
  ];

  let source = null;
  for (const candidate of candidates) {
    source = await tryReadJson(candidate);
    if (Array.isArray(source) && source.length > 0) {
      break;
    }
    source = null;
  }

  if (!Array.isArray(source) || source.length === 0) {
    return fallbackCatalog();
  }

  const grouped = new Map();
  for (const item of source) {
    const category = item.category?.trim();
    if (!category) continue;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category).push(item);
  }

  const categories = [];
  for (const categoryName of PREFERRED_CATEGORIES) {
    const items = grouped.get(categoryName);
    if (items?.length >= 10) {
      categories.push({
        name: categoryName,
        description: CATEGORY_DESCRIPTIONS.get(categoryName) ?? `${categoryName} selections`,
      });
    }
    if (categories.length === 7) break;
  }

  if (categories.length < 7) {
    for (const [categoryName, items] of grouped.entries()) {
      if (categories.find((category) => category.name === categoryName)) continue;
      if (items.length >= 10) {
        categories.push({
          name: categoryName,
          description: CATEGORY_DESCRIPTIONS.get(categoryName) ?? `${categoryName} selections`,
        });
      }
      if (categories.length === 7) break;
    }
  }

  if (categories.length < 7) {
    return fallbackCatalog();
  }

  const products = categories.flatMap((category, categoryIndex) => {
    const items = grouped.get(category.name).slice(0, 10);
    return items.map((item, productIndex) => ({
      name: item.name,
      category: category.name,
      price: BASE_PRICES[categoryIndex] + (productIndex * PRICE_STEP),
      stock: Number.isFinite(item.quantity) ? item.quantity : 20 + (productIndex * 5),
    }));
  });

  return { categories, products };
}

export function slugForName(name, suffix = '') {
  const base = slugify(name);
  return suffix ? `${base}-${slugify(suffix)}` : base;
}
