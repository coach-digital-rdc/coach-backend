import { Application } from "express";
import Authentication from "../auth/service";
import ImageController from "./controller";

const imageRouter = (app: Application): void => {
  app.post(
    `/api/image`,
    Authentication.authenticate,
    ImageController.create
  );
  app.put(
    `/api/image`,
    Authentication.authenticate,
    ImageController.update
  );
  app.delete(
    `/api/image/:id`,
    Authentication.authenticate,
    ImageController.delete
  );
  app.get(
    `/api/image/:id`,
    Authentication.authenticate,
    ImageController.findById
  );
  app.get(
    `/api/image`,
    Authentication.authenticate,
    ImageController.findAll
  );
};

export default imageRouter;
