import { Router } from "express";

import { authGuard } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validationMiddleware";
import { idParamSchema } from "../../validations/validationSchemas";
import { WALLETS_ROUTES } from "./constants";
import { WalletController } from "./controller";
import { WalletService } from "./service";
import {
  addSettlementAccountRequestSchema,
  createTransactionPinRequestSchema,
  fundWalletRequestSchema,
  nameEnquiryRequestSchema,
} from "./validationSchemas";

const service = new WalletService();
const controller = new WalletController(service);

export const router = Router()
  .get(WALLETS_ROUTES.GET_WALLET, authGuard, controller.getWallet.bind(controller))
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
  )
  .post(
    WALLETS_ROUTES.POST_FUND_WALLET,
    authGuard,
    validateRequest(idParamSchema, "params"),
    validateRequest(fundWalletRequestSchema, "body"),
    controller.fundWallet.bind(controller),
  );
