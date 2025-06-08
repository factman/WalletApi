import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations.js";
import { passwordSchema } from "../../validations/validationSchemas.js";
import { ChangePasswordRequest, UserIdParam } from "./usersDTO.js";

export const changePasswordRequestSchema = buildStrictSchema<ChangePasswordRequest>({
  deviceId: z.string().nonempty(),
  newPassword: passwordSchema,
  oldPassword: z.string().nonempty(),
});

export const userIdParamSchema = buildStrictSchema<UserIdParam>({
  id: z.string().uuid(),
});
