import { buildServer } from "./server.js";

const port = Number(process.env.PORT ?? 4010);
const host = process.env.HOST ?? "127.0.0.1";
const server = buildServer();

const close = async () => {
  await server.close();
};

process.once("SIGINT", () => {
  void close().finally(() => process.exit(0));
});

process.once("SIGTERM", () => {
  void close().finally(() => process.exit(0));
});

await server.listen({ host, port });
server.log.info(`Backend API listening on http://${host}:${port}`);
