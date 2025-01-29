import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection.js";
import { productRawMaterials, products, raw_material_stock } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = async (fastify) => {
  // Get all products
  fastify.get("/", async (request, reply) => {
    try {
      const result = await db.query.products.findMany();
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Create a new product
  fastify.post("/", async (request, reply) => {
    const { name, hsncode, description } = request.body;
    const id = uuidv4();

    try {
      await db.insert(products).values({ id, name, hsncode, description }).onConflictDoNothing();
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Send product raw materials
  fastify.get("/raw-material/:productId", async (request, reply) => {
    const { productId } = request.params;
    try {
      const result = await db
        .select({
          rawMaterialId: productRawMaterials.rawMaterialId,
          quantity: productRawMaterials.quantity,
          name: raw_material_stock.name,
        })
        .from(productRawMaterials)
        .where(eq(productRawMaterials.productId, productId))
        .leftJoin(raw_material_stock, eq(productRawMaterials.rawMaterialId, raw_material_stock.id));
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Create raw materials for a product
  fastify.post("/raw-material", async (request, reply) => {
    const { items } = request.body;
    try {
      for (const item of items) {
        await db.insert(productRawMaterials).values({
          id: uuidv4(),
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
        });
      }
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Delete a product
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      await db.delete(products).where(eq(products.id, id));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });
};

export default router;
