import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import database from "../../configs/database";
import { CustomError } from "../../helpers/errorInstance";
import { errorResponse, successResponse } from "../../helpers/responseHandlers";
import { idParamSchema } from "../../validations/validationSchemas";
import { WalletService } from "./service";
import {
  addSettlementAccountRequestSchema,
  createTransactionPinRequestSchema,
  fundWalletRequestSchema,
  nameEnquiryRequestSchema,
} from "./validationSchemas";
import { GetWalletResponse, NameEnquiryResponse } from "./walletsDTO";

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
      const { wallet } = await this.service.getUserWallet(user.id);

      if (wallet.isTransactionPinSet)
        throw new CustomError("Already Set", StatusCodes.BAD_REQUEST, {
          message: "Transaction Pin is already set",
        });

      await database.transaction(async (trx) => {
        await this.service.createWalletPin(trx, params.id, body.pin);
      });

      successResponse(res, null, "Transaction Pin created successfully");
    } catch (err) {
      console.log(err);
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
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async getWallet(req: Request, res: Response) {
    const user = req.userPayload;

    try {
      const { wallet } = await this.service.getUserWallet(user.id);

      successResponse<GetWalletResponse>(res, { ...wallet }, "Fetched User Wallet");
    } catch (err) {
      console.log(err);
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
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }

  async setSettlementAccount(req: Request, res: Response) {
    const params = idParamSchema.parse(req.params);
    const body = addSettlementAccountRequestSchema.parse(req.body);
    const user = req.userPayload;

    try {
      const { wallet } = await this.service.getUserWallet(user.id);

      if (wallet.isSettlementAccountSet)
        throw new CustomError("Already Set", StatusCodes.BAD_REQUEST, {
          message: "Settlement account already set",
        });

      await database.transaction(async (trx) => {
        await this.service.setWalletSettlementAccount(trx, params.id, {
          settlementAccountName: body.accountName,
          settlementAccountNumber: body.accountNumber,
          settlementBankCode: body.bankCode,
        });
      });

      successResponse(res, null, "Settlement Account Set Successfully");
    } catch (err) {
      console.log(err);
      const error = CustomError.fromError(err as Error, StatusCodes.INTERNAL_SERVER_ERROR);
      errorResponse(res, error.status, error);
    }
  }
}
