import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database";
import { CustomError } from "../../helpers/errorInstance";
import { errorResponse, successResponse } from "../../helpers/responseHandlers";
import { getPaginationOffset, getPaginationTotalPages } from "../../helpers/utilities";
import TransactionModel from "../../models/TransactionModel";
import { paginationSchema } from "../../validations/validationSchemas";
import { TransactionService } from "./service";
import { GetTransactionHistoryResponse } from "./transactionsDTO";
import {
  fundTransferRequestSchema,
  fundWithdrawalRequestSchema,
  transactionAndWalletIdParamSchema,
  walletIdParamSchema,
} from "./validationSchemas";

export class TransactionController {
  private service: TransactionService;

  constructor(service: TransactionService) {
    this.service = service;
  }

  async getTransaction(req: Request, res: Response) {
    const params = transactionAndWalletIdParamSchema.parse(req.params);

    try {
      const { transaction } = await this.service.getWalletTransaction(
        params.transactionId,
        params.walletId,
      );

      successResponse<TransactionModel>(res, transaction, "Transaction");
    } catch (err) {
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async getTransactionHistory(req: Request, res: Response) {
    const params = walletIdParamSchema.parse(req.params);
    const query = paginationSchema.parse(req.query);
    const offset = getPaginationOffset(query.page, query.limit);

    try {
      const { count, transactions } = await this.service.getWalletHistory(
        params.walletId,
        offset,
        query.limit,
      );
      const totalPages = getPaginationTotalPages(count, query.limit);

      successResponse<GetTransactionHistoryResponse>(
        res,
        {
          meta: {
            currentPage: query.page,
            recordsPerPage: query.limit,
            totalPages,
            totalRecords: count,
          },
          transactions,
        },
        "Transaction history",
      );
    } catch (err) {
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  route(req: Request, res: Response) {
    successResponse(res, { url: req.url }, "Message");
  }

  async transferFund(req: Request, res: Response) {
    const params = walletIdParamSchema.parse(req.params);
    const body = fundTransferRequestSchema.parse(req.body);

    try {
      const beneficiaryWallet = await this.service.getBeneficiaryWallet(
        body.beneficiaryAccountNumber,
      );

      const transaction = await database.transaction(async (trx) => {
        return await this.service.transferToWallet(trx, params.walletId, beneficiaryWallet, body);
      });

      successResponse(res, transaction, "Transfer Successful");
    } catch (err) {
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async withdrawFund(req: Request, res: Response) {
    const params = walletIdParamSchema.parse(req.params);
    const body = fundWithdrawalRequestSchema.parse(req.body);

    try {
      const transaction = await database.transaction(async (trx) => {
        return await this.service.withdrawToSettlementAccount(trx, params.walletId, body);
      });

      successResponse(res, transaction, "Withdrawal Successful");
    } catch (err) {
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
