import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database.js";
import { CustomError } from "../../helpers/errorInstance.js";
import { errorResponse, successResponse } from "../../helpers/responseHandlers.js";
import { idParamSchema } from "../../validations/validationSchemas.js";
import { WalletService } from "./service.js";
import {
  addSettlementAccountRequestSchema,
  createTransactionPinRequestSchema,
  fundWalletRequestSchema,
  nameEnquiryRequestSchema,
} from "./validationSchemas.js";
import { GetWalletResponse, NameEnquiryResponse } from "./walletsDTO.js";

export class WalletController {
  private service: WalletService;

  constructor(service: WalletService) {
    this.service = service;
  }

  async createTransactionPin(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);
    const body = createTransactionPinRequestSchema.parse(req.body);
    const user = req.userPayload;

    try {
      const { wallet } = await this.service.getUserWallet(params.id, user.id);

      if (wallet.isTransactionPinSet)
        throw new CustomError("Already Set", StatusCodes.BAD_REQUEST, {
          message: "Transaction Pin is already set",
        });

      await database.transaction(async (trx) => {
        await this.service.createWalletPin(trx, wallet.id, body.pin);
      });

      successResponse(res, null, "Transaction Pin created successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async fundWallet(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);
    const body = fundWalletRequestSchema.parse(req.body);

    try {
      await database.transaction(async (trx) => {
        await this.service.fundUserWallet(trx, params.id, body);
      });
      successResponse(res, null, "Funded Wallet Successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async getWallet(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);
    const user = req.userPayload;

    try {
      const { wallet } = await this.service.getUserWallet(params.id, user.id);

      successResponse<GetWalletResponse>(res, { ...wallet }, "Fetched User Wallet");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async nameEnquiry(req: Request, res: Response) {
    const params = nameEnquiryRequestSchema.parse(req.params);

    try {
      const { account } = await this.service.getAccountDetails(params.accountNumber);

      successResponse<NameEnquiryResponse>(res, { ...account }, "Fetched Account Details");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async setSettlementAccount(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);
    const body = addSettlementAccountRequestSchema.parse(req.body);
    const user = req.userPayload;

    try {
      const { wallet } = await this.service.getUserWallet(params.id, user.id);

      if (wallet.isSettlementAccountSet)
        throw new CustomError("Already Set", StatusCodes.BAD_REQUEST, {
          message: "Settlement account already set",
        });

      await database.transaction(async (trx) => {
        await this.service.setWalletSettlementAccount(trx, wallet.id, {
          settlementAccountName: body.accountName,
          settlementAccountNumber: body.accountNumber,
          settlementBankCode: body.bankCode,
        });
      });

      successResponse(res, null, "Settlement Account Set Successfully");
    } catch (err) {
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
