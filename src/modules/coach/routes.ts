import { Application } from "express";
import Authentication from "../auth/service";
import CoachController from "./controller";

const coachRouter = (app: Application): void => {
  app.post(`/api/coach/signup`, CoachController.signUp);
  app.post(
    `/api/coach`,
    Authentication.authenticate,
    CoachController.create
  );
  app.put(
    `/api/coach`,
    Authentication.authenticate,
    CoachController.update
  );
  app.delete(
    `/api/coach/:id`,
    Authentication.authenticate,
    CoachController.delete
  );
  app.get(
    `/api/coach/:id`,
    Authentication.authenticate,
    CoachController.findById
  );
  app.get(
    `/api/coach`,
    Authentication.authenticate,
    CoachController.findAll
  );
};

export default coachRouter;
