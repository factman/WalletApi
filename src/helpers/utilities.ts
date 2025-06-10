import bcrypt from "bcryptjs";
import { Server } from "node:http";

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
