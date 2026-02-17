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
      "SELECT username, email, phone, profile_image FROM users WHERE id = $1",
      [user.id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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
