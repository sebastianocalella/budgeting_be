import { Router } from "express";
import db from "#root/index.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM categories");
        res.json(rows);
    } catch (e) {
        console.error("Error fetching categories", e);
        res.status(500).send(e.message);
    }
});

export default router;