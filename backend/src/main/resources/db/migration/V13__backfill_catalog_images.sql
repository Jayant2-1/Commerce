INSERT INTO product_images (
    id,
    image_url,
    alt_text,
    is_primary,
    display_order,
    product_id
)
SELECT
    UNHEX(REPLACE(UUID(), '-', '')),
    CASE c.slug
        WHEN 'sports' THEN '/images/category-sports.svg'
        WHEN 'beauty' THEN '/images/category-beauty.svg'
        WHEN 'electronics' THEN '/images/category-electronics.svg'
        WHEN 'accessories' THEN '/images/category-accessories.svg'
        WHEN 'home' THEN '/images/category-home.svg'
        WHEN 'books' THEN '/images/category-books.svg'
        WHEN 'fashion' THEN '/images/category-fashion.svg'
        ELSE '/images/category-product.svg'
    END,
    p.name,
    TRUE,
    0,
    p.id
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images pi
    WHERE pi.product_id = p.id
);
