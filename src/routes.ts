import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./swaggerOptions";

import authRouter from "./modules/auth/routes";
import userRouter from "./modules/user/router";
import schoolRouter from "./modules/school/routes";
import regionRouter from "./modules/region/routes";
import teacherRouter from "./modules/teacher/routes";
import sessionRouter from "./modules/session/routes";
import questionRouter from "./modules/question/routes";
import competenceRouter from "./modules/competencies/routes";
import syncRouter from "./modules/sync/routes";
import coachRouter from "./modules/coach/routes";
import imageRouter from "./modules/image/routes";
import logRouter from "./modules/logs/routes";
import dashboardRouter from "./modules/dashboard/routes";
import pdpRouter from "./modules/pdp/routes";
import tlcRouter from "./modules/tlc/routes";
import config from "./config";

const packageJson: any = require("../package.json");

const Routes = {
  setupRoutes: (app: Application): void => {
    syncRouter(app);
    authRouter(app);
    userRouter(app);
    imageRouter(app);
    coachRouter(app);
    schoolRouter(app);
    regionRouter(app);
    schoolRouter(app);
    sessionRouter(app);
    teacherRouter(app);
    questionRouter(app);
    dashboardRouter(app);
    competenceRouter(app);
    logRouter(app);
    pdpRouter(app);
    tlcRouter(app);

    // Versions of the mobile application, read by the app at start-up (B28)
    app.get(`/api/app/version`, (_req: Request, res: Response) => {
      res.send({
        latest_version: config.app.latestVersion || null,
        min_version: config.app.minVersion || null,
        download_url: config.app.downloadUrl || null,
      });
    });

    app.get(`/api/`, (_req: Request, res: Response) => {
      res.send(
        `Coach Digital RDC API v${packageJson?.version} is running.`
      );
    });

    app.use(
      `/api/docs`,
      swaggerUi.serve,
      swaggerUi.setup(swaggerOptions)
    );

    app.all("*", (req: Request, res: Response): Response => {
      console.log(req.path);
      return res
        .status(404)
        .send({ error: 404, message: "Check your URL please" });
    });
  },
};

export default Routes;
