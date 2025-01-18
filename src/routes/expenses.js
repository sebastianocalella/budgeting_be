import { Router } from "express";
import db from "#root/index.js";
import momentTimezone from 'moment-timezone';

const router = Router();

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

    // Log the query and params for debugging
    console.log('Query:', query);
    console.log('Params:', params);

    const [rows] = await db.execute(query, params);
    
    if (rows) {
      // Convert dates to local timezone in the results
      const adjustedRows = rows.map(row => ({
        ...row,
        date: momentTimezone.tz(row.date, 'UTC').tz(localTimezone).format()
      }));
      
      // Log a sample result for debugging
      if (adjustedRows.length > 0) {
        console.log('Sample original date:', rows[0].date);
        console.log('Sample adjusted date:', adjustedRows[0].date);
      }

      res.json(adjustedRows);
    } 
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

export default router;