import { Router } from "express";
import db from "#root/index.js";

const router = Router();

// GET: Fetch all categories
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM categories");
        res.json(rows);
    } catch (e) {
        console.error("Error fetching categories", e);
        res.status(500).send(e.message);
    }
});

// POST: Add a new category
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send("Name is required");
        }

        const [result] = await db.execute(
            "INSERT INTO categories (name) VALUES (?)",
            [name, description || null]
        );

        res.status(201).json({ id: result.insertId, name });
    } catch (e) {
        console.error("Error creating category", e);
        res.status(500).send(e.message);
    }
});

// PUT: Update a category by ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).send("Name is required");
        }

        const [result] = await db.execute(
            "UPDATE categories SET name = ? WHERE id = ?",
            [name, description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Category not found");
        }

        res.status(200).json({ id, name });
    } catch (e) {
        console.error("Error updating category", e);
        res.status(500).send(e.message);
    }
});

// DELETE: Remove a category by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send("Category not found");
        }

        res.status(204).send(); // No content
    } catch (e) {
        console.error("Error deleting category", e);
        res.status(500).send(e.message);
    }
});

export default router;