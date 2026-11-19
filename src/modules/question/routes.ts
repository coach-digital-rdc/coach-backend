import { Application } from "express";
import Authentication from "../auth/service";
import QuestionnaireController from "./controller";

const questionnaireRouter = (app: Application): void => {
  app.post(
    `/api/questionnaire`,
    Authentication.authenticate,
    QuestionnaireController.create
  );
  app.put(
    `/api/questionnaire`,
    Authentication.authenticate,
    QuestionnaireController.update
  );
  app.delete(
    `/api/questionnaire/:id`,
    Authentication.authenticate,
    QuestionnaireController.delete
  );
  app.get(
    `/api/questionnaire/:id`,
    Authentication.authenticate,
    QuestionnaireController.findById
  );
  app.get(
    `/api/questionnaire`,
    Authentication.authenticate,
    QuestionnaireController.findAll
  );
};

export default questionnaireRouter;
