import { z } from "zod";

import { buildHeaderSchema } from "@/helpers/validations";

export function authorizationSchema(message: string) {
  return buildHeaderSchema({
    authorization: z.string({ message }).nonempty(message).startsWith("Bearer", message),
  });
}
