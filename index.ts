import app from "./src/app";
import database from "./src/configs/database";
import { env } from "./src/configs/env";
import { gracefulShutdown } from "./src/helpers/utilities";

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
