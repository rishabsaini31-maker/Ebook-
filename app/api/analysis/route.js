import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";
import { getKolkataDate, getKolkataYearMonth } from "../../../lib/utils";

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";
    const { year: currentYear, month: currentMonth } = getKolkataYearMonth();
    const today = getKolkataDate();

    let salesData = [];
    let expensesData = [];
    let summaryData = {};

    // Get data based on period
    if (period === "daily") {
      // Last 7 days data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getKolkataDate(date);
        const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });

        const salesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND date = $2",
          [user.id, dateStr],
        );

        const expensesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND date = $2 AND period = 'daily'",
          [user.id, dateStr],
        );

        const sales = parseFloat(salesResult.rows[0].total);
        const expenses = parseFloat(expensesResult.rows[0].total);

        const profit = sales - expenses;
        salesData.push({
          name: dayName,
          date: dateStr,
          sales,
          expenses,
          profit: profit >= 0 ? profit : 0,
          loss: profit < 0 ? Math.abs(profit) : 0,
        });
      }

      // Today's summary
      const todaySales = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND date = $2",
        [user.id, today],
      );
      const todayExpenses = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND date = $2 AND period = 'daily'",
        [user.id, today],
      );

      summaryData = {
        totalSales: parseFloat(todaySales.rows[0].total),
        totalExpenses: parseFloat(todayExpenses.rows[0].total),
        totalProfit:
          parseFloat(todaySales.rows[0].total) -
          parseFloat(todayExpenses.rows[0].total),
      };
    } else if (period === "weekly") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - i * 7);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        const startStr = getKolkataDate(startDate);
        const endStr = getKolkataDate(endDate);
        const weekLabel = `Week ${4 - i}`;

        const salesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND date >= $2 AND date <= $3",
          [user.id, startStr, endStr],
        );

        const expensesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND date >= $2 AND date <= $3",
          [user.id, startStr, endStr],
        );

        const sales = parseFloat(salesResult.rows[0].total);
        const expenses = parseFloat(expensesResult.rows[0].total);

        const profit = sales - expenses;
        salesData.push({
          name: weekLabel,
          sales,
          expenses,
          profit: profit >= 0 ? profit : 0,
          loss: profit < 0 ? Math.abs(profit) : 0,
        });
      }

      // This week's summary
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      const weekStartStr = getKolkataDate(weekStart);

      const weekSales = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND date >= $2",
        [user.id, weekStartStr],
      );
      const weekExpenses = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND date >= $2",
        [user.id, weekStartStr],
      );

      summaryData = {
        totalSales: parseFloat(weekSales.rows[0].total),
        totalExpenses: parseFloat(weekExpenses.rows[0].total),
        totalProfit:
          parseFloat(weekSales.rows[0].total) -
          parseFloat(weekExpenses.rows[0].total),
      };
    } else if (period === "monthly") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthName = date.toLocaleDateString("en-IN", { month: "short" });

        const salesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND EXTRACT(month FROM date) = $2 AND EXTRACT(year FROM date) = $3",
          [user.id, month, year],
        );

        const expensesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND EXTRACT(month FROM date) = $2 AND EXTRACT(year FROM date) = $3",
          [user.id, month, year],
        );

        const sales = parseFloat(salesResult.rows[0].total);
        const expenses = parseFloat(expensesResult.rows[0].total);

        const profit = sales - expenses;
        salesData.push({
          name: monthName,
          sales,
          expenses,
          profit: profit >= 0 ? profit : 0,
          loss: profit < 0 ? Math.abs(profit) : 0,
        });
      }

      // This month's summary
      const monthSales = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND EXTRACT(month FROM date) = $2 AND EXTRACT(year FROM date) = $3",
        [user.id, currentMonth, currentYear],
      );
      const monthExpenses = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND EXTRACT(month FROM date) = $2 AND EXTRACT(year FROM date) = $3",
        [user.id, currentMonth, currentYear],
      );

      summaryData = {
        totalSales: parseFloat(monthSales.rows[0].total),
        totalExpenses: parseFloat(monthExpenses.rows[0].total),
        totalProfit:
          parseFloat(monthSales.rows[0].total) -
          parseFloat(monthExpenses.rows[0].total),
      };
    } else if (period === "yearly") {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const year = currentYear - i;

        const salesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND EXTRACT(year FROM date) = $2",
          [user.id, year],
        );

        const expensesResult = await pool.query(
          "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND EXTRACT(year FROM date) = $2",
          [user.id, year],
        );

        const sales = parseFloat(salesResult.rows[0].total);
        const expenses = parseFloat(expensesResult.rows[0].total);

        const profit = sales - expenses;
        salesData.push({
          name: year.toString(),
          sales,
          expenses,
          profit: profit >= 0 ? profit : 0,
          loss: profit < 0 ? Math.abs(profit) : 0,
        });
      }

      // This year's summary
      const yearSales = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE user_id = $1 AND EXTRACT(year FROM date) = $2",
        [user.id, currentYear],
      );
      const yearExpenses = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND EXTRACT(year FROM date) = $2",
        [user.id, currentYear],
      );

      summaryData = {
        totalSales: parseFloat(yearSales.rows[0].total),
        totalExpenses: parseFloat(yearExpenses.rows[0].total),
        totalProfit:
          parseFloat(yearSales.rows[0].total) -
          parseFloat(yearExpenses.rows[0].total),
      };
    }

    // Get expense categories for pie chart
    const categoriesResult = await pool.query(
      `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = $1 
       GROUP BY category 
       ORDER BY total DESC 
       LIMIT 6`,
      [user.id],
    );

    const categoryData = categoriesResult.rows.map((row) => ({
      name: row.category,
      value: parseFloat(row.total),
    }));

    // Get payment modes for pie chart
    const paymentModesResult = await pool.query(
      `SELECT 
         COALESCE(SUM(upi_amount), 0) as upi_total,
         COALESCE(SUM(cash_amount), 0) as cash_total,
         COALESCE(SUM(card_amount), 0) as card_total
       FROM sales 
       WHERE user_id = $1`,
      [user.id],
    );

    const paymentModesRow = paymentModesResult.rows[0];
    const paymentModeData = [
      { name: "UPI", value: parseFloat(paymentModesRow.upi_total) },
      { name: "CASH", value: parseFloat(paymentModesRow.cash_total) },
      { name: "CARD", value: parseFloat(paymentModesRow.card_total) },
    ].filter(mode => mode.value > 0).sort((a, b) => b.value - a.value);

    return NextResponse.json({
      chartData: salesData,
      summary: summaryData,
      categoryData,
      paymentModeData,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
