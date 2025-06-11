import { Router } from "express";

import { validateRequest } from "../../middlewares/validationMiddleware.js";
import { TRANSACTION_ROUTES } from "./constants.js";
import { TransactionController } from "./controller.js";
import { TransactionService } from "./service.js";
import {
  fundTransferRequestSchema,
  fundWithdrawalRequestSchema,
  transactionAndWalletIdParamSchema,
  walletIdParamSchema,
} from "./validationSchemas.js";

const service = new TransactionService();
const controller = new TransactionController(service);

export const router = Router()
  .get(
    TRANSACTION_ROUTES.GET_TRANSACTION,
    validateRequest(transactionAndWalletIdParamSchema, "params"),
    controller.getTransaction.bind(controller),
  )
  .get(
    TRANSACTION_ROUTES.GET_TRANSACTIONS_HISTORY,
    validateRequest(walletIdParamSchema, "params"),
    controller.getTransactionHistory.bind(controller),
  )
  .post(
    TRANSACTION_ROUTES.POST_FUND_TRANSFER,
    validateRequest(walletIdParamSchema, "params"),
    validateRequest(fundTransferRequestSchema, "body"),
    controller.transferFund.bind(controller),
  )
  .post(
    TRANSACTION_ROUTES.POST_FUND_WITHDRAWAL,
    validateRequest(walletIdParamSchema, "params"),
    validateRequest(fundWithdrawalRequestSchema, "body"),
    controller.withdrawFund.bind(controller),
  );
