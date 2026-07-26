import { ResidentDto } from "@type/openapiTypes";

export interface CallPolicyFloor {
  autoAnswer: boolean;
  cameraOnByDefault: boolean;
}

// Mirror of UserPreferences.CallPolicyPreferences.defaultsFor on the backend
export const CALL_POLICY_FLOOR: Record<
  NonNullable<ResidentDto["autonomyLevel"]>,
  CallPolicyFloor
> = {
  AUTONOMOUS: { autoAnswer: false, cameraOnByDefault: false },
  INTERMEDIATE: { autoAnswer: true, cameraOnByDefault: false },
  DEPENDENT: { autoAnswer: true, cameraOnByDefault: true },
};
