import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await pool.query(
      "SELECT id, username, email, password_hash, profile_image FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const token = generateToken(user);

    return NextResponse.json({
      token,
      username: user.username,
      profile_image: user.profile_image,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
