import db from "../config/db.js";
import { getCache, setCache, clearCache } from "../utils/cache.js";

// ===========================================================
// GET PRODUCTS WITH PAGINATION
// ===========================================================
export const getProducts = async (req, res) => {
  let { page = 1, limit = 12, admin, category, stock, visibility } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 12;

  const offset = (page - 1) * limit;
  
  // Cache key: bypass cache for admin/filtered requests to see real-time updates instantly.
  const isPlainPublic = admin !== "true" && !category && !stock && !visibility;
  const cacheKey = isPlainPublic ? `products_${page}_${limit}` : null;

  if (cacheKey) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
  }

  // Base count sql
  let countSql = admin === "true"
    ? "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true"
    : "SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true AND p.is_visible = true";
  
  const countParams = [];

  // 1. Category Filter
  if (category && category !== "All") {
    if (!isNaN(category)) {
      countSql += " AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))";
      countParams.push(parseInt(category), parseInt(category));
    } else {
      countSql += " AND (c.name = ? OR p.category_id IN (SELECT sub.id FROM categories sub JOIN categories parent ON sub.parent_id = parent.id WHERE parent.name = ?))";
      countParams.push(category, category);
    }
  }

  // 2. Stock Filter
  if (stock === "in_stock") {
    countSql += " AND p.stock > 0";
  } else if (stock === "out_of_stock") {
    countSql += " AND p.stock = 0";
  }

  // 3. Visibility Filter
  if (admin === "true" && visibility) {
    if (visibility === "visible") {
      countSql += " AND p.is_visible = true";
    } else if (visibility === "hidden") {
      countSql += " AND p.is_visible = false";
    }
  }

  db.query(countSql, countParams, (countErr, countRows) => {
    if (countErr) {
      console.error("DB Error:", countErr);
      return res.status(500).json({ message: "Database error: " + countErr.message });
    }

    const total = countRows[0]?.total || 0;

    let sql = `
          SELECT p.*, c.name AS category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true ${admin === "true" ? "" : "AND p.is_visible = true"}
      `;

    const selectParams = [];

    // Reapply filters
    if (category && category !== "All") {
      if (!isNaN(category)) {
        sql += " AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))";
        selectParams.push(parseInt(category), parseInt(category));
      } else {
        sql += " AND (c.name = ? OR p.category_id IN (SELECT sub.id FROM categories sub JOIN categories parent ON sub.parent_id = parent.id WHERE parent.name = ?))";
        selectParams.push(category, category);
      }
    }

    if (stock === "in_stock") {
      sql += " AND p.stock > 0";
    } else if (stock === "out_of_stock") {
      sql += " AND p.stock = 0";
    }

    if (admin === "true" && visibility) {
      if (visibility === "visible") {
        sql += " AND p.is_visible = true";
      } else if (visibility === "hidden") {
        sql += " AND p.is_visible = false";
      }
    }

    sql += " ORDER BY (p.stock > 0) DESC, p.id DESC LIMIT ? OFFSET ?";
    selectParams.push(limit, offset);

    db.query(sql, selectParams, async (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      const response = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        products: rows,
      };

      if (cacheKey) {
        await setCache(cacheKey, response, 300); // cache for 5 minutes
      }

      return res.json(response);
    });
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
      return res.status(500).json({ message: "Database error: " + err.message });
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
  const { name, description, price, purchase_price, discounted_price, stock, category_id, image_url, variations, features } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  // Prevent MySQL strict mode errors by converting empty strings to null/0 for numeric columns
  const safeStock = stock === "" || stock === undefined ? 0 : stock;
  const safeCategoryId = category_id === "" || category_id === undefined ? null : category_id;
  const safePurchasePrice = purchase_price === "" || purchase_price === undefined ? null : purchase_price;
  const safeDiscountedPrice = discounted_price === "" || discounted_price === undefined ? null : discounted_price;

  const sql = `
        INSERT INTO products (name, description, price, purchase_price, discounted_price, stock, category_id, image_url, variations, features)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [name, description, price, safePurchasePrice, safeDiscountedPrice, safeStock, safeCategoryId, image_url, variations || null, features || null],
    async (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      // Clear cache to ensure instant visibility
      await clearCache("products");

      return res.json({ message: "Product added successfully" });
    }
  );
};

// ===========================================================
// UPDATE PRODUCT
// ===========================================================
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, purchase_price, discounted_price, stock, category_id, image_url, variations, features } = req.body;

  // Prevent MySQL strict mode errors by converting empty strings to null/0 for numeric columns
  const safeStock = stock === "" || stock === undefined ? 0 : stock;
  const safeCategoryId = category_id === "" || category_id === undefined ? null : category_id;
  const safePurchasePrice = purchase_price === "" || purchase_price === undefined ? null : purchase_price;
  const safeDiscountedPrice = discounted_price === "" || discounted_price === undefined ? null : discounted_price;

  const sql = `
        UPDATE products 
        SET name=?, description=?, price=?, purchase_price=?, discounted_price=?, stock=?, category_id=?, image_url=?, variations=?, features=?
        WHERE id=?
    `;

  db.query(
    sql,
    [name, description, price, safePurchasePrice, safeDiscountedPrice, safeStock, safeCategoryId, image_url, variations || null, features || null, id],
    async (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Clear cache to ensure instant visibility
      await clearCache("products");

      return res.json({ message: "Product updated successfully" });
    }
  );
};

// ===========================================================
// DELETE PRODUCT
// ===========================================================
export const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query("UPDATE products SET is_active=false WHERE id = ?", [id], async (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Clear cache to ensure instant visibility
    await clearCache("products");

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
        WHERE p.is_active = true AND p.is_visible = true AND (p.name LIKE ? 
        OR p.description LIKE ?
        OR c.name LIKE ?)
        ORDER BY (p.stock > 0) DESC, p.id DESC
    `;

  db.query(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
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
        WHERE p.is_active = true AND p.is_visible = true
    `;

  const params = [];

  if (category) {
    sql += " AND (c.name = ? OR p.category_id IN (SELECT sub.id FROM categories sub JOIN categories parent ON sub.parent_id = parent.id WHERE parent.name = ?))";
    params.push(category, category);
  }

  if (min_price) {
    sql += " AND p.price >= ?";
    params.push(min_price);
  }

  if (max_price) {
    sql += " AND p.price <= ?";
    params.push(max_price);
  }

  if (sort === "price_low") sql += " ORDER BY (p.stock > 0) DESC, p.price ASC";
  else if (sort === "price_high") sql += " ORDER BY (p.stock > 0) DESC, p.price DESC";
  else if (sort === "name_asc") sql += " ORDER BY (p.stock > 0) DESC, p.name ASC";
  else if (sort === "name_desc") sql += " ORDER BY (p.stock > 0) DESC, p.name DESC";
  else sql += " ORDER BY (p.stock > 0) DESC, p.id DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
    }

    return res.json(rows);
  });
};

// ===========================================================
// TOGGLE PRODUCT VISIBILITY (Admin Only)
// ===========================================================
export const toggleProductVisibility = (req, res) => {
  const { id } = req.params;

  db.query("SELECT is_visible FROM products WHERE id = ?", [id], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const nextVisibility = !rows[0].is_visible;

    db.query("UPDATE products SET is_visible = ? WHERE id = ?", [nextVisibility, id], async (updateErr, result) => {
      if (updateErr) {
        console.error("DB Error:", updateErr);
        return res.status(500).json({ message: "Database error: " + updateErr.message });
      }

      // Clear cache to ensure instant visibility
      await clearCache("products");

      return res.json({ 
        message: `Product is now ${nextVisibility ? "visible" : "hidden"}`,
        is_visible: nextVisibility 
      });
    });
  });
};

// ===========================================================
// ADMIN: BULK DELETE PRODUCTS
// ===========================================================
export const bulkDeleteProducts = (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid payload: expected an array of product ids" });
  }

  db.query(
    "UPDATE products SET is_active = false WHERE id IN (?)",
    [ids],
    async (err, result) => {
      if (err) {
        console.error("DB Error bulk deleting products:", err);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      await clearCache("products");
      return res.json({ message: `${result.affectedRows} products deleted successfully` });
    }
  );
};

// ===========================================================
// ADMIN: RESET AUTO INCREMENT COUNTER
// ===========================================================
export const resetProductAutoIncrement = (req, res) => {
  db.query("SELECT MAX(id) as maxId FROM products", (err, rows) => {
    if (err) {
      console.error("DB Error getting max product ID:", err);
      return res.status(500).json({ message: "Database error: " + err.message });
    }

    const maxId = rows[0]?.maxId || 0;
    const nextId = maxId + 1;

    db.query(`ALTER TABLE products AUTO_INCREMENT = ${nextId}`, (alterErr) => {
      if (alterErr) {
        console.error("DB Error altering auto increment:", alterErr);
        return res.status(500).json({ message: "Database error: " + alterErr.message });
      }
      return res.json({ 
        message: `Product ID counter successfully reset to ${nextId}`, 
        nextId 
      });
    });
  });
};

