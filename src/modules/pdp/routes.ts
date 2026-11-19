import { Application } from "express";
import Authentication from "../auth/service";
import { requireAdmin } from "../helpers/scope";
import PdpRuleSetController from "./controller";

// PDP rules edited from the administration (B19)
const pdpRouter = (app: Application): void => {
  app.get(
    `/api/pdp/rule-sets`,
    Authentication.authenticate,
    PdpRuleSetController.findAll
  );
  app.get(
    `/api/pdp/rule-sets/:id`,
    Authentication.authenticate,
    PdpRuleSetController.findById
  );
  app.post(
    `/api/pdp/rule-sets`,
    Authentication.authenticate,
    requireAdmin,
    PdpRuleSetController.createDraft
  );
  app.put(
    `/api/pdp/rule-sets/:id`,
    Authentication.authenticate,
    requireAdmin,
    PdpRuleSetController.updateDraft
  );
  app.post(
    `/api/pdp/rule-sets/:id/publish`,
    Authentication.authenticate,
    requireAdmin,
    PdpRuleSetController.publish
  );
  app.delete(
    `/api/pdp/rule-sets/:id`,
    Authentication.authenticate,
    requireAdmin,
    PdpRuleSetController.deleteDraft
  );
};

export default pdpRouter;
