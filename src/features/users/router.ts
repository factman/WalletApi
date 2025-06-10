import { Router } from "express";

import { authGuard } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validationMiddleware.js";
import { idParamSchema } from "../../validations/validationSchemas.js";
import { USERS_ROUTES } from "./constants.js";
import { UsersController } from "./controller.js";
import { UsersService } from "./service.js";
import { changePasswordRequestSchema } from "./validationSchemas.js";

const service = new UsersService();
const controller = new UsersController(service);

export const router = Router()
  .get(
    USERS_ROUTES.GET_USER,
    authGuard,
    validateRequest(idParamSchema, "params"),
    controller.getUser.bind(controller),
  )
  .patch(
    USERS_ROUTES.PATCH_CHANGE_PASSWORD,
    authGuard,
    validateRequest(idParamSchema, "params"),
    validateRequest(changePasswordRequestSchema, "body"),
    controller.changePassword.bind(controller),
  )
  .delete(
    USERS_ROUTES.DELETE_ACCOUNT,
    authGuard,
    validateRequest(idParamSchema, "params"),
    controller.deleteAccount.bind(controller),
  );
