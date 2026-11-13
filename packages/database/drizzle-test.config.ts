import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.test", override: true })

export default defineConfig({
  out: "./drizzle",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
