import { buildHeaderSchema } from "@/helpers/validations";
import { z } from "zod";

export function authorizationSchema(message: string) {
  return buildHeaderSchema({
    authorization: z.string({ message }).nonempty(message).startsWith("Bearer", message),
  });
}
