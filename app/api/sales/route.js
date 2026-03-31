import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

// DEBUG: Log incoming request headers
export function logHeaders(request) {
  try {
    console.log(
      "Request headers:",
      JSON.stringify(Object.fromEntries(request.headers.entries())),
    );
  } catch (e) {
    console.log("Could not log headers", e);
  }
}

export async function POST(request) {
  logHeaders(request);
  const user = authenticateToken(request);
  console.log("Authenticated user:", user);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, upi, cash, card, notes } = body;

    const upiAmount = parseFloat(upi) || 0;
    const cashAmount = parseFloat(cash) || 0;
    const cardAmount = parseFloat(card) || 0;
    const totalAmount = upiAmount + cashAmount + cardAmount;

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid amount" },
        { status: 400 },
      );
    }

    await pool.query(
      "INSERT INTO sales (user_id, date, amount, upi_amount, cash_amount, card_amount, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [user.id, date, totalAmount, upiAmount, cashAmount, cardAmount, notes],
    );

    return NextResponse.json({ message: "Sale added" }, { status: 201 });
  } catch (error) {
    console.error("Error adding sale:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    // Get total count of grouped dates
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (SELECT date FROM sales WHERE user_id = $1 GROUP BY date) AS grouped_dates`,
      [user.id],
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch paginated grouped sales by date
    const result = await pool.query(
      `SELECT 
         TO_CHAR(date::DATE, 'YYYY-MM-DD') as date, 
         MAX(id) as id,
         SUM(amount) as amount, 
         SUM(upi_amount) as upi_amount, 
         SUM(cash_amount) as cash_amount, 
         SUM(card_amount) as card_amount, 
         STRING_AGG(NULLIF(TRIM(notes), ''), ' | ') as notes 
       FROM sales 
       WHERE user_id = $1 
       GROUP BY date 
       ORDER BY date DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset],
    );

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
