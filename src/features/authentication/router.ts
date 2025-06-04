import { Router } from "express";

import { authGuard } from "@/middlewares/authMiddleware";
import { validateRequest } from "@/middlewares/validationMiddleware";

import { AuthenticationController } from "./controller";
import { AUTHENTICATION_ROUTES } from "./helpers/constants";
import { AuthenticationService } from "./service";
import {
  forgetPasswordRequestSchema,
  initiateAuthenticationRequestSchema,
  initiateBvnVerificationRequest,
  loginRequestSchema,
  logoutRequestSchema,
  refreshTokenRequestSchema,
  resendEmailVerificationRequestSchema,
  resetPasswordRequestSchema,
  signupRequestSchema,
  updatePasswordRequestSchema,
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
    validateRequest(initiateBvnVerificationRequest, "body"),
    controller.route.bind(controller),
  )
  .put(
    AUTHENTICATION_ROUTES.PUT_VERIFY_BVN,
    authGuard,
    validateRequest(verifyBvnRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_INITIATE_AUTH,
    validateRequest(initiateAuthenticationRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_LOGIN,
    validateRequest(loginRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_REFRESH_TOKEN,
    validateRequest(refreshTokenRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .patch(
    AUTHENTICATION_ROUTES.PATCH_UPDATE_PASSWORD,
    authGuard,
    validateRequest(updatePasswordRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .delete(
    AUTHENTICATION_ROUTES.DELETE_LOGOUT,
    authGuard,
    validateRequest(logoutRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .post(
    AUTHENTICATION_ROUTES.POST_FORGOT_PASSWORD,
    validateRequest(forgetPasswordRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .patch(
    AUTHENTICATION_ROUTES.PATCH_VERIFY_FORGOT_PASSWORD,
    validateRequest(verifyForgotPasswordRequestSchema, "body"),
    controller.route.bind(controller),
  )
  .put(
    AUTHENTICATION_ROUTES.PUT_RESET_PASSWORD,
    validateRequest(resetPasswordRequestSchema, "body"),
    controller.route.bind(controller),
  );
