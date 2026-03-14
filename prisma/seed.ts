// Seed script — populates Provider table from the existing hardcoded data.
// Run: npm run db:seed
//
// All seeded providers are marked isSimulated=true.
// They mirror src/lib/data/providers.ts and serve as the persistence-backed
// record for future live provider onboarding.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { providers } from "../src/lib/data/providers";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding providers...");

  for (const p of providers) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: {
        companyName: p.company_name,
        country: p.country,
        region: p.region,
        municipality: p.municipality,
        services: JSON.stringify(p.services),
        specialties: JSON.stringify(p.specialties),
        typicalJobSize: p.typical_job_size,
        description: p.description,
        yearsInBusiness: p.years_in_business,
        employeesApprox: p.employees_approx,
        rating: p.rating,
        responseTimeHours: p.response_time_hours,
        available: p.available,
        isSimulated: true,
      },
      create: {
        id: p.id,
        companyName: p.company_name,
        country: p.country,
        region: p.region,
        municipality: p.municipality,
        services: JSON.stringify(p.services),
        specialties: JSON.stringify(p.specialties),
        typicalJobSize: p.typical_job_size,
        description: p.description,
        yearsInBusiness: p.years_in_business,
        employeesApprox: p.employees_approx,
        rating: p.rating,
        responseTimeHours: p.response_time_hours,
        available: p.available,
        isSimulated: true,
      },
    });
    console.log(`  ✓ ${p.company_name} (${p.country})`);
  }

  const count = await prisma.provider.count();
  console.log(`\nDone. ${count} providers in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
