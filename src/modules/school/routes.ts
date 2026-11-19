import { Application } from "express";
import Authentication from "../auth/service";
import SchoolController from "./controller";

const schoolRouter = (app: Application): void => {
  app.post(
    `/api/school`,
    Authentication.authenticate,
    SchoolController.create
  );
  app.put(
    `/api/school`,
    Authentication.authenticate,
    SchoolController.update
  );
  app.delete(
    `/api/school/:id`,
    Authentication.authenticate,
    SchoolController.delete
  );
  app.get(
    `/api/school/:id`,
    Authentication.authenticate,
    SchoolController.findById
  );
  app.get(
    `/api/school/qrcode/:id`,
    Authentication.authenticate,
    SchoolController.generateKey
  );
  app.get(
    `/api/school`,
    Authentication.authenticate,
    SchoolController.findAll
  );
  app.get(
    `/api/school/:regionId`,
    Authentication.authenticate,
    SchoolController.findAll
  );
  app.post(
    `/api/school/batch`,
    Authentication.authenticate,
    SchoolController.createBatch
  );
};

export default schoolRouter;
