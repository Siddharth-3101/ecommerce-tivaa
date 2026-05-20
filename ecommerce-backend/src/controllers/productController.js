import db from "../config/db.js";
import { getCache, setCache } from "../utils/cache.js";

// ===========================================================
// GET PRODUCTS WITH PAGINATION
// ===========================================================
export const getProducts = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = Number(page);
  limit = Number(limit);

  const offset = (page - 1) * limit;
  const cacheKey = `products_${page}_${limit}`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  const sql = `
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        LIMIT ? OFFSET ?
    `;

  db.query(sql, [limit, offset], async (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const response = {
      page,
      limit,
      count: rows.length,
      products: rows,
    };

    await setCache(cacheKey, response, 300); // cache for 5 minutes

    return res.json(response);
  });
};

// ===========================================================
// GET A SINGLE PRODUCT BY ID
// ===========================================================
export const getProductById = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = true
    `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(rows[0]);
  });
};

// ===========================================================
// ADD NEW PRODUCT
// ===========================================================
export const addProduct = (req, res) => {
  const { name, description, price, stock, category_id, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  const sql = `
        INSERT INTO products (name, description, price, stock, category_id, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [name, description, price, stock, category_id, image_url],
    (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      return res.json({ message: "Product added successfully" });
    }
  );
};

// ===========================================================
// UPDATE PRODUCT
// ===========================================================
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image_url } = req.body;

  const sql = `
        UPDATE products 
        SET name=?, description=?, price=?, stock=?, category_id=?, image_url=?
        WHERE id=?
    `;

  db.query(
    sql,
    [name, description, price, stock, category_id, image_url, id],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json({ message: "Product updated successfully" });
    }
  );
};

// ===========================================================
// DELETE PRODUCT
// ===========================================================
export const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("UPDATE products SET is_active=false WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully" });
  });
};

// ===========================================================
// SEARCH PRODUCTS
// ===========================================================
export const searchProducts = (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ message: "Search query missing" });

  const searchTerm = `%${q}%`;

  const sql = `
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND (p.name LIKE ? 
        OR p.description LIKE ?
        OR c.name LIKE ?)
    `;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(rows);
  });
};

// ===========================================================
// FILTER PRODUCTS (Category, Price, Sort)
// ===========================================================
export const filterProducts = (req, res) => {
  const { category, min_price, max_price, sort } = req.query;

  let sql = `
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
    `;

  const params = [];

  if (category) {
    sql += " AND c.name = ?";
    params.push(category);
  }

  if (min_price) {
    sql += " AND p.price >= ?";
    params.push(min_price);
  }

  if (max_price) {
    sql += " AND p.price <= ?";
    params.push(max_price);
  }

  if (sort === "price_low") sql += " ORDER BY p.price ASC";
  if (sort === "price_high") sql += " ORDER BY p.price DESC";
  if (sort === "name_asc") sql += " ORDER BY p.name ASC";
  if (sort === "name_desc") sql += " ORDER BY p.name DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json(rows);
  });
};
