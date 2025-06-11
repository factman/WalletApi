import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import { Server } from "node:http";

export function generateSessionId() {
  const institutionCode = "000000";
  const dateTime = DateTime.now().toFormat("yyLLddHHmmss");
  const serial = Date.now().toString().slice(-6);
  const random = Math.random().toString().slice(-6);
  return `${institutionCode}${dateTime}${serial}${random}`;
}

export function getPaginationOffset(page: number, limit: number) {
  return (page - 1) * limit;
}

export function getPaginationTotalPages(total: number, limit: number) {
  return Math.ceil(total / limit);
}

export function gracefulShutdown(server: Server, cleanUp?: () => Promise<void>) {
  const listener = async () => {
    server.close((err) => {
      if (!err) {
        console.log("Server closed successfully");
      } else {
        console.log("Error closing server:", err.name, err.message);
      }
    });

    console.log("Graceful shutdown initiated. Exiting process...");

    if (cleanUp) await cleanUp();

    process.exitCode = 0; // Set exit code to 0 to indicate success
  };

  process.on("SIGINT", listener as never);
  process.on("SIGTERM", listener as never);
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function hashPin(pin: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(pin, salt);
}
