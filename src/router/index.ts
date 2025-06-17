import { Router } from "express";

import packageJson from "../../package.json";
import { env } from "../configs/env";
import { authenticationRouter } from "../features/authentication/index";
import { transactionRouter } from "../features/transactions/index";
import { usersRouter } from "../features/users/index";
import { walletsRouter } from "../features/wallets/index";
import { successResponse } from "../helpers/responseHandlers";

export function appRouter() {
  return (
    Router()
      .get("/", (req, res) => {
        successResponse(
          res,
          {
            apiUrl: `${req.protocol}://${req.get("host") ?? ""}${req.originalUrl}`,
            appName: packageJson.name,
            author: packageJson.author,
            description: packageJson.description,
            environment: env.NODE_ENV,
            license: packageJson.license,
            port: env.PORT,
            repository: packageJson.repository,
            version: packageJson.version,
          },
          "Welcome to the API!",
        );
      })
      // Add other routes here
      .use("/auth", authenticationRouter)
      .use("/users", usersRouter)
      .use("/wallets", walletsRouter)
      .use("/transactions", transactionRouter)
  );
}
