// In-memory provider fixtures for unit tests (no DB needed).
// These match the structure of src/lib/types.ts Provider.

import type { Provider } from "@/lib/types";

export const COPENHAGEN_PRIVATE: Provider = {
  id: "test-cph-private",
  company_name: "Kobenhavn Flyt",
  country: "DK",
  region: "Hovedstaden",
  municipality: "Kobenhavn",
  services: ["private"],
  specialties: [],
  typical_job_size: "medium",
  description: "Test provider",
  years_in_business: 10,
  employees_approx: 8,
  rating: 4.5,
  response_time_hours: 24,
  available: true,
};

export const AARHUS_OFFICE: Provider = {
  id: "test-aarhus-office",
  company_name: "Aarhus Erhvervsflytning",
  country: "DK",
  region: "Midtjylland",
  municipality: "Aarhus",
  services: ["office", "heavy_items"],
  specialties: [],
  typical_job_size: "large",
  description: "Office moves",
  years_in_business: 15,
  employees_approx: 20,
  rating: 4.8,
  response_time_hours: 12,
  available: true,
};

export const STOCKHOLM_GENERALIST: Provider = {
  id: "test-sthlm-gen",
  company_name: "Stockholm Flytt AB",
  country: "SE",
  region: "Stockholm",
  municipality: "Stockholm",
  services: ["private", "office", "heavy_items", "storage"],
  specialties: ["piano moving"],
  typical_job_size: "all",
  description: "Full service mover",
  years_in_business: 8,
  employees_approx: 15,
  rating: 4.6,
  response_time_hours: 24,
  available: true,
};

export const UNAVAILABLE_PROVIDER: Provider = {
  ...COPENHAGEN_PRIVATE,
  id: "test-unavailable",
  available: false,
};
