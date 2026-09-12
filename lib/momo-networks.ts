import type { MomoNetwork } from "@/types";

export const MOMO_NETWORK_LOGOS: Record<MomoNetwork, string> = {
  Moov: "/moov.png",
  MTN: "/Momo.png",
};

export function getMomoNetworkLogo(network: MomoNetwork) {
  return MOMO_NETWORK_LOGOS[network];
}
