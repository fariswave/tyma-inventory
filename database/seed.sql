PRAGMA foreign_keys = ON;

BEGIN IMMEDIATE;

INSERT OR IGNORE INTO categories (id, name) VALUES
  ('cat-canned', 'Canned Goods'),
  ('cat-dairy', 'Dairy'),
  ('cat-drinks', 'Drinks'),
  ('cat-frozen', 'Frozen Foods'),
  ('cat-grains', 'Grains & Pasta'),
  ('cat-household', 'Household'),
  ('cat-snacks', 'Snacks'),
  ('cat-spices', 'Spices & Condiments'),
  ('cat-produce', 'Produce'),
  ('cat-baking', 'Baking'),
  ('cat-others', 'Others');

INSERT OR IGNORE INTO storage (id, name) VALUES
  ('sto-pantry', 'Pantry'),
  ('sto-fridge', 'Fridge'),
  ('sto-freezer', 'Freezer'),
  ('sto-cabinet', 'Cabinet'),
  ('sto-others', 'Others');

WITH seed_products (n, name, category_id, storage_id, expiration_offset, status) AS (
  VALUES
    ( 1, 'Canned Chickpeas',       'cat-canned',    'sto-pantry',  365, 'active'),
    ( 2, 'Canned Tomatoes',        'cat-canned',    'sto-pantry',   45, 'active'),
    ( 3, 'Canned Sweet Corn',      'cat-canned',    'sto-cabinet',  -3, 'active'),
    ( 4, 'Canned Tuna',            'cat-canned',    'sto-pantry',    7, 'consumed'),
    ( 5, 'Canned Kidney Beans',    'cat-canned',    'sto-others',  180, 'active'),

    ( 6, 'Whole Milk',             'cat-dairy',     'sto-fridge',    1, 'active'),
    ( 7, 'Greek Yogurt',           'cat-dairy',     'sto-fridge',    7, 'active'),
    ( 8, 'Cheddar Cheese',         'cat-dairy',     'sto-fridge',   45, 'active'),
    ( 9, 'Salted Butter',          'cat-dairy',     'sto-fridge',   -1, 'wasted'),
    (10, 'Cottage Cheese',         'cat-dairy',     'sto-fridge',    3, 'active'),

    (11, 'Orange Juice',           'cat-drinks',    'sto-fridge',    7, 'active'),
    (12, 'Sparkling Water',        'cat-drinks',    'sto-pantry',  365, 'active'),
    (13, 'Apple Juice',            'cat-drinks',    'sto-cabinet',  30, 'active'),
    (14, 'Oat Milk',               'cat-drinks',    'sto-fridge',   -3, 'active'),
    (15, 'Green Tea',              'cat-drinks',    'sto-others',  180, 'consumed'),

    (16, 'Frozen Peas',            'cat-frozen',    'sto-freezer', 180, 'active'),
    (17, 'Frozen Blueberries',     'cat-frozen',    'sto-freezer', 365, 'active'),
    (18, 'Frozen Pizza',           'cat-frozen',    'sto-freezer',  45, 'active'),
    (19, 'Frozen Broccoli',        'cat-frozen',    'sto-freezer',  -1, 'active'),
    (20, 'Vanilla Ice Cream',      'cat-frozen',    'sto-freezer',   7, 'wasted'),

    (21, 'Spaghetti',              'cat-grains',    'sto-pantry',  365, 'active'),
    (22, 'Brown Rice',             'cat-grains',    'sto-pantry',  180, 'active'),
    (23, 'Rolled Oats',            'cat-grains',    'sto-cabinet',  45, 'active'),
    (24, 'Couscous',               'cat-grains',    'sto-others',    7, 'active'),
    (25, 'Quinoa',                 'cat-grains',    'sto-pantry',   -3, 'active'),

    (26, 'Dish Soap',              'cat-household', 'sto-cabinet', 365, 'active'),
    (27, 'Laundry Detergent',      'cat-household', 'sto-cabinet', 180, 'active'),
    (28, 'Paper Towels',           'cat-household', 'sto-others',  365, 'active'),
    (29, 'Surface Cleaner',        'cat-household', 'sto-cabinet',  30, 'consumed'),
    (30, 'Hand Soap',              'cat-household', 'sto-cabinet',   1, 'active'),

    (31, 'Potato Chips',           'cat-snacks',    'sto-pantry',    7, 'active'),
    (32, 'Dark Chocolate',         'cat-snacks',    'sto-cabinet',  45, 'active'),
    (33, 'Salted Crackers',        'cat-snacks',    'sto-pantry',   -1, 'active'),
    (34, 'Mixed Nuts',             'cat-snacks',    'sto-pantry',  180, 'active'),
    (35, 'Granola Bars',           'cat-snacks',    'sto-others',    3, 'wasted'),

    (36, 'Olive Oil',              'cat-spices',    'sto-pantry',  365, 'active'),
    (37, 'Soy Sauce',              'cat-spices',    'sto-cabinet', 180, 'active'),
    (38, 'Ground Cinnamon',        'cat-spices',    'sto-cabinet', 365, 'active'),
    (39, 'Tomato Ketchup',         'cat-spices',    'sto-fridge',    7, 'active'),
    (40, 'Dijon Mustard',          'cat-spices',    'sto-fridge',   -3, 'active'),

    (41, 'Fresh Carrots',          'cat-produce',   'sto-fridge',    3, 'active'),
    (42, 'Apples',                 'cat-produce',   'sto-fridge',    7, 'active'),
    (43, 'Baby Spinach',           'cat-produce',   'sto-fridge',   -1, 'wasted'),
    (44, 'Lemons',                 'cat-produce',   'sto-fridge',   14, 'active'),
    (45, 'Potatoes',               'cat-produce',   'sto-pantry',   30, 'active'),

    (46, 'All-Purpose Flour',      'cat-baking',    'sto-pantry',  180, 'active'),
    (47, 'Baking Powder',          'cat-baking',    'sto-cabinet', 365, 'active'),
    (48, 'Brown Sugar',            'cat-baking',    'sto-cabinet', 365, 'active'),
    (49, 'Chocolate Chips',         'cat-baking',    'sto-pantry',   -3, 'active'),
    (50, 'Vanilla Extract',        'cat-baking',    'sto-others',   45, 'consumed')
)
INSERT OR IGNORE INTO products (
  id,
  name,
  quantity,
  note,
  expirationDate,
  consumedAt,
  wastedAt,
  storageId,
  categoryId
)
SELECT
  printf('seed-product-%02d', n),
  name,
  1 + (n % 5),
  '',
  date('now', printf('%+d days', expiration_offset)),
  CASE WHEN status = 'consumed' THEN CURRENT_TIMESTAMP ELSE NULL END,
  CASE WHEN status = 'wasted' THEN CURRENT_TIMESTAMP ELSE NULL END,
  storage_id,
  category_id
FROM seed_products;

COMMIT;
