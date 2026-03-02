import type { Doctor, Service } from "../types";

/**
 * Collect all unique serviceIds from doctors' nested clinics → specializations → services.
 * Optionally filtered by clinicId and/or specializationId.
 */
export function collectServiceIds(
  doctors: Doctor[],
  clinicId?: string,
  specializationId?: string
): string[] {
  const ids = new Set<string>();
  for (const doc of doctors) {
    for (const cl of doc.clinics || []) {
      if (clinicId && cl.clinicId !== clinicId) continue;
      for (const sp of cl.specializations || []) {
        if (specializationId && sp.specializationId !== specializationId) continue;
        for (const svc of sp.services || []) {
          ids.add(svc.serviceId);
        }
      }
    }
  }
  return Array.from(ids);
}

/**
 * Build a Map<serviceId, price> from a services array.
 */
export function buildPriceMap(services: Service[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const svc of services) {
    if (svc.price != null && svc.price > 0) {
      map.set(svc.id, svc.price);
    }
  }
  return map;
}

/**
 * Find the minimum service price for a doctor, optionally filtered by clinic/specialization.
 */
export function getMinPrice(
  doctor: Doctor,
  priceMap: Map<string, number>,
  clinicId?: string,
  specializationId?: string
): number | undefined {
  let min: number | undefined;
  for (const cl of doctor.clinics || []) {
    if (clinicId && cl.clinicId !== clinicId) continue;
    for (const sp of cl.specializations || []) {
      if (specializationId && sp.specializationId !== specializationId) continue;
      for (const svc of sp.services || []) {
        const price = priceMap.get(svc.serviceId);
        if (price != null && (min == null || price < min)) {
          min = price;
        }
      }
    }
  }
  return min;
}
