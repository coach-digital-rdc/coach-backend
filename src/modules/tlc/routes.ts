import { Application } from "express";
import Authentication from "../auth/service";
import TlcController from "./controller";

const tlcRouter = (app: Application): void => {
  app.get(
    `/api/tlc-evaluations`,
    Authentication.authenticate,
    TlcController.findAll
  );
};

export default tlcRouter;
