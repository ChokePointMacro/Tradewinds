import type { VesselType } from '@/types';

// Typical service speeds (knots) by vessel class — MODELED defaults (PRD §11.3).
export const VESSEL_SPEED_KN: Record<VesselType, number> = {
  VLCC: 13,
  Suezmax: 14,
  Aframax: 14.5,
  Container: 18,
  Bulk: 14,
};

export const DEFAULT_VESSEL: VesselType = 'VLCC';
export const AIR_SPEED_KN = 480; // ~890 km/h freighter cruise

export function vesselSpeed(vessel: VesselType | undefined): number {
  return vessel ? VESSEL_SPEED_KN[vessel] : VESSEL_SPEED_KN[DEFAULT_VESSEL];
}
