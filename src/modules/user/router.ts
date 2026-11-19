import { Application } from "express";
import UserController from "./controller";
import Authentication from "../auth/service";

const UserRouter = (app: Application): void => {
  app.get(`/api/users/coach`, UserController.findAllCoaches);
  app.post(`/api/users/coach/sign-up`, () => {});
  app.post(
    `/api/users/admin/sign-up`,
    Authentication.authenticate,
    UserController.signUpAdmin
  );
  app.get(
    `/api/users/admin`,
    Authentication.authenticate,
    UserController.findAllAdmins
  );
  app.patch(
    `/api/users/admin/:user_id`,
    Authentication.authenticate,
    UserController.updateAdmin
  );
  app.delete(
    `/api/users/admin/:user_id`,
    Authentication.authenticate,
    UserController.removeAdmin
  );
};

export default UserRouter;
