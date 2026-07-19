import "dotenv/config"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || ""

  if (dbUrl.startsWith("postgres")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg")
    const pool = new Pool({ connectionString: dbUrl, max: 5 })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
    const adapter = new PrismaBetterSqlite3({ url: dbUrl || "file:./dev.db" })
    return new PrismaClient({ adapter })
  } catch {
    throw new Error(
      "DATABASE_URL non configurata. Imposta DATABASE_URL nel file .env " +
      "(locale: file:./dev.db) o nelle variabili d'ambiente Vercel (PostgreSQL)."
    )
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
