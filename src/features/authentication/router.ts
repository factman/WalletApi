import { Router } from "express";

import { TokenAuthType } from "@/helpers/types";
import { authGuard } from "@/middlewares/authMiddleware";
import { validateRequest } from "@/middlewares/validationMiddleware";

import { AuthenticationController } from "./controller";
import { AUTHENTICATION_ROUTES } from "./helpers/constants";
import { validateOtpVerification } from "./middlewares";
import { AuthenticationService } from "./service";
import {
  forgotPasswordRequestSchema,
  initiateAuthenticationRequestSchema,
  initiateBvnVerificationRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  refreshTokenRequestSchema,
  resendEmailVerificationRequestSchema,
  resetPasswordRequestSchema,
  signupRequestSchema,
  verifyBvnRequestSchema,
  verifyEmailRequestSchema,
  verifyForgotPasswordRequestSchema,
} from "./validationSchemas";

const service = new AuthenticationService();
const controller = new AuthenticationController(service);

export const router = Router()
  .post(
    AUTHENTICATION_ROUTES.POST_SIGNUP,
    validateRequest(signupRequestSchema, "body"),
    controller.signup.bind(controller),
  )
  .patch(
    AUTHENTICATION_ROUTES.PATCH_VERIFY_EMAIL,
    authGuard,
    validateRequest(verifyEmailRequestSchema, "body"),
    validateOtpVerification(TokenAuthType.EMAIL),
    controller.verifyEmail.bind(controller),
  )
  .patch(
    AUTHENTICATION_ROUTES.PATCH_RESEND_EMAIL_VERIFICATION,
    authGuard,
    validateRequest(resendEmailVerificationRequestSchema, "body"),
    controller.resendEmailVerification.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_INITIATE_BVN_VERIFICATION,
    authGuard,
    validateRequest(initiateBvnVerificationRequestSchema, "body"),
    controller.initiateBvnVerification.bind(controller),
  )
  .put(
    AUTHENTICATION_ROUTES.PUT_VERIFY_BVN,
    authGuard,
    validateRequest(verifyBvnRequestSchema, "body"),
    validateOtpVerification(TokenAuthType.BVN),
    controller.verifyBvn.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_INITIATE_AUTH,
    validateRequest(initiateAuthenticationRequestSchema, "body"),
    controller.initiateAuth.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_LOGIN,
    validateRequest(loginRequestSchema, "body"),
    validateOtpVerification(TokenAuthType.LOGIN),
    controller.login.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_REFRESH_TOKEN,
    validateRequest(refreshTokenRequestSchema, "body"),
    controller.refreshToken.bind(controller),
  )
  // .patch(
  //   AUTHENTICATION_ROUTES.PATCH_UPDATE_PASSWORD,
  //   authGuard,
  //   validateRequest(updatePasswordRequestSchema, "body"),
  //   controller.updatePassword.bind(controller),
  // )
  .delete(
    AUTHENTICATION_ROUTES.DELETE_LOGOUT,
    authGuard,
    validateRequest(logoutRequestSchema, "body"),
    controller.logout.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_FORGOT_PASSWORD,
    validateRequest(forgotPasswordRequestSchema, "body"),
    controller.forgotPassword.bind(controller),
  )
  .patch(
    AUTHENTICATION_ROUTES.PATCH_VERIFY_FORGOT_PASSWORD,
    validateRequest(verifyForgotPasswordRequestSchema, "body"),
    validateOtpVerification(TokenAuthType.FORGOT_PASSWORD),
    controller.verifyForgotPassword.bind(controller),
  )
  .put(
    AUTHENTICATION_ROUTES.PUT_RESET_PASSWORD,
    validateRequest(resetPasswordRequestSchema, "body"),
    validateOtpVerification(TokenAuthType.FORGOT_PASSWORD),
    controller.route.bind(controller),
  );
