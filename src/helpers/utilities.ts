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

    if (cleanUp) await cleanUp();

    console.log("Graceful shutdown initiated. Exiting process...");
    process.exitCode = 0; // Set exit code to 0 to indicate success
  };

  process.on("SIGINT", listener);
  process.on("SIGTERM", listener);
}
