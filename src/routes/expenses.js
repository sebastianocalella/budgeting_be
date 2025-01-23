import { Router } from "express";
import db from "#root/index.js";
import momentTimezone from 'moment-timezone';

const router = Router();

// GET: Fetch expenses
router.get("/", async (req, res) => {
  try {
    const { year, month, day } = req.query;
    let query = "SELECT * FROM expenses";
    const params = [];
    const localTimezone = momentTimezone.tz.guess();

    // Build base query without timezone conversion
    const conditions = [];
    const requestedDate = momentTimezone.tz(
      `${year || '2024'}-${month || '01'}-${day || '01'}`, 
      localTimezone
    );

    if (year) {
      conditions.push("YEAR(date) = ?");
      params.push(requestedDate.year());
    }
    if (month) {
      conditions.push("MONTH(date) = ?");
      params.push(parseInt(month));
    }
    if(day) {
      conditions.push("DAY(date) = ?");
      params.push(parseInt(day));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY date DESC";

    const [rows] = await db.execute(query, params);
    
    if (rows) {
      // Convert dates to local timezone in the results
      const adjustedRows = rows.map(row => ({
        ...row,
        date: momentTimezone.tz(row.date, 'UTC').tz(localTimezone).format()
      }));

      res.json(adjustedRows);
    } 
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST: Add a new expense
router.post("/", async (req, res) => {
  try {
    const { title, amount, date, description} = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ error: "Title, amount, and date are required" });
    }

    const utcDate = momentTimezone.tz(date, momentTimezone.tz.guess()).utc().format("YYYY-MM-DD HH:mm:ss");

    const [result] = await db.execute(
      "INSERT INTO expenses (title, amount, date, description) VALUES (?, ?, ?, ?)",
      [title, amount, utcDate, description || null]
    );

    res.status(201).json({ id: result.insertId, title, amount, date });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// PUT: Update an existing expense by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date, description } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ error: "Title, amount, and date are required" });
    }

    const utcDate = momentTimezone.tz(date, momentTimezone.tz.guess()).utc().format("YYYY-MM-DD HH:mm:ss");

    const [result] = await db.execute(
      "UPDATE expenses SET title = ?, amount = ?, date = ?, description = ? WHERE id = ?",
      [title, amount, utcDate, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ id, title, amount, date, description });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE: Remove an expense by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM expenses WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;