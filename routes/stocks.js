import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection.js";
import { raw_material_stock } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = async (fastify) => {
  // Get all raw materials
  fastify.get("/raw-material-stock", async (request, reply) => {
    try {
      const result = await db.query.raw_material_stock.findMany();
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Create a new raw material
  fastify.post("/raw-material-stock", async (request, reply) => {
    const { name, quantity, quantityType, rate } = request.body;
    const id = uuidv4();
    try {
      await db
        .insert(raw_material_stock)
        .values({ id, name, quantityType, quantity, rate })
        .onConflictDoNothing();
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Update a raw material
  fastify.put("/raw-material-stock/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      await db
        .update(raw_material_stock)
        .set({ ...request.body })
        .where(eq(raw_material_stock.id, id));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });
};

export default router;
