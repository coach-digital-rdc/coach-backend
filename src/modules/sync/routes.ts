import { Application } from "express";
import SyncController from "./controller";
import Authentication from "../auth/service";

const SyncRouter = (app: Application): void => {
  app.get(
    `/api/sync/list`,
    Authentication.authenticate,
    SyncController.findAll
  );
  app.post(`/api/sync`, SyncController.push);
};

export default SyncRouter;
