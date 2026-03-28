import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";
import { getKolkataDate, getKolkataYearMonth } from "../../../lib/utils";

const getSum = async (table, userId, whereClause, params) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total FROM ${table} WHERE user_id = $1 ${whereClause}`,
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
    const alerts = [];
    const { year: currentYear, month: currentMonth } = getKolkataYearMonth();

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

    if (monthlyExpenses > monthlyIncome) {
      alerts.push({
        type: "expenses_exceed_income",
        message: "Monthly expenses exceed income.",
      });
    }

    if (monthlyIncome - monthlyExpenses < 0) {
      alerts.push({
        type: "negative_monthly_profit",
        message: "Monthly profit is negative.",
      });
    }

    // Check continuous losses: last 7 days
    let lossDays = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getKolkataDate(date);
      const income = await getSum("sales", user.id, "AND date = $2", [dateStr]);
      const expenses = await getSum("expenses", user.id, "AND date = $2 AND period = 'daily'", [
        dateStr,
      ]);
      if (income - expenses < 0) lossDays++;
    }

    if (lossDays >= 3) {
      alerts.push({
        type: "continuous_losses",
        message: `Continuous losses for ${lossDays} days.`,
      });
    }

    // Check for loans ending in 5 days or less
    const loansResult = await pool.query(
      "SELECT lender_name, amount, due_date FROM loans WHERE user_id = $1 AND DATE(due_date) >= CURRENT_DATE AND DATE(due_date) <= CURRENT_DATE + INTERVAL '5 days' ORDER BY due_date ASC",
      [user.id],
    );

    loansResult.rows.forEach((loan) => {
      const daysUntilDue = Math.ceil(
        (new Date(loan.due_date) - new Date()) / (1000 * 60 * 60 * 24),
      );
      alerts.push({
        type: "loan_due_soon",
        message: `🚨 Loan Alert: ${loan.lender_name} - ₹${loan.amount} due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""} (${new Date(loan.due_date).toLocaleDateString("en-IN")})`,
      });
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
