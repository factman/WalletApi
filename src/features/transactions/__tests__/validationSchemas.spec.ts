import { describe, expect, it } from "vitest";

import {
  fundTransferRequestSchema,
  fundWithdrawalRequestSchema,
  transactionAndWalletIdParamSchema,
  walletIdParamSchema,
} from "../validationSchemas";

// Mock valid values for imported schemas
const validAmount = 1000;
const validAccountNumber = "1234567890";
const validTransactionPin = "1234";

describe("walletIdParamSchema", () => {
  it("should validate a valid walletId", () => {
    const result = walletIdParamSchema.safeParse({
      walletId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should fail for invalid walletId", () => {
    const result = walletIdParamSchema.safeParse({ walletId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("transactionAndWalletIdParamSchema", () => {
  it("should validate valid transactionId and walletId", () => {
    const data = {
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      walletId: "550e8400-e29b-41d4-a716-446655440001",
    };
    const result = transactionAndWalletIdParamSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should fail if either id is not a uuid", () => {
    const data = {
      transactionId: "invalid",
      walletId: "550e8400-e29b-41d4-a716-446655440001",
    };
    const result = transactionAndWalletIdParamSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("fundTransferRequestSchema", () => {
  it("should validate a correct fund transfer request", () => {
    const data = {
      amount: validAmount,
      beneficiaryAccountNumber: validAccountNumber,
      remark: "Test transfer",
      transactionPin: validTransactionPin,
    };
    const result = fundTransferRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should allow remark to be omitted", () => {
    const data = {
      amount: validAmount,
      beneficiaryAccountNumber: validAccountNumber,
      transactionPin: validTransactionPin,
    };
    const result = fundTransferRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should fail if amount is missing", () => {
    const data = {
      beneficiaryAccountNumber: validAccountNumber,
      transactionPin: validTransactionPin,
    };
    const result = fundTransferRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should fail if remark is too long", () => {
    const data = {
      amount: validAmount,
      beneficiaryAccountNumber: validAccountNumber,
      remark: "a".repeat(256),
      transactionPin: validTransactionPin,
    };
    const result = fundTransferRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe("fundWithdrawalRequestSchema", () => {
  it("should validate a correct fund withdrawal request", () => {
    const data = {
      amount: validAmount,
      remark: "Test withdrawal",
      transactionPin: validTransactionPin,
    };
    const result = fundWithdrawalRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should allow remark to be omitted", () => {
    const data = {
      amount: validAmount,
      transactionPin: validTransactionPin,
    };
    const result = fundWithdrawalRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should fail if transactionPin is missing", () => {
    const data = {
      amount: validAmount,
      remark: "Test withdrawal",
    };
    const result = fundWithdrawalRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should fail if remark is too long", () => {
    const data = {
      amount: validAmount,
      remark: "a".repeat(256),
      transactionPin: validTransactionPin,
    };
    const result = fundWithdrawalRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
