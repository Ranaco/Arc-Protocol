import { ARCBoundingCurveMarketplaceABI } from "./abis/arc_bounding_curve_marketplace";
import { ARCTokenABI } from "./abis/arc_token";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  1: {
    ARCToken: {
      address: "0x800ac168F688Befb78b110e9d88020C9Ce11B699",
      abi: ARCTokenABI,
    },
    ARCBoundingCurveMarketplace: {
      address: "0x1CD6495201fe4aE5CA4bBc7b8b014cD46CC7cF3a",
      abi: ARCBoundingCurveMarketplaceABI,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
