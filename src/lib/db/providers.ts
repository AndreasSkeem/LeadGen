// DB helpers for Provider records.
// Converts between the Prisma DB row shape and the shared Provider type.
// Supply-side pages use these functions — not the hardcoded providers.ts array.

import type { Provider, Brief } from "@/lib/types";
import { prisma } from "@/lib/db";
import { scoreProvider } from "@/lib/matching/score";

// ─── Type conversion ──────────────────────────────────────────────────────────

type DbProviderRow = {
  id: string;
  companyName: string;
  country: string;
  region: string;
  municipality: string;
  services: string;
  specialties: string;
  typicalJobSize: string;
  description: string;
  yearsInBusiness: number;
  employeesApprox: number;
  rating: number;
  responseTimeHours: number;
  available: boolean;
};

export function dbProviderToType(row: DbProviderRow): Provider {
  return {
    id: row.id,
    company_name: row.companyName,
    country: row.country as Provider["country"],
    region: row.region,
    municipality: row.municipality,
    services: JSON.parse(row.services) as Provider["services"],
    specialties: JSON.parse(row.specialties) as string[],
    typical_job_size: row.typicalJobSize as Provider["typical_job_size"],
    description: row.description,
    years_in_business: row.yearsInBusiness,
    employees_approx: row.employeesApprox,
    rating: row.rating,
    response_time_hours: row.responseTimeHours,
    available: row.available,
  };
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getProviderFromDb(id: string): Promise<Provider | null> {
  const row = await prisma.provider.findUnique({ where: { id } });
  if (!row) return null;
  return dbProviderToType(row);
}

export async function getAllProvidersFromDb(): Promise<Provider[]> {
  const rows = await prisma.provider.findMany({ orderBy: { companyName: "asc" } });
  return rows.map(dbProviderToType);
}

// ─── Inbox matching ───────────────────────────────────────────────────────────
// Returns persisted briefs relevant to a given provider, scored and sorted.
// Uses the same deterministic scoring logic as the demand-side.

export async function getMatchedBriefsForProvider(
  providerId: string,
  limit = 20
): Promise<Array<{ brief: Brief; score: number; briefId: string }>> {
  const [providerRow, briefRows] = await Promise.all([
    prisma.provider.findUnique({ where: { id: providerId } }),
    prisma.brief.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  if (!providerRow) return [];

  const provider = dbProviderToType(providerRow);

  return briefRows
    .map((row) => {
      const brief = JSON.parse(row.data) as Brief;
      const score = scoreProvider(brief, provider);
      return { brief, score, briefId: row.id };
    })
    .filter(({ score }) => score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
