import ProfileModel from "./ProfileModel.js";
import UserModel from "./UserModel.js";

export default interface UserProfileModel {
  address: ProfileModel["address"];
  bvn: ProfileModel["bvn"];
  dob: ProfileModel["dob"];
  email: UserModel["email"];
  firstName: ProfileModel["firstName"];
  gender: ProfileModel["gender"];
  image: ProfileModel["image"];
  isBlacklisted: UserModel["isBlacklisted"];
  isEmailVerified: UserModel["isEmailVerified"];
  isKycVerified: UserModel["isKycVerified"];
  isTwoFactorEnabled: UserModel["isTwoFactorEnabled"];
  lastLogin: UserModel["lastLogin"];
  lastName: ProfileModel["lastName"];
  middleName: ProfileModel["middleName"];
  phone: UserModel["phone"];
  profileId: ProfileModel["id"];
  state: ProfileModel["state"];
  status: UserModel["status"];
  timezone: UserModel["timezone"];
  userId: UserModel["id"];
}
