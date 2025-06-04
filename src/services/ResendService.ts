import { DateTime } from "luxon";
import { Resend } from "resend";

import { env } from "@/configs/env";

export class ResendService {
  private resend: Resend;

  constructor(resendInstance = new Resend(env.RESEND_API_KEY)) {
    this.resend = resendInstance;
  }

  async sendEmailVerificationOTP(email: string, name: string, otp: string, expireDate: DateTime) {
    return await this.resend.emails.send({
      from: env.RESEND_SENDER,
      html: ``,
      subject: `
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
