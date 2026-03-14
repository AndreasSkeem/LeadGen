// Prisma client singleton with libSQL adapter.
// For local dev, uses a SQLite file (file:./dev.db).
// For production, set DATABASE_URL to a Turso or compatible libSQL connection string.
//
// The singleton prevents multiple connections during Next.js hot reload.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };
const globalWithPrisma = globalThis as GlobalWithPrisma;

export const prisma: PrismaClient =
  globalWithPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prisma = prisma;
}
