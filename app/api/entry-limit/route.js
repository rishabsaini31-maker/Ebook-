import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

const FREE_ENTRY_LIMIT = 5; // Free users can add 5 entries per month

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT is_premium, monthly_entries_count, last_entry_reset FROM users WHERE id = $1",
      [user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    // Check if monthly entry count needs reset
    const lastReset = new Date(userData.last_entry_reset);
    const now = new Date();
    if (
      lastReset.getMonth() !== now.getMonth() ||
      lastReset.getFullYear() !== now.getFullYear()
    ) {
      await pool.query(
        "UPDATE users SET monthly_entries_count = 0, last_entry_reset = CURRENT_DATE WHERE id = $1",
        [user.id],
      );
      userData.monthly_entries_count = 0;
    }

    const isPremium = userData.is_premium;
    const entriesUsed = userData.monthly_entries_count || 0;
    const entriesRemaining = isPremium
      ? "unlimited"
      : Math.max(0, FREE_ENTRY_LIMIT - entriesUsed);
    const canAddEntry = isPremium || entriesUsed < FREE_ENTRY_LIMIT;

    return NextResponse.json({
      isPremium,
      entriesUsed,
      entriesRemaining,
      canAddEntry,
      limit: FREE_ENTRY_LIMIT,
    });
  } catch (error) {
    console.error("Error checking entry limit:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Increment entry count
export async function POST(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT is_premium, monthly_entries_count FROM users WHERE id = $1",
      [user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    // Premium users have unlimited entries
    if (userData.is_premium) {
      return NextResponse.json({
        success: true,
        message: "Entry added (Premium user)",
      });
    }

    // Check if free user has exceeded limit
    if (userData.monthly_entries_count >= FREE_ENTRY_LIMIT) {
      return NextResponse.json(
        {
          error: "Entry limit reached",
          needsPremium: true,
          message:
            "You've reached your monthly limit. Upgrade to Premium for unlimited entries!",
        },
        { status: 403 },
      );
    }

    // Increment entry count
    await pool.query(
      "UPDATE users SET monthly_entries_count = monthly_entries_count + 1 WHERE id = $1",
      [user.id],
    );

    return NextResponse.json({
      success: true,
      entriesRemaining: FREE_ENTRY_LIMIT - userData.monthly_entries_count - 1,
    });
  } catch (error) {
    console.error("Error incrementing entry count:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
