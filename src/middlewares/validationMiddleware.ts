import { errorResponse } from "@/helpers/responseHandlers";
import { SchemaType, ValidationError } from "@/helpers/types";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function validateRequest(schema: SchemaType, dataPath: "query" | "body" | "params" | "headers") {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    const { success, error } = schema.safeParse(req[dataPath]);

    if (!success) {
      error.errors.forEach((errorItem) => {
        errors.push({
          message: errorItem.message,
          path: errorItem.path.join("."),
          entity: dataPath,
        });
      });

      return errorResponse(res, StatusCodes.BAD_REQUEST, errors, "Validation Error");
    }

    next();
  };
}
