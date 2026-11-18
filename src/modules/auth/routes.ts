import { Application } from "express";
import Authentication from "./service";
import AuthenticationController from "./controller";

const AuthRouter = (app: Application): void => {
  app.post(`/api/auth`, AuthenticationController.otpAdmin);
  app.post(
    `/api/auth/verify`,
    AuthenticationController.verifyOtpAdmin
  );
  app.get(
    `/api/auth`,
    Authentication.authenticate,
    (_req, res) => res.status(200).send(res.locals?.authUser)
  );
  app.get(
    `/api/auth/superset`,
    Authentication.authenticate,
    AuthenticationController.supertsetLogin
  );
  app.post(`/api/auth/otp`, AuthenticationController.otp);

  app.post(
    `/api/auth/otp/verify`,
    AuthenticationController.verifyOtp
  );
};

export default AuthRouter;
