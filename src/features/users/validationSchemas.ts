import { z } from "zod";

import { buildStrictSchema } from "../../helpers/validations.js";
import { passwordSchema } from "../../validations/validationSchemas.js";
import { ChangePasswordRequest } from "./usersDTO.js";

export const changePasswordRequestSchema = buildStrictSchema<ChangePasswordRequest>({
  deviceId: z.string().nonempty(),
  newPassword: passwordSchema,
  oldPassword: z.string().nonempty(),
});
