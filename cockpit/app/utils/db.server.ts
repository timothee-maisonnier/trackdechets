import { PrismaClient } from "@prisma/client";

const DATABASE_URL =
  "postgresql://trackdechets:password@postgres:5432/prisma?schema=default$default";
function getDbUrl() {
  try {
    const dbUrl = new URL(DATABASE_URL);
    dbUrl.searchParams.set("schema", "default$default");

    return unescape(dbUrl.href); // unescape needed because of the `$`
  } catch (err) {
    return "";
  }
}

export const db = new PrismaClient({
  datasources: {
    db: { url: getDbUrl() }
  },
  log:
    process.env.NODE_ENV !== "test"
      ? [
          {
            emit: "event",
            level: "query"
          },
          {
            emit: "stdout",
            level: "error"
          },
          {
            emit: "stdout",
            level: "info"
          },
          {
            emit: "stdout",
            level: "warn"
          }
        ]
      : []
});
