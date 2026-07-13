import db from "../config/db.js";

// ===========================================================
// HELPER: CALCULATE EFFECTIVE PRODUCT PRICE AND STOCK
// ===========================================================
export const getEffectiveProductPriceAndStock = (product, selectedVariationString) => {
  let price = product.discounted_price ? Number(product.discounted_price) : Number(product.price);
  let originalPrice = Number(product.price);
  let stock = product.stock !== null && product.stock !== undefined ? Number(product.stock) : 999;
  let isDiscounted = !!product.discounted_price;

  if (product.variations && selectedVariationString) {
    try {
      const parsedGroups = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
      if (Array.isArray(parsedGroups)) {
        const selections = selectedVariationString.split(",").reduce((acc, part) => {
          const splitIdx = part.indexOf(":");
          if (splitIdx > -1) {
            const key = part.substring(0, splitIdx).trim().toLowerCase();
            const val = part.substring(splitIdx + 1).trim().toLowerCase();
            acc[key] = val;
          }
          return acc;
        }, {});

        for (const group of parsedGroups) {
          const groupKey = group.name.trim().toLowerCase();
          const selectedVal = selections[groupKey];
          if (selectedVal && group.options) {
            const matchedOption = group.options.find(opt => opt.value.trim().toLowerCase() === selectedVal);
            if (matchedOption) {
              if (matchedOption.price !== undefined && matchedOption.price !== null && matchedOption.price !== "" && Number(matchedOption.price) > 0) {
                const optPrice = Number(matchedOption.price);
                if (product.discounted_price && Number(product.discounted_price) > 0 && Number(product.price) > Number(product.discounted_price)) {
                  price = optPrice;
                  originalPrice = Math.round(optPrice * (Number(product.price) / Number(product.discounted_price)));
                  isDiscounted = true;
                } else {
                  price = optPrice;
                  originalPrice = optPrice;
                  isDiscounted = false;
                }
              }
              if (matchedOption.stock !== undefined && matchedOption.stock !== null && matchedOption.stock !== "") {
                stock = Number(matchedOption.stock);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse variations for pricing calculation", e);
    }
  }

  return { price, originalPrice, stock, isDiscounted };
};

// ===========================================================
// ADD TO CART
// ===========================================================
export const addToCart = (req, res) => {
  const userId = req.user.id;
  let { product_id, quantity, selected_variation } = req.body;

  quantity = Number(quantity);

  if (!product_id || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  // Check if product exists
  const checkProduct = "SELECT * FROM products WHERE id = ?";
  db.query(checkProduct, [product_id], (err, productRows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Dynamic grouping: check if product_id + selected_variation already in cart
    const checkCart = "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (selected_variation = ? OR (selected_variation IS NULL AND ? IS NULL))";
    db.query(checkCart, [userId, product_id, selected_variation || null, selected_variation || null], (errCart, cartRows) => {
      if (errCart) {
        console.error("DB error:", errCart);
        return res.status(500).json({ message: "Database error" });
      }

      const product = productRows[0];
      const { stock: effectiveStock } = getEffectiveProductPriceAndStock(product, selected_variation);
      const stockVal = effectiveStock;

      if (cartRows.length > 0) {
        const newQty = Number(cartRows[0].quantity) + quantity;
        if (newQty > stockVal) {
          return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
        }
        // Increment quantity of existing row
        const updateQty = "UPDATE cart SET quantity = quantity + ? WHERE id = ?";
        db.query(updateQty, [quantity, cartRows[0].id], (errUpdate) => {
          if (errUpdate) {
            console.error("DB error:", errUpdate);
            return res.status(500).json({ message: "Database error" });
          }
          return res.json({ message: "Item quantity updated in cart" });
        });
      } else {
        if (quantity > stockVal) {
          return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
        }
        // Insert new variation row
        const insertRow = "INSERT INTO cart (user_id, product_id, quantity, selected_variation) VALUES (?, ?, ?, ?)";
        db.query(insertRow, [userId, product_id, quantity, selected_variation || null], (errInsert) => {
          if (errInsert) {
            console.error("DB error:", errInsert);
            return res.status(500).json({ message: "Database error" });
          }
          return res.json({ message: "Item added to cart" });
        });
      }
    });
  });
};

// ===========================================================
// GET CART ITEMS
// ===========================================================
export const getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      c.id,
      c.product_id,
      p.name,
      p.price,
      p.image_url,
      c.quantity,
      c.selected_variation,
      p.stock,
      p.variations,
      p.discounted_price
    FROM cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ?
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formattedRows = rows.map(row => {
      const { price: effectivePrice, stock: effectiveStock } = getEffectiveProductPriceAndStock(row, row.selected_variation);
      
      let imageUrl = row.image_url;
      if (row.variations && row.selected_variation) {
        try {
          const parsedGroups = typeof row.variations === 'string' ? JSON.parse(row.variations) : row.variations;
          if (Array.isArray(parsedGroups)) {
            const selections = row.selected_variation.split(",").reduce((acc, part) => {
              const splitIdx = part.indexOf(":");
              if (splitIdx > -1) {
                acc[part.substring(0, splitIdx).trim().toLowerCase()] = part.substring(splitIdx + 1).trim().toLowerCase();
              }
              return acc;
            }, {});

            for (const group of parsedGroups) {
              const groupKey = group.name.trim().toLowerCase();
              const selectedVal = selections[groupKey];
              if (selectedVal && group.options) {
                const matchedOption = group.options.find(opt => opt.value.trim().toLowerCase() === selectedVal);
                if (matchedOption && matchedOption.image_url && matchedOption.image_url.trim()) {
                  imageUrl = matchedOption.image_url.trim() + (row.image_url ? "," + row.image_url : "");
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse variations for cart image resolution", e);
        }
      }

      return {
        id: row.id,
        product_id: row.product_id,
        name: row.name,
        price: effectivePrice,
        image_url: imageUrl,
        quantity: row.quantity,
        selected_variation: row.selected_variation,
        stock: effectiveStock,
        total: effectivePrice * row.quantity
      };
    });

    return res.json(formattedRows);
  });
};

// ===========================================================
// UPDATE CART QUANTITY
// ===========================================================
export const updateCartItem = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  let { quantity } = req.body;

  quantity = Number(quantity);

  if (quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const checkStockSql = `
    SELECT c.quantity AS cart_qty, p.stock 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.id = ? AND c.user_id = ?
  `;
  db.query(checkStockSql, [id, userId], (errStock, stockRows) => {
    if (errStock) {
      console.error("DB error:", errStock);
      return res.status(500).json({ message: "Database error" });
    }
    if (stockRows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const { stock } = stockRows[0];
    const stockVal = stock === null || stock === undefined ? 0 : Number(stock);
    if (quantity > stockVal) {
      return res.status(400).json({ message: `Cannot add more items than available in stock (${stockVal} max)` });
    }

    const sql = `
      UPDATE cart
      SET quantity = ?
      WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [quantity, id, userId], (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      return res.json({ message: "Quantity updated" });
    });
  });
};

// ===========================================================
// REMOVE A SINGLE CART ITEM
// ===========================================================
export const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";

  db.query(sql, [id, userId], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.json({ message: "Item removed" });
  });
};

// ===========================================================
// CLEAR CART (Used After Order Placement)
// ===========================================================
export const clearCart = (req, res) => {
  const userId = req.user.id;

  const sql = "DELETE FROM cart WHERE user_id = ?";

  db.query(sql, [userId], (err) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.json({ message: "Cart cleared" });
  });
};
