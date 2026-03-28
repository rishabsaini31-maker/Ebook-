import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { authenticateToken } from "../../../../lib/auth";
import { getKolkataDate, getKolkataYearMonth } from "../../../../lib/utils";

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";
    const today = getKolkataDate();
    const { year: currentYear, month: currentMonth } = getKolkataYearMonth();

    let query = `SELECT 
      TO_CHAR(date::DATE, 'YYYY-MM-DD') as date,
      MAX(id) as id,
      SUM(amount) as amount,
      SUM(upi_amount) as upi_amount,
      SUM(cash_amount) as cash_amount,
      SUM(card_amount) as card_amount,
      STRING_AGG(NULLIF(TRIM(notes), ''), ' | ') as notes
    FROM sales 
    WHERE user_id = $1`;
    let params = [user.id];

    if (period === "daily") {
      query += " AND date = $2 GROUP BY date ORDER BY MAX(created_at) DESC";
      params.push(today);
    } else if (period === "weekly") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const startStr = getKolkataDate(startDate);
      const endStr = getKolkataDate(endDate);
      query += " AND date >= $2 AND date <= $3 GROUP BY date ORDER BY date DESC";
      params.push(startStr, endStr);
    } else if (period === "monthly") {
      query +=
        " AND EXTRACT(year FROM date) = $2 AND EXTRACT(month FROM date) = $3 GROUP BY date ORDER BY date DESC";
      params.push(currentYear, currentMonth);
    } else if (period === "yearly") {
      query += " AND EXTRACT(year FROM date) = $2 GROUP BY date ORDER BY date DESC";
      params.push(currentYear);
    }

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
