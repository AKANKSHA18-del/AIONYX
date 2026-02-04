const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const setupDatabase = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // required for Neon
    },
  });

  try {
    console.log("Connecting to Neon PostgreSQL...");
    await client.connect();
    console.log("Connected to Neon.");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing schema...");
    await client.query(schemaSql);

    console.log("Schema executed successfully.");
  } catch (err) {
    console.error("Database setup error:", err.message);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
};

setupDatabase();
