import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { StatusCodes } from "http-status-codes";
import database from "./configs/database";
import { env } from "./configs/env";
import { errorResponse } from "./helpers/responseHandlers";
import { gracefulShutdown } from "./helpers/utilities";
import { appRouter } from "./router";

const app = express();

// Express configuration settings
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(
  cors({
    origin: "*", // Allow all origins
  }),
);
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));

// Application routes
app.use(appRouter());

// 404 and error handling middleware
app.use((req, res, _: NextFunction) => {
  console.error(`${req.method}: ${req.url} - Not Found`);
  errorResponse(res, StatusCodes.NOT_FOUND);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  console.error(`${req.method}: ${req.url} - Error(${err.name}): ${err.message}`);
  console.error(err.stack);
  errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, null, "Something went wrong: Internal Server Error");
});

// Start the server
const server = app.listen(env.PORT, () => {
  console.log(`
======================================
  🚀 Server started successfully! 🚀
  🌟 API is running on port: ${env.PORT.toString()} 🌟
======================================
`);
});

// Graceful shutdown
gracefulShutdown(server, async () => {
  console.log("Cleaning up resources before shutdown...");
  await database.destroy();
  console.log("Database connection closed.");
});

// Export the app for testing or further configuration
export default app;
