import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

export async function POST(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      period,
      amount,
      category,
      date,
      rent,
      transport,
      salary,
      purchase,
      electricity,
      miscellaneous,
      description,
    } = body;

    let inserted = false;

    if (period === "daily") {
      if (amount && parseFloat(amount) > 0 && category) {
        const labels = {
          rent: "Rent",
          "stock purchase": "Stock Purchase",
          transport: "Transport",
          electricity: "Electricity",
          salary: "Salary",
          miscellaneous: "Miscellaneous",
        };
        const label = labels[category.toLowerCase()] || category;

        await pool.query(
          "INSERT INTO expenses (user_id, date, amount, category, description, period) VALUES ($1, $2, $3, $4, $5, $6)",
          [user.id, date, amount, label, description, period],
        );
        inserted = true;
      }
    } else {
      const expenseTypes = [
        { key: "rent", label: "Rent", value: rent },
        { key: "transport", label: "Transport", value: transport },
        { key: "salary", label: "Salary", value: salary },
        { key: "purchase", label: "Stock Purchase", value: purchase },
        { key: "electricity", label: "Electricity", value: electricity },
        { key: "miscellaneous", label: "Miscellaneous", value: miscellaneous },
      ];

      for (const type of expenseTypes) {
        if (type.value && parseFloat(type.value) > 0) {
          await pool.query(
            "INSERT INTO expenses (user_id, date, amount, category, description, period) VALUES ($1, $2, $3, $4, $5, $6)",
            [user.id, date, type.value, type.label, description, period || "monthly"],
          );
          inserted = true;
        }
      }
    }
    if (!inserted) {
      return NextResponse.json(
        { error: "No expense amount provided" },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Expense(s) added" }, { status: 201 });
  } catch (error) {
    console.error("Error adding expense:", error);
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
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC",
      [user.id],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
