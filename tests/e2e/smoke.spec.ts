// E2E smoke tests — verify the core happy paths load and render.
// These tests run against a live dev server (configured in playwright.config.ts).
// The server uses DATABASE_URL=file:./test.db (separate from dev.db).
//
// Keep these tests minimal and robust. Deep business logic is covered by
// integration tests in tests/integration/.

import { test, expect } from "@playwright/test";

// ─── Landing page ─────────────────────────────────────────────────────────────

test("landing page loads and shows the Findli brand", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Findli/i);
  await expect(page.locator("text=Findli").first()).toBeVisible();
});

// ─── Qualify / intake flow ────────────────────────────────────────────────────

test("qualify page loads the intake form", async ({ page }) => {
  await page.goto("/qualify");
  // The page should load without a 500 error
  await expect(page.locator("body")).toBeVisible();
  // Title or heading
  await expect(page).not.toHaveURL(/error/);
});

// ─── Brief submission smoke test ──────────────────────────────────────────────
// Submits a minimal brief via the API (not the UI) and then verifies
// the brief page and offers page load correctly.

test("brief and offers pages load after API-created brief", async ({ page }) => {
  // Submit brief via the intake API directly
  const intakeRes = await page.request.post("/api/intake", {
    data: {
      moveType: "private",
      moveDate: "2026-08-01",
      dateFlexibility: "few_days",
      preferredTimeWindow: "morning",
      origin: {
        address: "Østerbrogade 1, Copenhagen",
        propertyType: "apartment",
        floor: 2,
        elevator: "no",
        elevatorUsable: null,
        parkingAccess: "restricted",
        parkingDistanceMeters: 30,
        accessNotes: "",
      },
      destination: {
        address: "Nørrebrogade 10, Copenhagen",
        propertyType: "apartment",
        floor: 0,
        elevator: "yes",
        elevatorUsable: true,
        parkingAccess: "easy",
        parkingDistanceMeters: 10,
        accessNotes: "",
      },
      moveSizeCategory: "three_room",
      roomCount: 3,
      estimatedVolumeM3: null,
      inventorySummary: "3-room apartment",
      fullMove: true,
      specialItems: [],
      specialItemsNotes: "",
      transportOnly: false,
      carryingIncluded: true,
      packing: "self",
      packingMaterialsNeeded: null,
      disassemblyReassembly: false,
      storageNeeded: false,
      storageDuration: "",
      climateControlledStorage: null,
      disposalNeeded: false,
      disposalDetails: "",
      cleaningNeeded: false,
      canHelpCarry: true,
      strictDeadline: false,
      keyHandoverTime: "",
      highValueItems: false,
      extraNotes: "",
      describeMove: "Standard move",
      fullName: "Test User",
      email: "test@example.com",
      phone: "+45 12 34 56 78",
      preferredContactMethod: "email",
      preferredLanguage: "da",
      allowAutoBids: true,
      preferredBudget: null,
      hardMaxBudget: null,
      readyToReceiveBidsNow: true,
    },
    headers: { "Content-Type": "application/json" },
  });

  expect(intakeRes.ok()).toBe(true);
  const body = await intakeRes.json() as { briefId: string };
  const { briefId } = body;
  expect(briefId).toBeTruthy();

  // Brief review page
  await page.goto(`/brief/${briefId}`);
  await expect(page.locator("body")).toBeVisible();
  await expect(page).not.toHaveURL(/error/);

  // Offers page
  await page.goto(`/brief/${briefId}/offers`);
  await expect(page.locator("body")).toBeVisible();
  await expect(page).not.toHaveURL(/error/);
});

// ─── Admin status endpoint ────────────────────────────────────────────────────

test("admin briefs endpoint returns a summary", async ({ page }) => {
  const res = await page.request.get("/api/admin/briefs");
  expect(res.ok()).toBe(true);
  const body = await res.json() as { summary: { briefs_total: number } };
  expect(body.summary).toBeDefined();
  expect(typeof body.summary.briefs_total).toBe("number");
});
