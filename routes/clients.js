import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection.js";
import { clients } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = async (fastify) => {
  // Get all clients
  fastify.get("/", async (request, reply) => {
    try {
      const result = await db.query.clients.findMany();
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Get Client by ID
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await db.query.clients.findFirst({
        where: eq(clients.id, id),
      });
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Create a new client
  fastify.post("/", async (request, reply) => {
    const { name, gst, address, city, district, state } = request.body;
    const id = uuidv4();

    try {
      await db
        .insert(clients)
        .values({ id, name, gst, address, city, district, state })
        .onConflictDoNothing();
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Update a client
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params;
    const { name, gst, address, city, district, state } = request.body;
    try {
      await db
        .update(clients)
        .set({ name, gst, address, city, district, state })
        .where(eq(clients.id, id));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Delete a client
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      await db.delete(clients).where(eq(clients.id, id));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });
};

export default router;
