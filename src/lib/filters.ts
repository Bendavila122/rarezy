/**
 * Extensive, Chrono24-style watch filtering for the Browse page. Pure — no
 * state, no side effects. Filter state lives in the Browse page component.
 */

import {
  categoryOf,
  isFullSet,
  isWithinHours,
  movementType,
  type Condition,
  type ItemCategory,
  type MovementType,
} from "./marketplace";
import type { CompetitionListing } from "./store";

export type SortId = "ending" | "popular" | "price-asc" | "price-desc" | "value-desc" | "newest";

export const SORTS: { id: SortId; label: string }[] = [
  { id: "ending", label: "Ending soonest" },
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Ticket price: low to high" },
  { id: "price-desc", label: "Ticket price: high to low" },
  { id: "value-desc", label: "Watch value: high to low" },
  { id: "newest", label: "Newest listings" },
];

export const SORTERS: Record<SortId, (a: CompetitionListing, b: CompetitionListing) => number> = {
  ending: (a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime(),
  popular: (a, b) => b.entriesSold - a.entriesSold,
  "price-asc": (a, b) => a.entryFee - b.entryFee,
  "price-desc": (a, b) => b.entryFee - a.entryFee,
  "value-desc": (a, b) => b.item.purchasePrice - a.item.purchasePrice,
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
};

export type WatchFilters = {
  categories: ItemCategory[];
  brands: string[];
  conditions: Condition[];
  caseMaterials: string[];
  braceletMaterials: string[];
  dialColors: string[];
  movements: MovementType[];
  priceMin: string;
  priceMax: string;
  valueMin: string;
  valueMax: string;
  yearMin: string;
  yearMax: string;
  diameterMin: string;
  diameterMax: string;
  fullSetOnly: boolean;
  endingSoon: boolean;
  /** Cars/handbags/clothing/electronics — see `LuxuryItem` for which category uses which field. */
  colors: string[];
  materials: string[];
  sizes: string[];
  hardware: string[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  mileageMin: string;
  mileageMax: string;
  storageCapacities: string[];
};

export const EMPTY_FILTERS: WatchFilters = {
  categories: [],
  brands: [],
  conditions: [],
  caseMaterials: [],
  braceletMaterials: [],
  dialColors: [],
  movements: [],
  priceMin: "",
  priceMax: "",
  valueMin: "",
  valueMax: "",
  yearMin: "",
  yearMax: "",
  diameterMin: "",
  diameterMax: "",
  fullSetOnly: false,
  endingSoon: false,
  colors: [],
  materials: [],
  sizes: [],
  hardware: [],
  fuelTypes: [],
  transmissions: [],
  bodyTypes: [],
  mileageMin: "",
  mileageMax: "",
  storageCapacities: [],
};

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function activeFilterCount(f: WatchFilters): number {
  return (
    f.categories.length +
    f.brands.length +
    f.conditions.length +
    f.caseMaterials.length +
    f.braceletMaterials.length +
    f.dialColors.length +
    f.movements.length +
    (f.priceMin ? 1 : 0) +
    (f.priceMax ? 1 : 0) +
    (f.valueMin ? 1 : 0) +
    (f.valueMax ? 1 : 0) +
    (f.yearMin ? 1 : 0) +
    (f.yearMax ? 1 : 0) +
    (f.diameterMin ? 1 : 0) +
    (f.diameterMax ? 1 : 0) +
    (f.fullSetOnly ? 1 : 0) +
    (f.endingSoon ? 1 : 0) +
    f.colors.length +
    f.materials.length +
    f.sizes.length +
    f.hardware.length +
    f.fuelTypes.length +
    f.transmissions.length +
    f.bodyTypes.length +
    (f.mileageMin ? 1 : 0) +
    (f.mileageMax ? 1 : 0) +
    f.storageCapacities.length
  );
}

export function matchesFilters(c: CompetitionListing, f: WatchFilters): boolean {
  const item = c.item;
  if (f.categories.length && !f.categories.includes(categoryOf(item))) return false;
  if (f.brands.length && !f.brands.includes(item.brand)) return false;
  if (f.conditions.length && !f.conditions.includes(item.condition)) return false;
  if (f.caseMaterials.length && (!item.caseMaterial || !f.caseMaterials.includes(item.caseMaterial))) return false;
  if (
    f.braceletMaterials.length &&
    (!item.braceletMaterial || !f.braceletMaterials.includes(item.braceletMaterial))
  )
    return false;
  if (f.dialColors.length && (!item.dialColor || !f.dialColors.includes(item.dialColor))) return false;
  if (f.movements.length && !f.movements.includes(movementType(item.movement))) return false;
  if (f.priceMin && c.entryFee < Number(f.priceMin)) return false;
  if (f.priceMax && c.entryFee > Number(f.priceMax)) return false;
  if (f.valueMin && item.purchasePrice < Number(f.valueMin)) return false;
  if (f.valueMax && item.purchasePrice > Number(f.valueMax)) return false;
  if (f.yearMin && item.year < Number(f.yearMin)) return false;
  if (f.yearMax && item.year > Number(f.yearMax)) return false;
  if (f.diameterMin && (!item.caseDiameterMm || item.caseDiameterMm < Number(f.diameterMin))) return false;
  if (f.diameterMax && (!item.caseDiameterMm || item.caseDiameterMm > Number(f.diameterMax))) return false;
  if (f.fullSetOnly && !isFullSet(item.accessories)) return false;
  if (f.endingSoon && !isWithinHours(c.deadlineAt, 48)) return false;
  if (f.colors.length && (!item.color || !f.colors.includes(item.color))) return false;
  if (f.materials.length && (!item.material || !f.materials.includes(item.material))) return false;
  if (f.sizes.length && (!item.size || !f.sizes.includes(item.size))) return false;
  if (f.hardware.length && (!item.hardware || !f.hardware.includes(item.hardware))) return false;
  if (f.fuelTypes.length && (!item.fuelType || !f.fuelTypes.includes(item.fuelType))) return false;
  if (f.transmissions.length && (!item.transmission || !f.transmissions.includes(item.transmission)))
    return false;
  if (f.bodyTypes.length && (!item.bodyType || !f.bodyTypes.includes(item.bodyType))) return false;
  if (f.mileageMin && (item.mileage === undefined || item.mileage < Number(f.mileageMin))) return false;
  if (f.mileageMax && (item.mileage === undefined || item.mileage > Number(f.mileageMax))) return false;
  if (
    f.storageCapacities.length &&
    (!item.storageCapacity || !f.storageCapacities.includes(item.storageCapacity))
  )
    return false;
  return true;
}

/** Counts distinct values of a listing field across a set of listings, for facet counts in the filter panel. */
export function facetCounts<T extends string>(
  listings: CompetitionListing[],
  getKey: (c: CompetitionListing) => T | undefined,
): { value: T; count: number }[] {
  const counts = new Map<T, number>();
  for (const c of listings) {
    const key = getKey(c);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
