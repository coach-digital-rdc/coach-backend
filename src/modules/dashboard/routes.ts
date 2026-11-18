import { Application } from "express";
import Authentication from "../auth/service";
import DashboardController from "./controller";

const dashboardRouter = (app: Application): void => {
  app.get(
    `/api/dashboard`,
    Authentication.authenticate,
    DashboardController.getData
  );
};

export default dashboardRouter;
