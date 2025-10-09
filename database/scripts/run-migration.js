const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

// Database configuration from environment variables
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "campus_connect",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
})

async function runMigration(filename) {
  const client = await pool.connect()
  try {
    const migrationPath = path.join(__dirname, "..", "migrations", filename)
    const sql = fs.readFileSync(migrationPath, "utf8")

    console.log(`Running migration: ${filename}`)
    await client.query(sql)
    console.log(`✅ Successfully ran migration: ${filename}`)
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message)
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  try {
    // Run the event subscriptions migration
    await runMigration("007_event_subscriptions.sql")

    console.log("\n✅ All migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    process.exit(1)
  }
}

main()
