-- V10__fashion_data.sql

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;

SET FOREIGN_KEY_CHECKS = 1;

SET @cat1 = UNHEX(REPLACE('11111111-1111-1111-1111-111111111111', '-', ''));
SET @cat2 = UNHEX(REPLACE('22222222-2222-2222-2222-222222222222', '-', ''));
SET @cat3 = UNHEX(REPLACE('33333333-3333-3333-3333-333333333333', '-', ''));
SET @cat4 = UNHEX(REPLACE('44444444-4444-4444-4444-444444444444', '-', ''));
SET @cat5 = UNHEX(REPLACE('55555555-5555-5555-5555-555555555555', '-', ''));

INSERT INTO categories (id, name, slug, description, image_url) VALUES 
(@cat1, 'Avant-Garde', 'avant-garde', 'Unconventional and experimental fashion.', '/images/fashion-1.jpg'),
(@cat2, 'Minimalist', 'minimalist', 'Clean lines, subdued colors, and simple silhouettes.', '/images/fashion-2.jpg'),
(@cat3, 'Outerwear', 'outerwear', 'Coats, jackets, and protective luxury layers.', '/images/fashion-3.jpg'),
(@cat4, 'Knitwear', 'knitwear', 'Tactile, textured, and structural knits.', '/images/fashion-4.jpg'),
(@cat5, 'Footwear', 'footwear', 'Architectural footwear and brutalist boots.', '/images/fashion-5.jpg');

SET @prod1 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod1, 'Yohji Coat', 'yohji-coat', 'A sweeping oversized coat in pure wool.', 2400.00, 'YOH-001', @cat1, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-6.jpg', true, @prod1);

SET @prod2 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod2, 'Structural Shirt', 'structural-shirt', 'A white poplin shirt with asymmetrical seams.', 850.00, 'STR-002', @cat1, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-8.jpg', true, @prod2);

SET @prod3 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod3, 'Monochrome Trouser', 'monochrome-trouser', 'Minimalist wide-leg trouser.', 1200.00, 'MIN-003', @cat2, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-9.jpg', true, @prod3);

SET @prod4 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod4, 'Leather Car Coat', 'leather-car-coat', 'Heavy weight calf leather coat.', 4500.00, 'OUT-004', @cat3, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-10.jpg', true, @prod4);

SET @prod5 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod5, 'Distressed Knit Sweater', 'distressed-knit', 'Heavy distressed pure cotton knit.', 950.00, 'KNI-005', @cat4, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-1.jpg', true, @prod5);

SET @prod6 = UNHEX(REPLACE(UUID(), '-', ''));
INSERT INTO products (id, name, slug, description, price, sku, category_id, active) VALUES 
(@prod6, 'Brutalist Combat Boot', 'brutalist-boot', 'Leather combat boot with metal toe cap.', 1600.00, 'FOO-006', @cat5, true);
INSERT INTO product_images (id, image_url, is_primary, product_id) VALUES (UNHEX(REPLACE(UUID(), '-', '')), '/images/fashion-2.jpg', true, @prod6);

