const bcrypt = require("bcryptjs")
const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "campus_connect_nz",
  user: process.env.DB_USER || "campus_connect",
  password: process.env.DB_PASSWORD,
})

async function checkAndCreateAdmin() {
  try {
    console.log("🔍 Checking for existing admin user...")

    // Check if admin user exists
    const adminCheck = await pool.query(
      "SELECT id, name, email, verified, role, created_at FROM users WHERE email = $1",
      ["admin@autuni.ac.nz"],
    )

    if (adminCheck.rows.length > 0) {
      const admin = adminCheck.rows[0]
      console.log("✅ Admin user already exists!")
      console.log("📧 Email:", admin.email)
      console.log("🔑 Password: @Password1")
      console.log("👤 Name:", admin.name)
      console.log("🎭 Role:", admin.role)
      console.log("✔️ Verified:", admin.verified)
      console.log("📅 Created:", admin.created_at)

      // Ensure admin is verified and has correct role
      if (!admin.verified || admin.role !== "admin") {
        console.log("🔧 Updating admin user permissions...")
        await pool.query("UPDATE users SET verified = TRUE, role = $1, verification_token = NULL WHERE email = $2", [
          "admin",
          "admin@autuni.ac.nz",
        ])
        console.log("✅ Admin permissions updated!")
      }
    } else {
      console.log("❌ No admin user found. Creating new admin...")

      // Hash the password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash("@Password1", saltRounds)

      // Create admin user
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, verified, role, verification_token) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, name, email, verified, role, created_at`,
        [
          "System Administrator",
          "admin@autuni.ac.nz",
          hashedPassword,
          true, // Skip email verification
          "admin",
          null, // No verification token needed
        ],
      )

      const newAdmin = result.rows[0]
      console.log("✅ New admin user created successfully!")
      console.log("📧 Email:", newAdmin.email)
      console.log("🔑 Password: @Password1")
      console.log("👤 Name:", newAdmin.name)
      console.log("🎭 Role:", newAdmin.role)
      console.log("✔️ Verified:", newAdmin.verified)
      console.log("📅 Created:", newAdmin.created_at)
    }

    console.log("\n=== ADMIN LOGIN CREDENTIALS ===")
    console.log("Email: admin@autuni.ac.nz")
    console.log("Password: @Password1")
    console.log("===============================\n")

    // Display all admin users
    const allAdmins = await pool.query(
      "SELECT id, name, email, verified, created_at FROM users WHERE role = $1 ORDER BY created_at",
      ["admin"],
    )

    console.log("📋 All admin users in the system:")
    allAdmins.rows.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - Verified: ${admin.verified}`)
    })
  } catch (error) {
    console.error("❌ Error managing admin user:", error)
  } finally {
    await pool.end()
  }
}

async function changeAdminPassword(newPassword) {
  try {
    console.log("🔧 Changing admin password...")

    // Hash the new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update admin password
    const result = await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email", [
      hashedPassword,
      "admin@autuni.ac.nz",
    ])

    if (result.rows.length > 0) {
      console.log("✅ Admin password changed successfully!")
      console.log("📧 Email: admin@autuni.ac.nz")
      console.log("🔑 New Password:", newPassword)
    } else {
      console.log("❌ Admin user not found!")
    }
  } catch (error) {
    console.error("❌ Error changing admin password:", error)
  } finally {
    await pool.end()
  }
}

// Check command line arguments
const args = process.argv.slice(2)
if (args[0] === "change-password" && args[1]) {
  changeAdminPassword(args[1])
} else {
  checkAndCreateAdmin()
}
