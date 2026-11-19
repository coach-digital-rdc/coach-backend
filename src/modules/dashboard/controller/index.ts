import { Request, Response } from "express";
import { DashboardService } from "../service";

import { constants } from "http2";
import { SchoolService } from "../../school/service";
import { Region } from "../../region/entity/region.entity";
import { RegionService } from "../../region/service";
import { RdcDashboardService } from "../service/rdc";
import { getScopedRegionIds } from "../../helpers/scope";

const { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;

export default class DashboardController {
  public static getData = async (
    req: Request<
      unknown,
      unknown,
      unknown,
      { regionId?: Region["id"]; startDate?: string; endDate?: string }
    >,
    res: Response
  ): Promise<any> => {
    try {
      const { regionId, startDate, endDate } = req.query;

      if (regionId) {
        const regions = await RegionService.getChildren(regionId);
        const data = await DashboardService.getDataRegionRegion(
          regions.map((item) => `'${item.id}'`).join(),
          startDate,
          endDate
        );
        return res.status(HTTP_STATUS_OK).send(data);
      }

      const data = await DashboardService.getData(startDate, endDate);
      return res.status(HTTP_STATUS_OK).send(data);
    } catch (error) {
      console.log({ error });
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message: (error as any).message,
      });
    }
  };

  // Dashboard of the DRC version (B26)
  public static getRdcData = async (
    req: Request<
      unknown,
      unknown,
      unknown,
      { regionId?: Region["id"]; startDate?: string; endDate?: string }
    >,
    res: Response
  ): Promise<any> => {
    try {
      const { regionId, startDate, endDate } = req.query;
      const regionIds = await getScopedRegionIds(res, regionId);
      const data = await RdcDashboardService.getData({
        regionIds,
        areaParentId: regionId || res.locals?.authUser?.region_id,
        startDate,
        endDate,
      });
      return res.status(HTTP_STATUS_OK).send(data);
    } catch (error) {
      console.log({ error });
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message: (error as any).message,
      });
    }
  };
}
