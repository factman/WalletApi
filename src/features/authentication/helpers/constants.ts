export enum AUTHENTICATION_ROUTES {
  DELETE_LOGOUT = "/logout",
  PATCH_RESEND_EMAIL_VERIFICATION = "/resend-email-verification",
  PATCH_VERIFY_EMAIL = "/verify-email",
  PATCH_VERIFY_FORGOT_PASSWORD = "/verify-forgot-password",
  POST_FORGOT_PASSWORD = "/forgot-password",
  POST_INITIATE_AUTH = "/initiate-auth",
  POST_INITIATE_BVN_VERIFICATION = "/initiate-bvn-verification",
  POST_LOGIN = "/login",
  POST_REFRESH_TOKEN = "/refresh-token",
  POST_SIGNUP = "/signup",
  PUT_RESET_PASSWORD = "/reset-password",
  PUT_VERIFY_BVN = "/verify-bvn",
}
