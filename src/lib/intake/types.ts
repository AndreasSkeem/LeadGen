import type {
  Country,
  DateFlexibility,
  PackingService,
  PreferredContactMethod,
  PreferredLanguage,
  PropertyType,
} from "@/lib/types";

export type MoveSizeCategory =
  | "few_items"
  | "studio"
  | "two_room"
  | "three_room"
  | "full_home"
  | "office_small"
  | "office_large"
  | "custom";

export interface IntakeLocationInput {
  address: string;
  propertyType: PropertyType;
  floor: number | null;
  elevator: "yes" | "no" | "not_applicable";
  elevatorUsable: boolean | null;
  parkingAccess: "easy" | "restricted";
  parkingDistanceMeters: number | null;
  accessNotes: string;
}

export interface IntakeData {
  moveType: "private" | "office" | "heavy_items" | "international" | "storage";
  moveDate: string;
  dateFlexibility: DateFlexibility;
  preferredTimeWindow: string;
  origin: IntakeLocationInput;
  destination: IntakeLocationInput;
  moveSizeCategory: MoveSizeCategory;
  roomCount: number | null;
  estimatedVolumeM3: number | null;
  inventorySummary: string;
  fullMove: boolean;
  specialItems: string[];
  specialItemsNotes: string;
  transportOnly: boolean;
  carryingIncluded: boolean;
  packing: PackingService;
  packingMaterialsNeeded: boolean | null;
  disassemblyReassembly: boolean;
  storageNeeded: boolean;
  storageDuration: string;
  climateControlledStorage: boolean | null;
  disposalNeeded: boolean;
  disposalDetails: string;
  cleaningNeeded: boolean;
  canHelpCarry: boolean | null;
  strictDeadline: boolean | null;
  keyHandoverTime: string;
  highValueItems: boolean | null;
  extraNotes: string;
  describeMove: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: PreferredContactMethod;
  preferredLanguage: PreferredLanguage;
  allowAutoBids: boolean;
  preferredBudget: number | null;
  hardMaxBudget: number | null;
  readyToReceiveBidsNow: boolean;
}

export interface IntakeDraftLocation extends IntakeLocationInput {
  countryHint: Country | null;
}
