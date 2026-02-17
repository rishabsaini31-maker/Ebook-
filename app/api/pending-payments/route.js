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
    const { customer_name, amount, due_date, description } = body;

    await pool.query(
      "INSERT INTO pending_payments (user_id, customer_name, amount, due_date, description) VALUES ($1, $2, $3, $4, $5)",
      [user.id, customer_name, amount, due_date, description],
    );

    return NextResponse.json(
      { message: "Pending payment added" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding pending payment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM pending_payments WHERE user_id = $1 ORDER BY due_date ASC",
      [user.id],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
