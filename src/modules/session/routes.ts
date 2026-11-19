import { Application } from "express";
import Authentication from "../auth/service";
import SessionController from "./controller";
import ChecklistController from "./controller/checklist";
import { requireAdmin } from "../helpers/scope";

const sessionRouter = (app: Application): void => {
  app.post(
    `/api/session`,
    Authentication.authenticate,
    SessionController.create
  );
  app.put(
    `/api/session`,
    Authentication.authenticate,
    SessionController.update
  );
  app.delete(
    `/api/session/:id`,
    Authentication.authenticate,
    SessionController.delete
  );
  app.get(
    `/api/session/export`,
    Authentication.authenticate,
    SessionController.exportData
  );
  app.get(
    `/api/session/:id/details`,
    Authentication.authenticate,
    SessionController.findDetails
  );
  app.get(
    `/api/session/:id`,
    Authentication.authenticate,
    SessionController.findById
  );
  app.get(
    `/api/session`,
    Authentication.authenticate,
    SessionController.findAll
  );
  app.get(
    `/api/session-data`,
    Authentication.authenticate,
    SessionController.getSessionData
  );
  app.get(
    `/api/session-over-time`,
    Authentication.authenticate,
    SessionController.getSessionOverTime
  );
  app.get(
    `/api/checklist-items`,
    Authentication.authenticate,
    ChecklistController.findAll
  );
  app.put(
    `/api/checklist-items/:id`,
    Authentication.authenticate,
    requireAdmin,
    ChecklistController.update
  );
};

export default sessionRouter;
