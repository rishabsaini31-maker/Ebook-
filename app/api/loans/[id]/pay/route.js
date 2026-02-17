import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { paid_amount } = body;

    await pool.query(
      "UPDATE loans SET paid_amount = paid_amount + $1 WHERE id = $2 AND user_id = $3",
      [paid_amount, id, user.id],
    );

    return NextResponse.json({ message: "Payment recorded successfully" });
  } catch (error) {
    console.error("Error recording loan payment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
