import { env } from "@/configs/env";
import { successResponse } from "@/helpers/responseHandlers";
import { Router } from "express";
import packageJson from "../../package.json";

export function appRouter() {
  const router = Router();

  router.get("/", (req, res) => {
    successResponse(
      res,
      {
        appName: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        environment: env.NODE_ENV,
        port: env.PORT,
        apiUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        author: packageJson.author,
        license: packageJson.license,
        repository: packageJson.repository,
      },
      "Welcome to the API!",
    );
  });

  // Add other routes here
  // Example: router.use("/auth", authRouter());

  return router;
}
