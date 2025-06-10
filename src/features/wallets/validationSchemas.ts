import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations.js";
import { AddSettlementAccountRequest, CreateTransactionPinRequest } from "./walletsDTO.js";

export const addSettlementAccountRequestSchema = buildStrictSchema<AddSettlementAccountRequest>({
  accountName: z.string().nonempty(),
  accountNumber: z
    .string()
    .nonempty()
    .length(10)
    .regex(/^\d+$/, { message: "Account number must contain only digits" }),
  bankCode: z
    .string()
    .nonempty()
    .min(3)
    .max(6)
    .regex(/^\d+$/, { message: "Bank code must contain only digits" }),
});

export const createTransactionPinRequestSchema = buildStrictSchema<CreateTransactionPinRequest>({
  pin: z.string().nonempty().length(4).regex(/^\d+$/, { message: "Pin must contain only digits" }),
});
