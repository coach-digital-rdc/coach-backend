import { Request, Response } from "express";
import { constants } from "http2";
import dataSource from "../../../database/config/ormconfig";
import { getScopedRegionIds } from "../../helpers/scope";

const { HTTP_STATUS_OK, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants;

// Learning circles sent by the devices (B22), with the observer and the school
export default class TlcController {
  public static findAll = async (
    req: Request<any, any, any, { regionId?: string }>,
    res: Response
  ) => {
    try {
      const regionIds = await getScopedRegionIds(res, req.query.regionId);
      if (regionIds && regionIds.length === 0) {
        return res.status(HTTP_STATUS_OK).send([]);
      }
      const list = await dataSource.query(
        `SELECT t.id, t.unit_id, t.evaluation, t.participants, t.participants_count,
                t.created_at, sc.id AS school_id, sc.name AS school_name,
                c.id AS coach_id, TRIM(CONCAT(c.name, ' ', c.surname)) AS coach_name
           FROM tlc_evaluation t
           JOIN school sc ON sc.id = t.school_id
           LEFT JOIN coach c ON c.id = t.coach_id
          WHERE t.deleted_at IS NULL ${regionIds ? "AND sc.region_id = ANY($1)" : ""}
          ORDER BY t.created_at DESC`,
        regionIds ? [regionIds] : []
      );
      return res.status(HTTP_STATUS_OK).send(list);
    } catch (error) {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message: (error as any).message,
      });
    }
  };
}
