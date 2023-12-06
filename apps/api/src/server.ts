import http, { Server } from "http";
import envConfig from "./configs/envConfig";
import logger from "./configs/logger";
import { HttpServer } from "./core";
import { dbConnection } from "./db/dbConnection";

let server: Server 
dbConnection().then((isDbConnected) => {
  if (isDbConnected) {
    const app = HttpServer.create();
    server = http.createServer(app);
    server.listen(envConfig.SERVER_PORT, () => console.log(`🚀 Server is live at http://localhost:${envConfig.SERVER_PORT}`));
  }
  else {
    throw new Error("Database not connected.")
  };
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed.');
      process.exit(1);
    });
  }
  else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
      server.close();
  }
});