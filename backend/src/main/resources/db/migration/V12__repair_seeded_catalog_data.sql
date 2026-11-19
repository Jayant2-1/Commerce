UPDATE product_images
SET image_url = REPLACE(image_url, '.jpg', '.svg')
WHERE image_url LIKE '/images/fashion-%.jpg';

INSERT INTO inventory (
    id,
    stock_quantity,
    reserved_quantity,
    sold_quantity,
    sku,
    low_stock_threshold,
    in_stock,
    product_id
)
SELECT
    UNHEX(REPLACE(UUID(), '-', '')),
    20,
    0,
    0,
    p.sku,
    5,
    TRUE,
    p.id
FROM products p
WHERE p.slug IN (
    'yohji-coat',
    'structural-shirt',
    'monochrome-trouser',
    'leather-car-coat',
    'distressed-knit',
    'brutalist-boot'
)
AND NOT EXISTS (
    SELECT 1
    FROM inventory
    WHERE inventory.product_id = p.id
);
