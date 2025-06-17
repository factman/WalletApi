import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations";
import { passwordSchema } from "../../validations/validationSchemas";
import { ChangePasswordRequest } from "./usersDTO";

export const changePasswordRequestSchema = buildStrictSchema<ChangePasswordRequest>({
  deviceId: z.string().nonempty(),
  newPassword: passwordSchema,
  oldPassword: z.string().nonempty(),
});
