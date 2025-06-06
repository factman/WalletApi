import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";

import { errorResponse } from "./helpers/responseHandlers.js";
import { appRouter } from "./router/index.js";

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
app.use("/api", appRouter());

// 404 and error handling middleware
app.use((req, res, _: NextFunction) => {
  console.error(`${req.method}: ${req.url} - Not Found`);
  errorResponse(res, StatusCodes.NOT_FOUND);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  console.error(`${req.method}: ${req.url} - Error(${err.name}): ${err.message}`);
  console.error(err.stack);
  errorResponse(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    null,
    "Something went wrong: Internal Server Error",
  );
});

// Export the app for testing or further configuration
export default app;
