// Integration tests for Brief persistence.
// Uses the real test.db SQLite database (set via vitest.config.ts env).

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { storeBrief, getBrief, getCustomerContact } from "@/lib/db/briefs";
import { cleanBriefs, makeTestBrief, TEST_CONTACT } from "../helpers/db";

beforeEach(async () => {
  await cleanBriefs();
});

afterAll(async () => {
  await cleanBriefs();
});

describe("storeBrief + getBrief — roundtrip", () => {
  it("stores and retrieves a brief by ID", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief);

    const retrieved = await getBrief(brief.brief_id);
    expect(retrieved).not.toBeUndefined();
    expect(retrieved!.brief_id).toBe(brief.brief_id);
    expect(retrieved!.move_type).toBe(brief.move_type);
    expect(retrieved!.language).toBe(brief.language);
  });

  it("returns undefined for unknown ID", async () => {
    const result = await getBrief("does-not-exist-00000000");
    expect(result).toBeUndefined();
  });

  it("preserves nested brief data (origin, destination, volume)", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief);

    const retrieved = await getBrief(brief.brief_id);
    expect(retrieved!.origin.municipality).toBe(brief.origin.municipality);
    expect(retrieved!.destination.municipality).toBe(brief.destination.municipality);
    expect(retrieved!.volume.estimated_cbm).toBe(brief.volume.estimated_cbm);
  });

  it("preserves services_requested fields", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief);

    const retrieved = await getBrief(brief.brief_id);
    expect(retrieved!.services_requested.packing).toBe(brief.services_requested.packing);
    expect(retrieved!.services_requested.storage.needed).toBe(brief.services_requested.storage.needed);
  });
});

describe("customer contact — isolation", () => {
  it("getBrief does NOT return customer contact (stored separately)", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief, TEST_CONTACT);

    const retrieved = await getBrief(brief.brief_id);
    // Brief type has no customer contact fields — verify the stored JSON doesn't leak them
    expect(retrieved).not.toHaveProperty("firstName");
    expect(retrieved).not.toHaveProperty("email");
    expect(retrieved).not.toHaveProperty("phone");
    expect(retrieved).not.toHaveProperty("customer_contact");
  });

  it("getCustomerContact returns stored contact", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief, TEST_CONTACT);

    const contact = await getCustomerContact(brief.brief_id);
    expect(contact).not.toBeNull();
    expect(contact!.firstName).toBe(TEST_CONTACT.firstName);
    expect(contact!.email).toBe(TEST_CONTACT.email);
    expect(contact!.phone).toBe(TEST_CONTACT.phone);
  });

  it("getCustomerContact returns null when no contact stored", async () => {
    const brief = makeTestBrief();
    await storeBrief(brief); // no contact

    const contact = await getCustomerContact(brief.brief_id);
    expect(contact).toBeNull();
  });

  it("getCustomerContact returns null for unknown brief ID", async () => {
    const contact = await getCustomerContact("no-such-brief");
    expect(contact).toBeNull();
  });
});
