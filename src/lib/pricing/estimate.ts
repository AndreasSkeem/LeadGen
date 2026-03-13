export type PricingMoveType = "home" | "office" | "single_item" | "international" | "storage";

export type DayType = "weekday" | "saturday" | "sunday";

export interface PricingInput {
  moveType: PricingMoveType;
  rooms?: number;
  estimatedVolumeM3: number;
  distanceKm: number;
  driveMinutes: number;
  pickupFloor?: number;
  dropoffFloor?: number;
  pickupElevator?: boolean;
  dropoffElevator?: boolean;
  pickupElevatorUsable?: boolean;
  dropoffElevatorUsable?: boolean;
  longCarryPickup?: boolean;
  longCarryDropoff?: boolean;
  pickupParkingDistanceMeters?: number;
  dropoffParkingDistanceMeters?: number;
  restrictedAccess?: boolean;
  packingHelp?: boolean;
  packingMaterialsNeeded?: boolean;
  dismantlingItems?: number;
  heavyItems?: number;
  storageDays?: number;
  disposalLoad?: number;
  customerCanHelpCarry?: boolean;
  strictDeadline?: boolean;
  dayType: DayType;
  currency: "DKK" | "SEK" | "NOK";
}

export interface PriceEstimate {
  teamSize: 1 | 2 | 3 | 4;
  hourlyRate: number;
  billableHours: number;
  subtotal: number;
  lowEstimate: number;
  highEstimate: number;
}

const BASE_RATES = {
  DKK: { 1: 799, 2: 1095, 3: 1545, 4: 2150 },
  SEK: { 1: 890, 2: 1290, 3: 1690, 4: 2290 },
  NOK: { 1: 950, 2: 1390, 3: 1890, 4: 2590 },
} as const;

const DAY_MULTIPLIER: Record<DayType, number> = {
  weekday: 1,
  saturday: 1.25,
  sunday: 1.5,
};

function roundToHalfHour(hours: number): number {
  return Math.ceil(hours * 2) / 2;
}

function roundToNearest(amount: number, step: number): number {
  return Math.round(amount / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickTeamSize(input: PricingInput): 1 | 2 | 3 | 4 {
  if (input.moveType === "single_item") {
    return input.heavyItems && input.heavyItems > 0 ? 2 : 1;
  }

  if (input.moveType === "office") {
    if (input.estimatedVolumeM3 > 40) return 4;
    if (input.estimatedVolumeM3 > 20) return 3;
    return 2;
  }

  if (input.moveType === "international") {
    if (input.estimatedVolumeM3 > 35) return 4;
    if (input.estimatedVolumeM3 > 18) return 3;
    return 2;
  }

  if (input.moveType === "storage") {
    return input.estimatedVolumeM3 > 18 ? 3 : 2;
  }

  if (input.estimatedVolumeM3 > 35) return 4;
  if (input.estimatedVolumeM3 > 18) return 3;
  return 2;
}

function estimateLaborHours(input: PricingInput, teamSize: 1 | 2 | 3 | 4): number {
  let hours = 0;

  if (input.moveType === "single_item") {
    hours = 1.25;
  } else if (input.moveType === "office") {
    hours = 2.5 + input.estimatedVolumeM3 / 8;
  } else if (input.moveType === "international") {
    hours = 3 + input.estimatedVolumeM3 / 7;
  } else if (input.moveType === "storage") {
    hours = 1.5 + input.estimatedVolumeM3 / 10;
  } else {
    hours = 1.5 + input.estimatedVolumeM3 / 9;
  }

  hours += Math.max(0.3, input.driveMinutes / 60);

  if (!input.pickupElevator) {
    hours += Math.max(0, input.pickupFloor ?? 0) * 0.35;
  }

  if (!input.dropoffElevator) {
    hours += Math.max(0, input.dropoffFloor ?? 0) * 0.35;
  }

  if (input.longCarryPickup) hours += 0.4;
  if (input.longCarryDropoff) hours += 0.4;
  if (input.pickupParkingDistanceMeters && input.pickupParkingDistanceMeters > 25) {
    hours += Math.min(1.2, (input.pickupParkingDistanceMeters - 25) / 60);
  }
  if (input.dropoffParkingDistanceMeters && input.dropoffParkingDistanceMeters > 25) {
    hours += Math.min(1.2, (input.dropoffParkingDistanceMeters - 25) / 60);
  }
  if (input.pickupElevator && input.pickupElevatorUsable === false) hours += 0.35;
  if (input.dropoffElevator && input.dropoffElevatorUsable === false) hours += 0.35;

  hours += Math.min((input.dismantlingItems ?? 0) * 0.25, 1.5);

  if (input.packingHelp) {
    hours += 1.5;
  }
  if (input.packingMaterialsNeeded) {
    hours += 0.35;
  }

  hours += (input.heavyItems ?? 0) * 0.75;
  hours += Math.min((input.disposalLoad ?? 0) * 0.4, 1.5);
  if (input.restrictedAccess) hours += 0.5;
  if (input.strictDeadline) hours += 0.35;
  if (input.customerCanHelpCarry) hours -= 0.25;

  if (teamSize === 3) hours *= 0.9;
  if (teamSize === 4) hours *= 0.82;

  return hours;
}

function minimumHours(input: PricingInput): number {
  if (input.moveType === "single_item") return 2;
  if (input.moveType === "office") return 4;
  return 3;
}

export function estimateMovePrice(input: PricingInput): PriceEstimate {
  const teamSize = pickTeamSize(input);
  const dayMultiplier = DAY_MULTIPLIER[input.dayType];
  const hourlyRate = BASE_RATES[input.currency][teamSize] * dayMultiplier;

  const rawHours = estimateLaborHours(input, teamSize);
  let billableHours = roundToHalfHour(Math.max(rawHours, minimumHours(input)));

  const isLightLocalApartment =
    input.moveType === "home" &&
    (input.rooms ?? 0) <= 2 &&
    input.estimatedVolumeM3 <= 18 &&
    (input.heavyItems ?? 0) === 0 &&
    input.distanceKm <= 10 &&
    !input.packingHelp;

  if (isLightLocalApartment) {
    billableHours = clamp(billableHours, 3, 5.5);
  }

  const subtotal = hourlyRate * billableHours;

  let lowEstimate = subtotal * 0.92;
  let highEstimate = subtotal * 1.12;

  if (input.packingMaterialsNeeded) {
    const materials = input.currency === "SEK" ? 600 : input.currency === "NOK" ? 700 : 500;
    lowEstimate += materials;
    highEstimate += materials * 1.25;
  }

  if ((input.storageDays ?? 0) > 0) {
    const storageMonths = Math.max(1, Math.ceil((input.storageDays ?? 0) / 30));
    const monthlyStorage = input.currency === "SEK" ? 700 : input.currency === "NOK" ? 800 : 600;
    const storageCost = storageMonths * monthlyStorage;
    lowEstimate += storageCost;
    highEstimate += storageCost;
  }

  if ((input.disposalLoad ?? 0) > 0) {
    const disposalBase = input.currency === "SEK" ? 500 : input.currency === "NOK" ? 600 : 400;
    const disposalCost = disposalBase * Math.max(1, input.disposalLoad ?? 0);
    lowEstimate += disposalCost;
    highEstimate += disposalCost * 1.2;
  }

  if (input.restrictedAccess) {
    lowEstimate *= 1.04;
    highEstimate *= 1.08;
  }

  const roundingStep = input.currency === "NOK" ? 500 : 100;

  return {
    teamSize,
    hourlyRate: roundToNearest(hourlyRate, roundingStep),
    billableHours,
    subtotal: roundToNearest(subtotal, roundingStep),
    lowEstimate: roundToNearest(lowEstimate, roundingStep),
    highEstimate: roundToNearest(highEstimate, roundingStep),
  };
}
