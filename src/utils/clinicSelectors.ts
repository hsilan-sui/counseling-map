import type { ClinicWithGeo } from "@/utils/clinicMapper";

/**
 * What:
 * Selects clinics based on the current quota filter and optional distance-sorted result.
 *
 * How:
 * Applies the existing `filter` rules to `clinicsAll`, then returns
 * `sortedByDistance` when available; otherwise returns the filtered clinics.
 *
 * Why:
 * Moves list derivation out of page-level UI orchestration while preserving
 * the same selection flow and output shape.
 */
export function selectClinics(params: {
  clinicsAll: ClinicWithGeo[];
  filter: string;
  sortedByDistance: ClinicWithGeo[] | null;
}): ClinicWithGeo[] {
  const { clinicsAll, filter, sortedByDistance } = params;

  const clinics =
    filter === "has"
      ? clinicsAll.filter((c) => c.has_quota)
      : filter === "none"
        ? clinicsAll.filter((c) => !c.has_quota)
        : clinicsAll;

  return sortedByDistance ?? clinics;
}
