import { Router } from "express";

import packageJson from "../../package.json" with { type: "json" };
import { env } from "../configs/env.js";
import { authenticationRouter } from "../features/authentication/index.js";
import { transactionRouter } from "../features/transactions/index.js";
import { usersRouter } from "../features/users/index.js";
import { walletsRouter } from "../features/wallets/index.js";
import { successResponse } from "../helpers/responseHandlers.js";

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
