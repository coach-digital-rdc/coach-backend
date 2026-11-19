import { Response } from "express";
import { RegionService } from "../region/service";

// Regions an administration user may see: the requested region and its sub-regions,
// limited to the region of the user when the user has one. undefined = every region.
export const getScopedRegionIds = async (
  res: Response,
  regionId?: string
): Promise<string[] | undefined> => {
  const userRegionId: string | undefined = res.locals?.authUser?.region_id;
  const userRegions = userRegionId
    ? (await RegionService.getChildren(userRegionId)).map((item) => `${item.id}`)
    : undefined;

  if (!regionId) return userRegions;

  const requested = (await RegionService.getChildren(regionId)).map(
    (item) => `${item.id}`
  );
  return userRegions
    ? requested.filter((id) => userRegions.includes(id))
    : requested;
};

// Write actions on the shared settings (grid, checklist, PDP rules) are kept to the
// administrators; analysts read only.
export const requireAdmin = (
  _req: unknown,
  res: Response,
  next: () => void
) => {
  if (res.locals?.authUser?.role !== "admin") {
    return res
      .status(403)
      .send({ error: 403, message: "Reserved to the administrators" });
  }
  next();
};
