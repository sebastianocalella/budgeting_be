import express, { json } from "express";
import cors from "cors";
import expensesRoutes from "./src/routes/expenses.js";
import mysql from "mysql2/promise";
import momentTimezone from 'moment-timezone';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(json());


const localTimezone = momentTimezone.tz.guess();
const timezoneOffset = momentTimezone.tz(localTimezone).format('Z');


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  timezone: timezoneOffset,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Use the expense routes
app.use("/expenses", expensesRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default pool;