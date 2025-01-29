import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/connection.js";
import { billItems, bills, productRawMaterials, raw_material_stock } from "../db/schema.js";

const router = async (fastify) => {
  const pageSize = 10;

  // Get all bills with pagination
  fastify.get("/", async (request, reply) => {
    const page = parseInt(request.query.page) || 1;
    const offset = (page - 1) * pageSize;
    try {
      const result = await db.query.bills.findMany({ orderBy: [desc(bills.invNo)] });
      const total = result.length;
      const totalPages = Math.ceil(total / pageSize);

      const data = result;

      reply.send({ error: false, msg: "", data, total, totalPages });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Create a new bill
  fastify.post("/", async (request, reply) => {
    const {
      invNo,
      clientId,
      clientName,
      totalAmount,
      gst,
      billItems: bItems,
      date: bdate,
    } = request.body;
    const id = uuidv4();

    try {
      await db
        .insert(bills)
        .values({ id, invNo, clientId, clientName, gst, totalAmount, date: bdate })
        .onConflictDoNothing();

      for (const item of bItems) {
        await db.insert(billItems).values({
          id: uuidv4(),
          billId: id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });

        const rawMaterials = await db.query.productRawMaterials.findMany({
          where: eq(productRawMaterials.productId, item.productId),
        });

        for (const rawMaterial of rawMaterials) {
          const totalQuantityUsed = parseFloat((rawMaterial.quantity * item.quantity).toFixed(2));
          await db
            .update(raw_material_stock)
            .set({
              quantity: sql`${raw_material_stock.quantity} - ${totalQuantityUsed}`,
            })
            .where(eq(raw_material_stock.id, rawMaterial.rawMaterialId));
        }
      }
      reply.send({ error: false, msg: "" });
    } catch (error) {
      console.log("Error:", error);
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Get bills by client id
  fastify.get("/client/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await db.query.bills.findMany({
        where: eq(bills.clientId, id),
        orderBy: [desc(bills.date)],
      });
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Get bill detail by id
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params;
    console.log(id);
    try {
      const [bill, items] = await Promise.all([
        db.query.bills.findFirst({
          where: eq(bills.id, id),
        }),
        db.query.billItems.findMany({
          where: eq(billItems.billId, id),
        }),
      ]);
      const result = { bill_detail: { ...bill }, bill_items: [...items] };
      reply.send({ error: false, msg: "", data: result });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Update bill status
  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params;
    const { amountPaid } = request.body;
    try {
      await db.update(bills).set({ amountPaid }).where(eq(bills.id, id));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });

  // Delete bills
  fastify.delete("/", async (request, reply) => {
    const { ids } = request.body;
    try {
      await db.delete(bills).where(inArray(bills.id, ids));
      reply.send({ error: false, msg: "" });
    } catch (error) {
      reply.send({ error: true, msg: error.toString() });
    }
  });
};

export default router;
