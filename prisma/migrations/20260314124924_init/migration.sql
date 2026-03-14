-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "specialties" TEXT NOT NULL,
    "typicalJobSize" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "yearsInBusiness" INTEGER NOT NULL,
    "employeesApprox" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "responseTimeHours" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "isSimulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "bidType" TEXT NOT NULL,
    "priceMin" REAL NOT NULL,
    "priceMax" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "estimatedHours" REAL,
    "availableDate" TEXT,
    "message" TEXT,
    "assumptions" TEXT NOT NULL,
    "isSimulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bid_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Selection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bidId" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Selection_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "briefId" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'system',
    "locale" TEXT,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventLog_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Selection_bidId_key" ON "Selection"("bidId");
