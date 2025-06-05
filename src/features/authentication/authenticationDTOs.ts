import AuthenticatedUserModel from "@/models/AuthenticatedUserModel";

export interface ForgotPasswordRequest {
  deviceId: string;
  email: string;
}

export interface ForgotPasswordResponse {
  otpExpiresAt: number;
  otpMessage: string;
  verificationToken: string;
}

export interface InitiateAuthenticationRequest {
  deviceId: string;
  email: string;
  password: string;
}

export interface InitiateAuthenticationResponse {
  email: string;
  otpExpiresAt: number;
  otpMessage: string;
  verificationToken: string;
}

export interface InitiateBvnVerificationRequest {
  bvn: string;
  dob: string;
  firstName: string;
  gender: string;
  lastName: string;
}

export interface InitiateBvnVerificationResponse {
  otpExpiresAt: number;
  otpMessage: string;
  verificationToken: string;
}

export interface LoginRequest {
  deviceId: string;
  otp: string;
  verificationToken: string;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
  userData: Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">;
}

export interface LogoutRequest {
  userId: string;
}

export interface RefreshTokenRequest {
  deviceId: string;
  refreshToken: string;
  userId: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
  userData: Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">;
}

export interface ResendEmailVerificationRequest {
  email: string;
}

export interface ResendEmailVerificationResponse {
  email: string;
  otpExpiresAt: number;
  otpMessage: string;
  verificationToken: string;
}

export interface ResetPasswordRequest {
  deviceId: string;
  newPassword: string;
  oldPassword: string;
  verificationToken: string;
}

export interface SignupRequest {
  deviceId: string;
  email: string;
  password: string;
  phone: string;
  timezone: string;
}

export interface SignupResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  otpExpiresAt: number;
  otpMessage: string;
  userData: Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">;
  verificationToken: string;
}

export interface UpdatePasswordRequest {
  deviceId: string;
  newPassword: string;
  oldPassword: string;
}

export interface VerifyBvnRequest {
  otp: string;
  verificationToken: string;
}

export interface VerifyBvnResponse {
  userData: Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">;
}

export interface VerifyEmailRequest {
  otp: string;
  verificationToken: string;
}

export interface VerifyEmailResponse {
  userData: Omit<AuthenticatedUserModel, "sessionExpiresAt" | "sessionId">;
}

export interface VerifyForgotPasswordRequest {
  otp: string;
  verificationToken: string;
}
