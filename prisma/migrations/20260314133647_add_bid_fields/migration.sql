/*
  Warnings:

  - Added the required column `updatedAt` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventLog" ADD COLUMN "providerId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "bidType" TEXT NOT NULL,
    "priceMin" REAL,
    "priceMax" REAL,
    "currency" TEXT NOT NULL,
    "estimatedHours" REAL,
    "estimatedCrew" INTEGER,
    "estimatedVehicleCount" INTEGER,
    "availableDate" TEXT,
    "validityDays" INTEGER,
    "message" TEXT,
    "notes" TEXT,
    "includedServices" TEXT NOT NULL DEFAULT '[]',
    "assumptions" TEXT NOT NULL DEFAULT '[]',
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bid_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bid_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("assumptions", "availableDate", "bidType", "briefId", "createdAt", "currency", "estimatedHours", "id", "isSimulated", "message", "priceMax", "priceMin", "providerId") SELECT "assumptions", "availableDate", "bidType", "briefId", "createdAt", "currency", "estimatedHours", "id", "isSimulated", "message", "priceMax", "priceMin", "providerId" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
