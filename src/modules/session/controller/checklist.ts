import { Request, Response } from "express";
import { constants } from "http2";
import { IsNull } from "typeorm";
import dataSource from "../../../database/config/ormconfig";
import { ChecklistItem } from "../entity/checklist-item.entity";

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = constants;

// Documents of the checklist (B12). Their wording can be corrected from the administration;
// the devices receive it at their next synchronisation.
export default class ChecklistController {
  public static findAll = async (_req: Request, res: Response) => {
    try {
      const list = await dataSource.getRepository(ChecklistItem).find({
        where: { deleted_at: IsNull() },
        order: { display_order: "ASC" },
      });
      return res.status(HTTP_STATUS_OK).send(list);
    } catch (error) {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message: (error as any).message,
      });
    }
  };

  public static update = async (req: Request, res: Response) => {
    try {
      const repository = dataSource.getRepository(ChecklistItem);
      const item = await repository.findOne({
        where: { id: req.params.id, deleted_at: IsNull() },
      });
      if (!item) {
        return res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ error: HTTP_STATUS_NOT_FOUND, message: "Object not found" });
      }
      const { document_name, statement } = req.body || {};
      if (!document_name?.trim() || !statement?.trim()) {
        return res.status(HTTP_STATUS_BAD_REQUEST).send({
          error: HTTP_STATUS_BAD_REQUEST,
          message: "The document and its statement are required",
        });
      }
      await repository.update(item.id as string, {
        document_name: document_name.trim(),
        statement: statement.trim(),
        updated_at: new Date(),
      });
      return res
        .status(HTTP_STATUS_OK)
        .send(await repository.findOne({ where: { id: item.id } }));
    } catch (error) {
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        error: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message: (error as any).message,
      });
    }
  };
}
