import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { authenticateToken } from "../../../lib/auth";

export async function GET(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT
        username, email, phone, profile_image,
        is_premium, premium_plan, premium_expiry,
        monthly_entries_count, last_entry_reset
      FROM users WHERE id = $1`,
      [user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    // Check if premium has expired
    let isPremium = userData.is_premium;
    if (userData.is_premium && userData.premium_expiry) {
      const expiryDate = new Date(userData.premium_expiry);
      if (expiryDate < new Date()) {
        // Premium expired, update database
        await pool.query(
          "UPDATE users SET is_premium = FALSE, premium_plan = NULL, premium_expiry = NULL WHERE id = $1",
          [user.id],
        );
        isPremium = false;
      }
    }

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

    return NextResponse.json({
      ...userData,
      is_premium: isPremium,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = authenticateToken(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageData } = body;

    await pool.query("UPDATE users SET profile_image = $1 WHERE id = $2", [
      imageData,
      user.id,
    ]);

    return NextResponse.json({ message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
