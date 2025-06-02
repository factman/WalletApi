import { Server } from "node:http";

export function gracefulShutdown(server: Server, cleanUp?: () => Promise<void>) {
  const listener: NodeJS.SignalsListener = () => {
    server.close((err) => {
      if (!err) {
        console.log("Server closed successfully");
      } else {
        console.log("Error closing server:", err.name, err.message);
      }
    });

    console.log("Graceful shutdown initiated. Exiting process...");
    process.exitCode = 0; // Set exit code to 0 to indicate success

    if (cleanUp)
      cleanUp()
        .then(() => {
          console.log("Cleanup completed successfully.");
        })
        .catch(() => {
          console.error("Error during cleanup.");
        });
  };

  process.on("SIGINT", listener);
  process.on("SIGTERM", listener);
}
