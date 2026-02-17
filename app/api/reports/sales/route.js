import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateToken } from "@/lib/auth";

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";
    const today = new Date().toISOString().split("T")[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    let query = "SELECT * FROM sales WHERE user_id = $1";
    let params = [user.id];

    if (period === "daily") {
      query += " AND date = $2 ORDER BY created_at DESC";
      params.push(today);
    } else if (period === "weekly") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];
      query += " AND date >= $2 AND date <= $3 ORDER BY date DESC";
      params.push(startStr, endStr);
    } else if (period === "monthly") {
      query +=
        " AND EXTRACT(year FROM date) = $2 AND EXTRACT(month FROM date) = $3 ORDER BY date DESC";
      params.push(currentYear, currentMonth);
    } else if (period === "yearly") {
      query += " AND EXTRACT(year FROM date) = $2 ORDER BY date DESC";
      params.push(currentYear);
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
