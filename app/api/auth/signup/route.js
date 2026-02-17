import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, phone, password } = body;

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      "INSERT INTO users (username, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, username, email",
      [username, email, phone, hashedPassword],
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return NextResponse.json(
      {
        message: "User created",
        userId: user.id,
        token,
        username: user.username,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
