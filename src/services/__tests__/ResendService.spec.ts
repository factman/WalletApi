import { DateTime } from "luxon";
import { Resend } from "resend";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TransactionModel, { TransactionType } from "../../models/TransactionModel";
import { ResendService } from "../ResendService";

// Mock env
vi.mock("../../configs/env", () => ({
  env: {
    RESEND_API_KEY: "test-api-key",
    RESEND_SENDER: "noreply@demowallet.com",
  },
}));

// Mock Resend
const sendMock = vi.fn();
const resendMock = {
  emails: {
    send: sendMock,
  },
} as unknown as Resend;

beforeEach(() => {
  sendMock.mockReset();
});

describe("ResendService", () => {
  const email = "test@example.com";
  const name = "Test User";
  const otp = "123456";
  const expireDate = DateTime.now().plus({ minutes: 10 });

  it("should send email verification OTP", async () => {
    sendMock.mockResolvedValue({ id: "email-id" });
    const service = new ResendService(resendMock);

    const result = await service.sendEmailVerificationOTP(email, name, otp, expireDate);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.from).toBe("noreply@demowallet.com");
    expect(call.to).toEqual([email]);
    expect(call.subject).toContain("Email Verification");
    expect(call.html).toContain(name);
    expect(call.html).toContain(otp);
    expect(result).toEqual({ id: "email-id" });
  });

  it("should send transaction receipt", async () => {
    sendMock.mockResolvedValue({ id: "receipt-id" });
    const service = new ResendService(resendMock);

    const transactionData: Pick<
      TransactionModel,
      "amount" | "currency" | "remark" | "sessionId" | "settlementDate" | "type"
    > = {
      amount: 100,
      currency: "USD",
      remark: "Test payment",
      sessionId: "sess-123",
      settlementDate: "2024-06-01",
      type: TransactionType.CREDIT,
    };

    const result = await service.sendTransactionReceipt(email, transactionData);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toContain("Bank Transfer Receipt");
    expect(call.html).toContain(transactionData.amount.toString());
    expect(call.html).toContain(transactionData.sessionId);
    expect(call.html).toContain(transactionData.remark);
    expect(call.html).toContain(transactionData.type);
    expect(result).toEqual({ id: "receipt-id" });
  });

  it("should send verification OTP", async () => {
    sendMock.mockResolvedValue({ id: "otp-id" });
    const service = new ResendService(resendMock);

    const result = await service.sendVerificationOTP(email, otp, expireDate);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toContain("Your OTP");
    expect(call.html).toContain(otp);
    expect(result).toEqual({ id: "otp-id" });
  });

  it("should send welcome email", async () => {
    sendMock.mockResolvedValue({ id: "welcome-id" });
    const service = new ResendService(resendMock);

    const result = await service.sendWelcomeEmail(email, name);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toContain("Welcome");
    expect(call.html).toContain(name);
    expect(result).toEqual({ id: "welcome-id" });
  });
});
