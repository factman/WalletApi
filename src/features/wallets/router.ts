import { Router } from "express";

import { authGuard } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validationMiddleware.js";
import { idParamSchema } from "../../validations/validationSchemas.js";
import { WALLETS_ROUTES } from "./constants.js";
import { WalletController } from "./controller.js";
import { WalletService } from "./service.js";
import {
  addSettlementAccountRequestSchema,
  createTransactionPinRequestSchema,
  nameEnquiryRequestSchema,
} from "./validationSchemas.js";

const service = new WalletService();
const controller = new WalletController(service);

export const router = Router()
  .get(
    WALLETS_ROUTES.GET_WALLET,
    authGuard,
    validateRequest(idParamSchema, "params"),
    controller.getWallet.bind(controller),
  )
  .post(
    WALLETS_ROUTES.POST_ADD_SETTLEMENT_ACCOUNT,
    authGuard,
    validateRequest(idParamSchema, "params"),
    validateRequest(addSettlementAccountRequestSchema, "body"),
    controller.setSettlementAccount.bind(controller),
  )
  .post(
    WALLETS_ROUTES.POST_CREATE_TRANSACTION_PIN,
    authGuard,
    validateRequest(idParamSchema, "params"),
    validateRequest(createTransactionPinRequestSchema, "body"),
    controller.createTransactionPin.bind(controller),
  )
  .get(
    WALLETS_ROUTES.GET_NAME_ENQUIRY,
    authGuard,
    validateRequest(nameEnquiryRequestSchema, "params"),
    controller.nameEnquiry.bind(controller),
  );
