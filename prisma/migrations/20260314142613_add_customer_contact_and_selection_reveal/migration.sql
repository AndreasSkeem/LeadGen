-- AlterTable
ALTER TABLE "Brief" ADD COLUMN "customerContact" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Selection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidId" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "revealedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Selection_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Selection" ("bidId", "briefId", "createdAt", "id") SELECT "bidId", "briefId", "createdAt", "id" FROM "Selection";
DROP TABLE "Selection";
ALTER TABLE "new_Selection" RENAME TO "Selection";
CREATE UNIQUE INDEX "Selection_bidId_key" ON "Selection"("bidId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
