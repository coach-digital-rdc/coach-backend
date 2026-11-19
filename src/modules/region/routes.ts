import { Application } from "express";
import Authentication from "../auth/service";
import RegionController from "./controller";

const schoolRouter = (app: Application): void => {
  app.post(
    `/api/region`,
    Authentication.authenticate,
    RegionController.save
  );
  app.delete(
    `/api/region/:id`,
    Authentication.authenticate,
    RegionController.delete
  );
  app.get(
    `/api/region`,
    Authentication.authenticate,
    RegionController.findAll
  );
  app.get(
    `/api/region/tree`,
    Authentication.authenticate,
    RegionController.findAllTree
  );
  app.get(
    `/api/region/:id`,
    Authentication.authenticate,
    RegionController.findById
  );
  app.post(
    `/api/region/batch`,
    Authentication.authenticate,
    RegionController.createBatch
  );
};

export default schoolRouter;
