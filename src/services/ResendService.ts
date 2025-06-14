import { DateTime } from "luxon";
import { Resend } from "resend";

import { env } from "../configs/env.js";
import TransactionModel from "../models/TransactionModel.js";

export class ResendService {
  private resend: Resend;

  constructor(resendInstance = new Resend(env.RESEND_API_KEY)) {
    this.resend = resendInstance;
  }

  async sendEmailVerificationOTP(email: string, name: string, otp: string, expireDate: DateTime) {
    return await this.resend.emails.send({
      from: env.RESEND_SENDER,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Demo Wallet</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF; /* Bootstrap primary color */
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verify Your Email, ${name}!</h1>
        <p>Thank you for signing up for Demo Wallet. To complete your registration, please verify your email address using the One-Time Password (OTP) below:</p>
        <p class="otp">Your OTP: <strong>${otp}</strong></p>
        <p>This OTP is valid for <strong>${expireDate.diffNow().as("minutes").toString()} minutes</strong>. Please enter it in the verification field to confirm your email address.</p>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Thank you for choosing Demo Wallet!</p>
        <p>Best regards,<br>The Demo Wallet Team</p>
        <div class="footer">
            <p>&copy; ${DateTime.now().year.toString()} Demo Wallet. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `,
      subject: "Email Verification - Demo Wallet",
      to: [email],
    });
  }

  async sendTransactionReceipt(
    email: string,
    transactionData: Pick<
      TransactionModel,
      "amount" | "currency" | "remark" | "sessionId" | "settlementDate" | "type"
    >,
  ) {
    return await this.resend.emails.send({
      from: env.RESEND_SENDER,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bank Transfer Receipt - Demo Wallet</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        h2 {
            color: #007BFF; /* Bootstrap primary color */
            text-transform: capitalize;
        }
        p {
            color: #555;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .transaction {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;
        }
        .credit {
            background-color: #e7f9ee; /* Light green background */
        }
        .debit {
            background-color: #f9e7e7; /* Light red background */
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Transaction Receipt</h1>
        <div class="transaction ${transactionData.type}">
            <h2>${transactionData.type} Transaction</h2>
            <p><strong>Amount:</strong> ${transactionData.amount}</p>
            <p><strong>Date:</strong> ${transactionData.settlementDate}</p>
            <p><strong>Session ID:</strong> ${transactionData.sessionId}</p>
            <p><strong>Description:</strong> ${transactionData.remark}</p>
        </div>
        <p>If you have any questions or concerns regarding your transactions, please feel free to contact our support team.</p>
        <p>Thank you for choosing Demo Wallet!</p>
        <p>Best regards,<br>The Demo Wallet Team</p>
        <div class="footer">
            <p>&copy; ${DateTime.now().year.toString()} Demo Wallet. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `,
      subject: "Bank Transfer Receipt - Demo Wallet",
      to: [email],
    });
  }

  async sendVerificationOTP(email: string, otp: string, expireDate: DateTime) {
    return await this.resend.emails.send({
      from: env.RESEND_SENDER,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP - Demo Wallet</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #007BFF; /* Bootstrap primary color */
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Your One-Time Password (OTP) is:</p>
        <p class="otp">${otp}</p>
        <p>This OTP is valid for <strong>${expireDate.diffNow().as("minutes").toString()} minutes</strong>. Please enter it promptly to complete your verification.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p>Thank you for using Demo Wallet!</p>
        <p>Best regards,<br>The Demo Wallet Team</p>
        <div class="footer">
            <p>&copy; ${DateTime.now().year.toString()} Demo Wallet. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `,
      subject: "Your OTP - Demo Wallet",
      to: [email],
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    return await this.resend.emails.send({
      from: env.RESEND_SENDER,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Demo Wallet</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Demo Wallet, ${name}!</h1>
        <p>We are thrilled to have you on board. Demo Wallet is designed to make managing your finances easier and more efficient.</p>
        <p>To get started, simply log in to your account and explore the features we offer. If you have any questions, feel free to reach out to our support team.</p>
        <p>Thank you for choosing Demo Wallet!</p>
        <p>Best regards,<br>The Demo Wallet Team</p>
        <div class="footer">
            <p>&copy; ${DateTime.now().year.toString()} Demo Wallet. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `,
      subject: "Welcome to Demo Wallet",
      to: [email],
    });
  }
}
