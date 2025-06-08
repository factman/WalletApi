import UserModel from "../../models/UserModel.js";
import UserProfileModel from "../../models/UserProfileModel.js";

export interface ChangePasswordRequest {
  deviceId: string;
  newPassword: string;
  oldPassword: string;
}

export type GetUserResponse = UserProfileModel;

export interface UserIdParam {
  id: UserModel["id"];
}
