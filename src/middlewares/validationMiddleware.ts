import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { errorResponse } from "../helpers/responseHandlers.js";
import { SchemaType, ValidationError } from "../helpers/types.js";

export function validateRequest(
  schema: SchemaType,
  dataPath: "body" | "headers" | "params" | "query",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    const { error, success } = schema.safeParse(req[dataPath]);

    if (!success) {
      error.errors.forEach((errorItem) => {
        errors.push({
          entity: dataPath,
          message: errorItem.message,
          path: errorItem.path.join("."),
        });
      });

      errorResponse(res, StatusCodes.BAD_REQUEST, errors, "Validation Error");
    } else {
      next();
    }
  };
}
