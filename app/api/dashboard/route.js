import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

const getSum = async (table, userId, whereClause, params) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total FROM ${table} WHERE user_id = $${params.length + 1} ${whereClause}`,
    [userId, ...params],
  );
  return parseFloat(result.rows[0].total);
};

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const todayIncome = await getSum("sales", user.id, "AND date = $2", [
      today,
    ]);
    const todayExpenses = await getSum("expenses", user.id, "AND date = $2", [
      today,
    ]);

    const monthlyIncome = await getSum(
      "sales",
      user.id,
      "AND EXTRACT(year FROM date) = $2 AND EXTRACT(month FROM date) = $3",
      [currentYear, currentMonth],
    );
    const monthlyExpenses = await getSum(
      "expenses",
      user.id,
      "AND EXTRACT(year FROM date) = $2 AND EXTRACT(month FROM date) = $3",
      [currentYear, currentMonth],
    );

    const yearlyIncome = await getSum(
      "sales",
      user.id,
      "AND EXTRACT(year FROM date) = $2",
      [currentYear],
    );
    const yearlyExpenses = await getSum(
      "expenses",
      user.id,
      "AND EXTRACT(year FROM date) = $2",
      [currentYear],
    );

    return NextResponse.json({
      today: {
        date: today,
        income: todayIncome,
        expenses: todayExpenses,
        profit: todayIncome - todayExpenses,
      },
      monthly: {
        year: currentYear,
        month: currentMonth,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        profit: monthlyIncome - monthlyExpenses,
      },
      yearly: {
        year: currentYear,
        income: yearlyIncome,
        expenses: yearlyExpenses,
        profit: yearlyIncome - yearlyExpenses,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
