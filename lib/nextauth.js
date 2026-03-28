const NextAuth = require("next-auth").default;
const GoogleProvider = require("next-auth/providers/google").default;
const pool = require("./db");
const { generateToken } = require("./auth");

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists with google_id
        const existingUser = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [user.id],
        );

        if (existingUser.rows.length > 0) {
          return true; // User exists, allow sign in
        }

        // Check if user exists with same email
        const emailUser = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [user.email],
        );

        if (emailUser.rows.length > 0) {
          // Update existing user with google_id
          await pool.query(
            "UPDATE users SET google_id = $1, auth_provider = 'google', profile_image = $2 WHERE email = $3",
            [user.id, user.image, user.email],
          );
          return true;
        }

        // Create new user with Google info
        let baseUsername = user.name || user.email.split("@")[0];
        let finalUsername = baseUsername;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          const check = await pool.query("SELECT id FROM users WHERE username = $1", [finalUsername]);
          if (check.rows.length === 0) {
            isUnique = true;
          } else {
            finalUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
            attempts++;
          }
        }

        await pool.query(
          "INSERT INTO users (username, email, google_id, profile_image, auth_provider) VALUES ($1, $2, $3, $4, 'google')",
          [finalUsername, user.email, user.id, user.image],
        );
        return true;
      } catch (error) {
        console.error("Google sign in error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      // Get user from database and add custom fields to session
      try {
        const userResult = await pool.query(
          "SELECT id, username, email, profile_image FROM users WHERE email = $1",
          [session.user.email],
        );

        if (userResult.rows.length > 0) {
          const dbUser = userResult.rows[0];
          session.user.id = dbUser.id;
          session.user.username = dbUser.username;

          // Generate custom JWT token for API calls
          const customToken = generateToken(dbUser);
          session.accessToken = customToken;
        }
      } catch (error) {
        console.error("Session callback error:", error);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

module.exports = { authOptions, NextAuth };
