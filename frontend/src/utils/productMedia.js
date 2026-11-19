/**
 * High-quality Unsplash product images mapped by category for luxury e-commerce.
 * Each category has 10 images matching specific product names from seed data.
 * Images are 600x600 with fit=crop for consistent card display.
 */

const CATEGORY_IMAGES = {
  Electronics: [
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop&q=85', // Premium earbuds
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop&q=85', // Luxury smartwatch
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&q=85', // Premium speaker
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea9?w=800&h=800&fit=crop&q=85', // USB hub minimal
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop&q=85', // Laptop workspace
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop&q=85', // Minimal mouse
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop&q=85', // Mechanical keyboard
    'https://images.unsplash.com/photo-1587826080306-b2c3bd5e5f5c?w=800&h=800&fit=crop&q=85', // Webcam setup
    'https://images.unsplash.com/photo-1609592424846-7e8a5f4d6b6a?w=800&h=800&fit=crop&q=85', // Power bank
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop&q=85', // Premium phone case
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=85', // White t-shirt
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&q=85', // Premium jeans
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&q=85', // Luxury sneakers
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=85', // Leather belt
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&q=85', // Designer sunglasses
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=800&fit=crop&q=85', // Cashmere sweater
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&q=85', // Casual button-up
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop&q=85', // Tailored trousers
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=800&fit=crop&q=85', // Silk scarf
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&q=85', // Formal oxfords
  ],
  Home: [
    'https://images.unsplash.com/photo-1584990347449-a6f0e3e64fa4?w=800&h=800&fit=crop&q=85', // Premium cookware
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=800&fit=crop&q=85', // Modern blender
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop&q=85', // Espresso machine
    'https://images.unsplash.com/photo-1594226801341-41427b4e5c2e?w=800&h=800&fit=crop&q=85', // Premium cutlery
    'https://images.unsplash.com/photo-1616627542275-7273d3b5e5cc?w=800&h=800&fit=crop&q=85', // Luxury bedding
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=800&fit=crop&q=85', // Woven basket
    'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&h=800&fit=crop&q=85', // Designer lamp
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&q=85', // Cookware set
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=800&fit=crop&q=85', // Porcelain plates
    'https://images.unsplash.com/photo-1563861826100-9cb8680ae0e4?w=800&h=800&fit=crop&q=85', // Minimal wall clock
  ],
  Books: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1521123845560-14093637eadd?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1521123845560-14093637eadd?w=800&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=800&fit=crop&q=85',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&q=85', // Premium yoga mat
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop&q=85', // Dumbbell set
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&h=800&fit=crop&q=85', // Resistance bands
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=85', // Jump rope
    'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&h=800&fit=crop&q=85', // Running belt
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=85', // Gym gloves
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=800&fit=crop&q=85', // Premium water bottle
    'https://images.unsplash.com/photo-1609050470947-f35aa6071493?w=800&h=800&fit=crop&q=85', // Foam roller
    'https://images.unsplash.com/photo-1571731956672-f2e94c4f1c0a?w=800&h=800&fit=crop&q=85', // Gym towel
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=85', // Knee support
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=800&fit=crop&q=85', // Luxury perfume
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&q=85', // Skincare collection
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&q=85', // Face serum
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop&q=85', // Premium hair dryer
    'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&h=800&fit=crop&q=85', // Beard trimmer
    'https://images.unsplash.com/photo-1570194065650-d99fb4b38c34?w=800&h=800&fit=crop&q=85', // Body lotion
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&q=85', // Sunscreen
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&q=85', // Makeup palette
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&q=85', // Face cleanser
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&q=85', // Hairbrush set
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&q=85', // Leather wallet
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&h=800&fit=crop&q=85', // Passport cover
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop&q=85', // Travel pouch
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=800&fit=crop&q=85', // Leather sling bag
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop&q=85', // Watch band
    'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=800&h=800&fit=crop&q=85', // Key holder
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=800&fit=crop&q=85', // Laptop sleeve
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=800&fit=crop&q=85', // Belt bag
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=800&fit=crop&q=85', // Canvas tote
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&q=85', // Card holder
  ],
};

const CATEGORY_ORDER = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Accessories'];

// Simple hash for deterministic image selection
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export const getProductImageUrl = (productOrItem, offset = 0) => {
  // Keep product-specific uploads, but replace generic category art with product imagery.
  const stored = productOrItem?.images?.[0]?.imageUrl || 
                  productOrItem?.images?.[0]?.url || 
                  productOrItem?.imageUrl;
  const isGenericImage = stored && (
    /placeholder/i.test(stored) ||
    /(?:^|\/)category-[^/?#]+\.(?:svg|png|jpe?g|webp)(?:[?#]|$)/i.test(stored)
  );
  if (stored && !isGenericImage) return stored;

  if (!productOrItem) return null;

  // Detect category from various possible field names
  const categoryName = productOrItem.categoryName ||
    productOrItem.category ||
    productOrItem.categorySlug ||
    '';
  const normalized = String(categoryName).trim();
  
  // Find matching category
  let catIndex = normalized
    ? CATEGORY_ORDER.findIndex(c =>
      normalized.toLowerCase() === c.toLowerCase() ||
      normalized.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(normalized.toLowerCase())
    )
    : -1;
  
  if (catIndex === -1) {
    // Fallback: try matching brand field
    const brand = String(productOrItem.brand || '').trim().toLowerCase();
    catIndex = brand
      ? CATEGORY_ORDER.findIndex(c => brand === c.toLowerCase())
      : -1;
  }
  
  if (catIndex === -1) {
    // Global fallback - luxury lifestyle image
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=85';
  }

  const categoryKey = CATEGORY_ORDER[catIndex];
  const images = CATEGORY_IMAGES[categoryKey];
  if (!images || images.length === 0) return null;

  // Deterministic: hash product name or ID to pick image
  const id = productOrItem.id || productOrItem.productId || '';
  const name = productOrItem.name || productOrItem.productName || '';
  const hash = hashCode(id + name);
  const imageIndex = ((hash + Math.trunc(offset)) % images.length + images.length) % images.length;
  
  return images[imageIndex];
};

// Also export the category images for direct use (e.g., category cards)
export const getCategoryImage = (categoryName) => {
  const catIndex = CATEGORY_ORDER.findIndex(c => 
    c.toLowerCase() === (categoryName || '').toLowerCase()
  );
  if (catIndex === -1) return null;
  const images = CATEGORY_IMAGES[CATEGORY_ORDER[catIndex]];
  return images ? images[0] : null;
};