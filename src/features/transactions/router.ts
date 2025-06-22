import { Router } from "express";

import { authGuard } from "../../middlewares/authMiddleware";
import { validateRequest } from "../../middlewares/validationMiddleware";
import { paginationSchema } from "../../validations/validationSchemas";
import { TRANSACTION_ROUTES } from "./constants";
import { TransactionController } from "./controller";
import { TransactionService } from "./service";
import {
  fundTransferRequestSchema,
  fundWithdrawalRequestSchema,
  transactionAndWalletIdParamSchema,
  walletIdParamSchema,
} from "./validationSchemas";

const service = new TransactionService();
const controller = new TransactionController(service);

export const router = Router()
  .get(
    TRANSACTION_ROUTES.GET_TRANSACTION,
    authGuard,
    validateRequest(transactionAndWalletIdParamSchema, "params"),
    controller.getTransaction.bind(controller),
  )
  .get(
    TRANSACTION_ROUTES.GET_TRANSACTIONS_HISTORY,
    authGuard,
    validateRequest(paginationSchema, "query"),
    validateRequest(walletIdParamSchema, "params"),
    controller.getTransactionHistory.bind(controller),
  )
  .post(
    TRANSACTION_ROUTES.POST_FUND_TRANSFER,
    authGuard,
    validateRequest(walletIdParamSchema, "params"),
    validateRequest(fundTransferRequestSchema, "body"),
    controller.transferFund.bind(controller),
  )
  .post(
    TRANSACTION_ROUTES.POST_FUND_WITHDRAWAL,
    authGuard,
    validateRequest(walletIdParamSchema, "params"),
    validateRequest(fundWithdrawalRequestSchema, "body"),
    controller.withdrawFund.bind(controller),
  );
