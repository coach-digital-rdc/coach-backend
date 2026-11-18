import { Application } from "express";
import Authentication from "../auth/service";
import TeacherController from "./controller";

const teacherRouter = (app: Application): void => {
  app.post(
    `/api/teacher`,
    Authentication.authenticate,
    TeacherController.create
  );
  app.put(
    `/api/teacher`,
    Authentication.authenticate,
    TeacherController.update
  );
  app.delete(
    `/api/teacher/:id`,
    Authentication.authenticate,
    TeacherController.delete
  );
  app.get(
    `/api/teacher/:id`,
    Authentication.authenticate,
    TeacherController.findById
  );
  app.get(
    `/api/teacher`,
    Authentication.authenticate,
    TeacherController.findAll
  );
};

export default teacherRouter;
