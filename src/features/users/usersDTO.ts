import UserProfileModel from "../../models/UserProfileModel.js";

export interface ChangePasswordRequest {
  deviceId: string;
  newPassword: string;
  oldPassword: string;
}

export type GetUserResponse = UserProfileModel;
