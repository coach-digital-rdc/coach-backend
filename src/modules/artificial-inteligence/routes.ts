import AIController from "./controller";
import { Application } from "express";
import config from "../../config";

const AIRouter = (app: Application): void => {
  app.post(`/${config.country}/api/select-answer`, AIController.selectAnswer);

  app.post(
    `/${config.country}/api/generate-suggestion`,
    AIController.generateSuggestion
  );
};

export default AIRouter;
