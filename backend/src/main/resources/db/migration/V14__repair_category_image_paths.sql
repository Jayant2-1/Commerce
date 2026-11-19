UPDATE categories
SET image_url = REPLACE(image_url, '.jpg', '.svg')
WHERE image_url LIKE '/images/fashion-%.jpg';
