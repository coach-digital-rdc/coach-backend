import { Application } from "express";
import Authentication from "../auth/service";
import { requireAdmin } from "../helpers/scope";
import CompetenceController from "./controller";

const competenceRouter = (app: Application): void => {
  app.post(
    `/api/competence`,
    Authentication.authenticate,
    requireAdmin,
    CompetenceController.create
  );
  app.put(
    `/api/competence`,
    Authentication.authenticate,
    requireAdmin,
    CompetenceController.update
  );
  app.delete(
    `/api/competence/:id`,
    Authentication.authenticate,
    requireAdmin,
    CompetenceController.delete
  );
  app.get(
    `/api/competence/:id`,
    Authentication.authenticate,
    CompetenceController.findById
  );
  app.get(
    `/api/competence`,
    Authentication.authenticate,
    CompetenceController.findAll
  );
};

export default competenceRouter;
