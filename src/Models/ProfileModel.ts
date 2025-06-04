export enum ProfileTableColumns {
  ADDRESS = "address",
  BVN = "bvn",
  BVN_EMAIL = "bvn_email",
  BVN_METADATA = "bvnMetadata",
  BVN_PHONE = "bvn_phone",
  CREATED_AT = "createdAt",
  DOB = "dob",
  FIRST_NAME = "firstName",
  GENDER = "gender",
  ID = "id",
  IMAGE = "image",
  LAST_NAME = "lastName",
  MIDDLE_NAME = "middleName",
  STATE = "state",
  UPDATED_AT = "updatedAt",
  USER_ID = "userId",
}

export default interface ProfileModel {
  address: string;
  bvn: string;
  bvn_email: string;
  bvn_phone: string;
  bvnMetadata: Record<string, unknown>;
  createdAt: string;
  dob: string;
  firstName: string;
  gender: string;
  id: string;
  image: string;
  lastName: string;
  middleName: null | string;
  state: string;
  updatedAt: string;
  userId: string;
}
