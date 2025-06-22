import { describe, expect, it } from "vitest";

import {
  addSettlementAccountRequestSchema,
  createTransactionPinRequestSchema,
  fundWalletRequestSchema,
  nameEnquiryRequestSchema,
} from "../validationSchemas";

describe("addSettlementAccountRequestSchema", () => {
  it("should pass with valid data", () => {
    const data = {
      accountName: "John Doe",
      accountNumber: "1234567890",
      bankCode: "123",
    };
    expect(() => addSettlementAccountRequestSchema.parse(data)).not.toThrow();
  });

  it("should fail if accountName is empty", () => {
    const data = {
      accountName: "",
      accountNumber: "1234567890",
      bankCode: "123",
    };
    expect(() => addSettlementAccountRequestSchema.parse(data)).toThrow();
  });

  it("should fail if bankCode contains letters", () => {
    const data = {
      accountName: "John Doe",
      accountNumber: "1234567890",
      bankCode: "12A",
    };
    expect(() => addSettlementAccountRequestSchema.parse(data)).toThrow();
  });
});

describe("createTransactionPinRequestSchema", () => {
  it("should pass with valid pin", () => {
    const data = { pin: "1234" };
    expect(() => createTransactionPinRequestSchema.parse(data)).not.toThrow();
  });

  it("should fail with invalid pin", () => {
    const data = { pin: "12" };
    expect(() => createTransactionPinRequestSchema.parse(data)).toThrow();
  });
});

describe("nameEnquiryRequestSchema", () => {
  it("should pass with valid accountNumber", () => {
    const data = { accountNumber: "1234567890" };
    expect(() => nameEnquiryRequestSchema.parse(data)).not.toThrow();
  });

  it("should fail with invalid accountNumber", () => {
    const data = { accountNumber: "abc" };
    expect(() => nameEnquiryRequestSchema.parse(data)).toThrow();
  });
});

describe("fundWalletRequestSchema", () => {
  it("should pass with valid data", () => {
    const data = {
      amount: 1000,
      senderAccountName: "Jane Doe",
      senderAccountNumber: "1234567890",
      senderBankCode: "456",
    };
    expect(() => fundWalletRequestSchema.parse(data)).not.toThrow();
  });

  it("should fail if amount is negative", () => {
    const data = {
      amount: -100,
      senderAccountName: "Jane Doe",
      senderAccountNumber: "1234567890",
      senderBankCode: "456",
    };
    expect(() => fundWalletRequestSchema.parse(data)).toThrow();
  });

  it("should fail if senderAccountName is empty", () => {
    const data = {
      amount: 1000,
      senderAccountName: "",
      senderAccountNumber: "1234567890",
      senderBankCode: "456",
    };
    expect(() => fundWalletRequestSchema.parse(data)).toThrow();
  });

  it("should fail if senderBankCode is too short", () => {
    const data = {
      amount: 1000,
      senderAccountName: "Jane Doe",
      senderAccountNumber: "1234567890",
      senderBankCode: "1",
    };
    expect(() => fundWalletRequestSchema.parse(data)).toThrow();
  });
});
