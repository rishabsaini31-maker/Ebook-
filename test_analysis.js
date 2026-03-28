const pool = require('./lib/db');
async function run() {
  try {
    const user_id = 5; // hardcoded user from earlier
    const currentMonth = 3;
    const currentYear = 2026;
    const res = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = $1 AND EXTRACT(month FROM date) = $2 AND EXTRACT(year FROM date) = $3",
      [user_id, currentMonth, currentYear]
    );
    console.log("Monthly Expenses:", res.rows[0].total);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
