-- 1. Buat tabel `storage` TERLEBIH DAHULU
CREATE TABLE IF NOT EXISTS storage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- 2. Buat tabel `categories` TERLEBIH DAHULU
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- 3. Barulah buat tabel `products` (yang menggunakan foreign key)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expirationDate TEXT NOT NULL,
  consumedAt TEXT,
  wastedAt TEXT,
  storageId TEXT NOT NULL,
  categoryId TEXT NOT NULL,

  FOREIGN KEY (storageId) REFERENCES storage(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id),

  CHECK (
    consumedAt IS NULL
    OR wastedAt IS NULL
  )
);

