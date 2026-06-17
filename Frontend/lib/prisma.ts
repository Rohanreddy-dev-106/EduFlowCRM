import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Prisma");
}

const url = new URL(databaseUrl);
const allowPublicKeyRetrieval =
  (process.env.MARIADB_ALLOW_PUBLIC_KEY_RETRIEVAL ?? "true").toLowerCase() === "true";
const cachingRsaPublicKey = process.env.MARIADB_CACHING_RSA_PUBLIC_KEY?.trim() || undefined;
const sslMode = url.searchParams.get("ssl-mode")?.toUpperCase();
const sslAccept = url.searchParams.get("sslaccept")?.toLowerCase();
const useSsl =
  process.env.MARIADB_SSL?.toLowerCase() === "true" ||
  sslMode === "REQUIRED" ||
  sslMode === "VERIFY_CA" ||
  sslMode === "VERIFY_IDENTITY" ||
  sslAccept === "strict";

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit: 5,
  allowPublicKeyRetrieval,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  ...(cachingRsaPublicKey ? { cachingRsaPublicKey } : {}),
});

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
