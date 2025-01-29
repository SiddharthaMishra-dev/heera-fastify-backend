import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyFormbody from "@fastify/formbody";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import clientRoutes from "./routes/clients.js";
import productRoutes from "./routes/products.js";
import billRoutes from "./routes/bills.js";
import stockRoutes from "./routes/stocks.js";
import reportRoutes from "./routes/report.js";
import { authenticationMiddleware } from "./middleware.js";

dotenv.config();

const fastify = Fastify();

fastify.register(cors);
fastify.register(fastifyFormbody);

fastify.register(userRoutes, { prefix: "/users" });
fastify.register(clientRoutes, {
  prefix: "/api/clients",
  preHandler: authenticationMiddleware,
});
fastify.register(productRoutes, {
  prefix: "/api/products",
  preHandler: authenticationMiddleware,
});
fastify.register(billRoutes, {
  prefix: "/api/bills",
  preHandler: authenticationMiddleware,
});
fastify.register(stockRoutes, {
  prefix: "/api/stocks",
  preHandler: authenticationMiddleware,
});
fastify.register(reportRoutes, {
  prefix: "/api/reports",
  preHandler: authenticationMiddleware,
});

try {
  await fastify.listen({ port: process.env.PORT, host: "0.0.0.0" });
  console.log(`Server listening on ${fastify.server.address().port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
