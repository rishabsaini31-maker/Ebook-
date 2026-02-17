import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateToken } from "@/lib/auth";

export async function POST(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, amount, payment_mode, notes } = body;

    await pool.query(
      "INSERT INTO sales (user_id, date, amount, payment_mode, notes) VALUES ($1, $2, $3, $4, $5)",
      [user.id, date, amount, payment_mode, notes],
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
    const result = await pool.query(
      "SELECT * FROM sales WHERE user_id = $1 ORDER BY date DESC",
      [user.id],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
