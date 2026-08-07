import db from "../config/db.js";

// Helper to sanitize code names (e.g., "Color Option-1" -> "COLOR_OPTION_1")
const sanitizeCode = (str) => {
    if (!str) return "";
    return str
        .toUpperCase()
        .replace(/[^A-Z0-9\s\-_#]/g, "") // allow # for hex color codes
        .replace(/[\s\-]+/g, "_")       // replace space/hyphen with underscore
        .replace(/^_+|_+$/g, "");        // trim leading/trailing underscores
};

// ===========================================================
// ATTRIBUTE CRUD
// ===========================================================

// Get all attributes with category/subcategory name joins
export const getAttributes = (req, res) => {
    const sql = `
        SELECT 
            a.*,
            c.name AS category_name,
            sc.name AS subcategory_name
        FROM attributes a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN categories sc ON a.subcategory_id = sc.id
        ORDER BY a.display_order ASC, a.id ASC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("DB error fetching attributes:", err);
            return res.status(500).json({ message: "DB error fetching attributes" });
        }
        res.json(rows);
    });
};

// Create an attribute
export const createAttribute = (req, res) => {
    const { 
        name, 
        code, 
        description, 
        level, 
        category_id, 
        subcategory_id, 
        control_type, 
        display_order, 
        status,
        show_in_filter,
        allow_multiple_values
    } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Attribute name is required" });
    }

    const attributeLevel = level || "Universal";
    const controlType = control_type || "Dropdown";
    const displayOrder = display_order !== undefined ? Number(display_order) : 0;
    const attributeStatus = status || "Active";
    const showInFilter = show_in_filter !== undefined ? (show_in_filter === true || show_in_filter === 1 || String(show_in_filter).toLowerCase() === 'true' || String(show_in_filter) === '1' ? 1 : 0) : 1;
    const allowMultipleValues = allow_multiple_values !== undefined ? (allow_multiple_values === true || allow_multiple_values === 1 || String(allow_multiple_values).toLowerCase() === 'true' || String(allow_multiple_values) === '1' ? 1 : 0) : 0;

    // Auto-generate code if not provided
    const attributeCode = sanitizeCode(code || name);

    if (!attributeCode) {
        return res.status(400).json({ message: "Invalid attribute code" });
    }

    // Validation based on level
    const targetCategoryId = (attributeLevel === "Category" || attributeLevel === "Subcategory") && category_id ? Number(category_id) : null;
    const targetSubcategoryId = attributeLevel === "Subcategory" && subcategory_id ? Number(subcategory_id) : null;

    if ((attributeLevel === "Category" || attributeLevel === "Subcategory") && !targetCategoryId) {
        return res.status(400).json({ message: "Category is required for Category/Subcategory level" });
    }

    if (attributeLevel === "Subcategory" && !targetSubcategoryId) {
        return res.status(400).json({ message: "Subcategory is required for Subcategory level" });
    }

    // Check if code already exists
    const checkSql = "SELECT id FROM attributes WHERE code = ?";
    db.query(checkSql, [attributeCode], (checkErr, checkRows) => {
        if (checkErr) {
            console.error("DB error checking attribute code:", checkErr);
            return res.status(500).json({ message: "DB error checking attribute code" });
        }

        if (checkRows.length > 0) {
            return res.status(400).json({ message: `Attribute code "${attributeCode}" already exists` });
        }

        const insertSql = `
            INSERT INTO attributes 
                (name, code, description, level, category_id, subcategory_id, control_type, display_order, status, show_in_filter, allow_multiple_values) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [
                name,
                attributeCode,
                description || null,
                attributeLevel,
                targetCategoryId,
                targetSubcategoryId,
                controlType,
                displayOrder,
                attributeStatus,
                showInFilter,
                allowMultipleValues
            ],
            (insertErr, result) => {
                if (insertErr) {
                    console.error("DB error creating attribute:", insertErr);
                    return res.status(500).json({ message: "DB error creating attribute" });
                }
                res.json({ message: "Attribute created successfully", attributeId: result.insertId });
            }
        );
    });
};

// Update an attribute
export const updateAttribute = (req, res) => {
    const { id } = req.params;
    const { 
        name, 
        code, 
        description, 
        level, 
        category_id, 
        subcategory_id, 
        control_type, 
        display_order, 
        status,
        show_in_filter,
        allow_multiple_values
    } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Attribute name is required" });
    }

    const attributeLevel = level || "Universal";
    const controlType = control_type || "Dropdown";
    const displayOrder = display_order !== undefined ? Number(display_order) : 0;
    const attributeStatus = status || "Active";
    const showInFilter = show_in_filter !== undefined ? (show_in_filter === true || show_in_filter === 1 || String(show_in_filter).toLowerCase() === 'true' || String(show_in_filter) === '1' ? 1 : 0) : 1;
    const allowMultipleValues = allow_multiple_values !== undefined ? (allow_multiple_values === true || allow_multiple_values === 1 || String(allow_multiple_values).toLowerCase() === 'true' || String(allow_multiple_values) === '1' ? 1 : 0) : 0;

    const attributeCode = sanitizeCode(code || name);
    if (!attributeCode) {
        return res.status(400).json({ message: "Invalid attribute code" });
    }

    // Validation based on level
    const targetCategoryId = (attributeLevel === "Category" || attributeLevel === "Subcategory") && category_id ? Number(category_id) : null;
    const targetSubcategoryId = attributeLevel === "Subcategory" && subcategory_id ? Number(subcategory_id) : null;

    if ((attributeLevel === "Category" || attributeLevel === "Subcategory") && !targetCategoryId) {
        return res.status(400).json({ message: "Category is required for Category/Subcategory level" });
    }

    if (attributeLevel === "Subcategory" && !targetSubcategoryId) {
        return res.status(400).json({ message: "Subcategory is required for Subcategory level" });
    }

    // Check if code is already used by another attribute
    const checkSql = "SELECT id FROM attributes WHERE code = ? AND id != ?";
    db.query(checkSql, [attributeCode, id], (checkErr, checkRows) => {
        if (checkErr) {
            console.error("DB error checking attribute code:", checkErr);
            return res.status(500).json({ message: "DB error checking attribute code" });
        }

        if (checkRows.length > 0) {
            return res.status(400).json({ message: `Attribute code "${attributeCode}" is already in use` });
        }

        const updateSql = `
            UPDATE attributes 
            SET name = ?, code = ?, description = ?, level = ?, category_id = ?, subcategory_id = ?, control_type = ?, display_order = ?, status = ?, show_in_filter = ?, allow_multiple_values = ?
            WHERE id = ?
        `;

        db.query(
            updateSql,
            [
                name,
                attributeCode,
                description || null,
                attributeLevel,
                targetCategoryId,
                targetSubcategoryId,
                controlType,
                displayOrder,
                attributeStatus,
                showInFilter,
                allowMultipleValues,
                id
            ],
            (updateErr, result) => {
                if (updateErr) {
                    console.error("DB error updating attribute:", updateErr);
                    return res.status(500).json({ message: "DB error updating attribute" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Attribute not found" });
                }
                res.json({ message: "Attribute updated successfully" });
            }
        );
    });
};

// Delete an attribute (cascade deletes values in DB due to FOREIGN KEY constraint ON DELETE CASCADE)
export const deleteAttribute = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM attributes WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error deleting attribute:", err);
            return res.status(500).json({ message: "DB error deleting attribute" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Attribute not found" });
        }
        res.json({ message: "Attribute deleted successfully" });
    });
};


// ===========================================================
// ATTRIBUTE VALUES CRUD
// ===========================================================

// Get values for a specific attribute_id
export const getAttributeValues = (req, res) => {
    const { attribute_id } = req.query;

    let sql = `
        SELECT av.*, a.code AS attribute_code 
        FROM attribute_values av 
        JOIN attributes a ON av.attribute_id = a.id 
        ORDER BY av.attribute_id ASC, av.display_order ASC, av.id ASC
    `;
    let params = [];

    if (attribute_id) {
        sql = `
            SELECT av.*, a.code AS attribute_code 
            FROM attribute_values av 
            JOIN attributes a ON av.attribute_id = a.id 
            WHERE av.attribute_id = ? 
            ORDER BY av.display_order ASC, av.id ASC
        `;
        params = [attribute_id];
    }

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("DB error fetching attribute values:", err);
            return res.status(500).json({ message: "DB error fetching attribute values" });
        }
        res.json(rows);
    });
};

// Create an attribute value
export const createAttributeValue = (req, res) => {
    const { attribute_id, value, code, display_order, status } = req.body;

    if (!attribute_id) {
        return res.status(400).json({ message: "attribute_id is required" });
    }
    if (!value) {
        return res.status(400).json({ message: "Value is required" });
    }

    const displayOrder = display_order !== undefined ? Number(display_order) : 0;
    const valueStatus = status || "Active";
    const valueCode = sanitizeCode(code || value);

    if (!valueCode) {
        return res.status(400).json({ message: "Invalid value code" });
    }

    // Check if value code already exists for this attribute_id
    const checkSql = "SELECT id FROM attribute_values WHERE attribute_id = ? AND code = ?";
    db.query(checkSql, [attribute_id, valueCode], (checkErr, checkRows) => {
        if (checkErr) {
            console.error("DB error checking value code:", checkErr);
            return res.status(500).json({ message: "DB error checking value code" });
        }

        if (checkRows.length > 0) {
            return res.status(400).json({ message: `Value code "${valueCode}" already exists for this attribute` });
        }

        const insertSql = "INSERT INTO attribute_values (attribute_id, value, code, display_order, status) VALUES (?, ?, ?, ?, ?)";
        db.query(
            insertSql,
            [attribute_id, value, valueCode, displayOrder, valueStatus],
            (insertErr, result) => {
                if (insertErr) {
                    console.error("DB error creating attribute value:", insertErr);
                    return res.status(500).json({ message: "DB error creating attribute value" });
                }
                res.json({ message: "Attribute value created successfully", valueId: result.insertId });
            }
        );
    });
};

// Update an attribute value
export const updateAttributeValue = (req, res) => {
    const { id } = req.params;
    const { value, code, display_order, status } = req.body;

    if (!value) {
        return res.status(400).json({ message: "Value is required" });
    }

    const displayOrder = display_order !== undefined ? Number(display_order) : 0;
    const valueStatus = status || "Active";
    const valueCode = sanitizeCode(code || value);

    if (!valueCode) {
        return res.status(400).json({ message: "Invalid value code" });
    }

    // First fetch the attribute_id for this value
    const fetchAttrSql = "SELECT attribute_id FROM attribute_values WHERE id = ?";
    db.query(fetchAttrSql, [id], (fetchErr, fetchRows) => {
        if (fetchErr) {
            console.error("DB error fetching attribute value parent:", fetchErr);
            return res.status(500).json({ message: "DB error fetching attribute value parent" });
        }
        if (fetchRows.length === 0) {
            return res.status(404).json({ message: "Attribute value not found" });
        }

        const attribute_id = fetchRows[0].attribute_id;

        // Check if value code already exists for this attribute_id (excluding current value row)
        const checkSql = "SELECT id FROM attribute_values WHERE attribute_id = ? AND code = ? AND id != ?";
        db.query(checkSql, [attribute_id, valueCode, id], (checkErr, checkRows) => {
            if (checkErr) {
                console.error("DB error checking value code:", checkErr);
                return res.status(500).json({ message: "DB error checking value code" });
            }

            if (checkRows.length > 0) {
                return res.status(400).json({ message: `Value code "${valueCode}" is already in use for this attribute` });
            }

            const updateSql = "UPDATE attribute_values SET value = ?, code = ?, display_order = ?, status = ? WHERE id = ?";
            db.query(
                updateSql,
                [value, valueCode, displayOrder, valueStatus, id],
                (updateErr, result) => {
                    if (updateErr) {
                        console.error("DB error updating attribute value:", updateErr);
                        return res.status(500).json({ message: "DB error updating attribute value" });
                    }
                    res.json({ message: "Attribute value updated successfully" });
                }
            );
        });
    });
};

// Delete an attribute value
export const deleteAttributeValue = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM attribute_values WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DB error deleting attribute value:", err);
            return res.status(500).json({ message: "DB error deleting attribute value" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Attribute value not found" });
        }
        res.json({ message: "Attribute value deleted successfully" });
    });
};

// Bulk import attributes
export const bulkImportAttributes = (req, res) => {
    const attributes = req.body;
    if (!Array.isArray(attributes) || attributes.length === 0) {
        return res.status(400).json({ message: "Invalid payload: expected an array of attributes" });
    }

    db.query("SELECT id FROM categories", (catErr, catRows) => {
        if (catErr) {
            console.error("Error fetching categories for bulk import:", catErr);
            return res.status(500).json({ message: "Database error during category validation" });
        }

        const validCategoryIds = new Set(catRows.map(row => row.id));

        const sql = `
            INSERT INTO attributes (id, name, code, description, level, category_id, subcategory_id, control_type, display_order, status, show_in_filter, allow_multiple_values)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                code = VALUES(code),
                description = VALUES(description),
                level = VALUES(level),
                category_id = VALUES(category_id),
                subcategory_id = VALUES(subcategory_id),
                control_type = VALUES(control_type),
                display_order = VALUES(display_order),
                status = VALUES(status),
                show_in_filter = VALUES(show_in_filter),
                allow_multiple_values = VALUES(allow_multiple_values)
        `;

        const values = [];
        for (let a of attributes) {
            if (!a.name || !a.name.trim()) continue;

            const name = a.name.trim();
            const code = a.code ? a.code.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, "").replace(/[\s\-]+/g, "_") : name.toUpperCase().replace(/[^A-Z0-9]/g, "_");

            const rawCatId = a.category_id ? Number(a.category_id) : null;
            const safeCatId = (rawCatId !== null && validCategoryIds.has(rawCatId)) ? rawCatId : null;

            const rawSubId = a.subcategory_id ? Number(a.subcategory_id) : null;
            const safeSubId = (rawSubId !== null && validCategoryIds.has(rawSubId)) ? rawSubId : null;

            const showInFilter = a.show_in_filter !== undefined ? (a.show_in_filter === true || a.show_in_filter === 1 || String(a.show_in_filter).toLowerCase() === 'true' || String(a.show_in_filter) === '1' ? 1 : 0) : 1;
            const allowMultipleValues = a.allow_multiple_values !== undefined ? (a.allow_multiple_values === true || a.allow_multiple_values === 1 || String(a.allow_multiple_values).toLowerCase() === 'true' || String(a.allow_multiple_values) === '1' ? 1 : 0) : 0;

            values.push([
                a.id ? Number(a.id) : null,
                name,
                code,
                a.description || null,
                a.level || 'Universal',
                safeCatId,
                safeSubId,
                a.control_type || 'Dropdown',
                a.display_order ? Number(a.display_order) : 0,
                a.status || 'Active',
                showInFilter,
                allowMultipleValues
            ]);
        }

        if (values.length === 0) {
            return res.status(400).json({ message: "No valid attributes found to import" });
        }

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error("Error bulk importing attributes:", err);
                return res.status(500).json({ message: "Failed to bulk import attributes: " + err.message });
            }
            res.json({ message: `Successfully imported/updated ${result.affectedRows} attribute records` });
        });
    });
};

// Bulk import attribute values
export const bulkImportAttributeValues = (req, res) => {
    const valuesList = req.body;
    if (!Array.isArray(valuesList) || valuesList.length === 0) {
        return res.status(400).json({ message: "Invalid payload: expected an array of attribute values" });
    }

    db.query("SELECT id, code FROM attributes", (attrErr, attrRows) => {
        if (attrErr) {
            console.error("Error validation attributes:", attrErr);
            return res.status(500).json({ message: "Database error during attribute validation" });
        }

        const codeToIdMap = {};
        const validAttributeIds = new Set();
        attrRows.forEach(row => {
            if (row.code) {
                codeToIdMap[row.code.toUpperCase().trim()] = row.id;
            }
            validAttributeIds.add(row.id);
        });

        const sql = `
            INSERT INTO attribute_values (id, attribute_id, value, code, display_order, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                attribute_id = VALUES(attribute_id),
                value = VALUES(value),
                code = VALUES(code),
                display_order = VALUES(display_order),
                status = VALUES(status)
        `;

        const values = [];
        for (let v of valuesList) {
            if (!v.value || !v.value.trim()) continue;

            let rawAttrId = null;
            if (v.attribute_code) {
                const cleanCode = v.attribute_code.trim().toUpperCase();
                rawAttrId = codeToIdMap[cleanCode] || null;
            }
            if (rawAttrId === null && v.attribute_id) {
                rawAttrId = Number(v.attribute_id);
            }

            if (rawAttrId === null || !validAttributeIds.has(rawAttrId)) {
                // Skip if attribute ID is invalid
                continue;
            }

            const valueStr = v.value.trim();
            const code = v.code ? v.code.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, "").replace(/[\s\-]+/g, "_") : valueStr.toUpperCase().replace(/[^A-Z0-9]/g, "_");

            values.push([
                v.id ? Number(v.id) : null,
                rawAttrId,
                valueStr,
                code,
                v.display_order ? Number(v.display_order) : 0,
                v.status || 'Active'
            ]);
        }

        if (values.length === 0) {
            return res.status(400).json({ message: "No valid attribute values found to import" });
        }

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error("Error bulk importing attribute values:", err);
                return res.status(500).json({ message: "Failed to bulk import attribute values: " + err.message });
            }
            res.json({ message: `Successfully imported/updated ${result.affectedRows} value records` });
        });
    });
};

// ===========================================================
// PRODUCT ATTRIBUTE MAPPING (Admin Only)
// ===========================================================

// Get all active products with category/subcategory joins and mapped attributes
export const getProductAttributesList = (req, res) => {
    const productsSql = `
        SELECT 
            p.id, 
            p.name,
            IF(c.parent_id IS NULL, c.id, c.parent_id) AS category_id,
            IF(c.parent_id IS NULL, NULL, c.id) AS subcategory_id,
            IF(c.parent_id IS NULL, c.name, parent_c.name) AS category_name,
            IF(c.parent_id IS NULL, NULL, c.name) AS subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories parent_c ON c.parent_id = parent_c.id
        WHERE p.is_active = true
        ORDER BY p.id DESC
    `;

    db.query(productsSql, (err, products) => {
        if (err) {
            console.error("DB error fetching products list for attributes:", err);
            return res.status(500).json({ message: "DB error fetching products list for attributes" });
        }

        const mappingsSql = `
            SELECT 
                pa.product_id,
                pa.attribute_id,
                pa.attribute_value_id,
                a.name AS attribute_name,
                a.code AS attribute_code,
                av.value AS attribute_value,
                av.code AS attribute_value_code
            FROM product_attributes pa
            JOIN attributes a ON pa.attribute_id = a.id
            JOIN attribute_values av ON pa.attribute_value_id = av.id
            WHERE a.status = 'Active' AND av.status = 'Active'
        `;

        db.query(mappingsSql, (err2, mappings) => {
            if (err2) {
                console.error("DB error fetching product attributes mappings:", err2);
                return res.status(500).json({ message: "DB error fetching product attributes mappings" });
            }

            // Group mappings by product_id
            const mappingsMap = {};
            mappings.forEach(m => {
                if (!mappingsMap[m.product_id]) {
                    mappingsMap[m.product_id] = [];
                }
                mappingsMap[m.product_id].push(m);
            });

            // Combine
            const result = products.map(p => ({
                ...p,
                mappedAttributes: mappingsMap[p.id] || []
            }));

            res.json(result);
        });
    });
};

// Get mapped attributes for a single product
export const getProductAttributes = (req, res) => {
    const { productId } = req.params;
    const sql = "SELECT * FROM product_attributes WHERE product_id = ?";
    db.query(sql, [productId], (err, rows) => {
        if (err) {
            console.error("DB error fetching single product attributes mapping:", err);
            return res.status(500).json({ message: "DB error fetching single product attributes mapping" });
        }
        res.json(rows);
    });
};

// Update attributes mapping for a single product (Transaction-based)
export const updateProductAttributes = (req, res) => {
    const { productId } = req.params;
    const { mappings } = req.body; // Array of { attribute_id, attribute_value_id }

    if (!Array.isArray(mappings)) {
        return res.status(400).json({ message: "Invalid payload: mappings array is required" });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error("Failed to start transaction:", err);
            return res.status(500).json({ message: "Failed to start transaction" });
        }

        // 1. Delete all current mappings for the product
        db.query("DELETE FROM product_attributes WHERE product_id = ?", [productId], (deleteErr) => {
            if (deleteErr) {
                return db.rollback(() => {
                    console.error("Failed to clear product attribute mappings:", deleteErr);
                    res.status(500).json({ message: "Failed to clear product attribute mappings" });
                });
            }

            if (mappings.length === 0) {
                return db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Commit failed:", commitErr);
                            res.status(500).json({ message: "Commit failed" });
                        });
                    }
                    res.json({ message: "Product attribute mappings cleared successfully" });
                });
            }

            // 2. Insert new mappings
            const insertSql = "INSERT INTO product_attributes (product_id, attribute_id, attribute_value_id) VALUES ?";
            const insertValues = mappings.map(m => [productId, m.attribute_id, m.attribute_value_id]);

            db.query(insertSql, [insertValues], (insertErr) => {
                if (insertErr) {
                    return db.rollback(() => {
                        console.error("Failed to insert new product attribute mappings:", insertErr);
                        res.status(500).json({ message: "Failed to insert new product attribute mappings" });
                    });
                }

                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Commit failed:", commitErr);
                            res.status(500).json({ message: "Commit failed" });
                        });
                    }
                    res.json({ message: "Product attribute mappings updated successfully" });
                });
            });
        });
    });
};

