import { Request, Response } from "express";
import { constants } from "http2";
import { PdpRuleSetService, RuleSetError } from "../service";

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = constants;

const sendError = (res: Response, error: unknown) => {
  const status =
    error instanceof RuleSetError
      ? error.status
      : HTTP_STATUS_INTERNAL_SERVER_ERROR;
  res.status(status).send({ error: status, message: (error as any).message });
};

export default class PdpRuleSetController {
  public static findAll = async (_req: Request, res: Response) => {
    try {
      return res.status(HTTP_STATUS_OK).send(await PdpRuleSetService.findAll());
    } catch (error) {
      sendError(res, error);
    }
  };

  public static findById = async (req: Request, res: Response) => {
    try {
      const item = await PdpRuleSetService.findById(req.params.id);
      if (!item) {
        return res
          .status(HTTP_STATUS_NOT_FOUND)
          .send({ error: HTTP_STATUS_NOT_FOUND, message: "Object not found" });
      }
      return res.status(HTTP_STATUS_OK).send(item);
    } catch (error) {
      sendError(res, error);
    }
  };

  public static createDraft = async (req: Request, res: Response) => {
    try {
      const draft = await PdpRuleSetService.createDraft(req.body?.from_id);
      return res.status(HTTP_STATUS_CREATED).send(draft);
    } catch (error) {
      sendError(res, error);
    }
  };

  public static updateDraft = async (req: Request, res: Response) => {
    try {
      const draft = await PdpRuleSetService.updateDraft(req.params.id, req.body);
      return res.status(HTTP_STATUS_OK).send(draft);
    } catch (error) {
      sendError(res, error);
    }
  };

  public static publish = async (req: Request, res: Response) => {
    try {
      const ruleSet = await PdpRuleSetService.publish(
        req.params.id,
        res.locals?.authUser?.id
      );
      return res.status(HTTP_STATUS_OK).send(ruleSet);
    } catch (error) {
      sendError(res, error);
    }
  };

  public static deleteDraft = async (req: Request, res: Response) => {
    try {
      await PdpRuleSetService.deleteDraft(req.params.id);
      return res.status(HTTP_STATUS_OK).send({ id: req.params.id });
    } catch (error) {
      sendError(res, error);
    }
  };
}
