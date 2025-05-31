import ProfileModel from "./ProfileModel";
import UserModel from "./UserModel";

export enum UserProfileViewColumns {
  ADDRESS = "address",
  BVN = "bvn",
  DOB = "dob",
  EMAIL = "email",
  FIRST_NAME = "firstName",
  GENDER = "gender",
  IMAGE = "image",
  IS_BLACKLISTED = "isBlacklisted",
  IS_EMAIL_VERIFIED = "isEmailVerified",
  IS_KYC_VERIFIED = "isKycVerified",
  IS_TWO_FACTOR_ENABLED = "isTwoFactorEnabled",
  LAST_LOGIN = "lastLogin",
  LAST_NAME = "lastName",
  MIDDLE_NAME = "middleName",
  PHONE = "phone",
  PROFILE_ID = "profileId",
  STATE = "state",
  STATUS = "status",
  TIMEZONE = "timezone",
  USER_ID = "userId",
}

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
