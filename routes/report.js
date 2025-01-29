import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/connection.js";
import { billItems, bills, clients, products } from "../db/schema.js";

const router = async (fastify) => {
  // B2B Report
  fastify.get("/b2b", async (request, reply) => {
    const { year, month } = request.query;
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10);
      const result = await db
        .select({
          id: bills.id,
          invNo: bills.invNo,
          date: bills.date,
          gstNo: clients.gst,
          clientName: clients.name,
          gst: bills.gst,
          totalAmount: bills.totalAmount,
        })
        .from(bills)
        .where(
          and(
            sql`EXTRACT(YEAR FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${yearInt}`,
            sql`EXTRACT(MONTH FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${monthInt}`,
            sql`LENGTH(${clients.gst}) = 15`
          )
        )
        .leftJoin(clients, eq(clients.id, bills.clientId))
        .orderBy(desc(bills.date));

      const resultMap = new Map(result.map((item) => [item.id, item]));
      for (const bill of result) {
        let billsTotal = 0;
        const items = await db.query.billItems.findMany({
          where: eq(billItems.billId, bill.id),
        });
        items.forEach((item) => {
          billsTotal += item.price * item.quantity;
        });
        const matchingBill = resultMap.get(bill.id);
        if (matchingBill) {
          matchingBill.taxableAmount = billsTotal;
        }
      }
      reply.send({ error: false, msg: "", data: result });
    } catch (err) {
      reply.send({ error: true, msg: err.toString() });
    }
  });

  // B2C Report
  fastify.get("/b2c", async (request, reply) => {
    const { year, month } = request.query;
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10);
      const result = await db
        .select({
          id: bills.id,
          invNo: bills.invNo,
          date: bills.date,
          gstNo: clients.gst,
          clientName: clients.name,
          gst: bills.gst,
          totalAmount: bills.totalAmount,
        })
        .from(bills)
        .where(
          and(
            sql`EXTRACT(YEAR FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${yearInt}`,
            sql`EXTRACT(MONTH FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${monthInt}`,
            sql`LENGTH(${clients.gst}) != 15`
          )
        )
        .leftJoin(clients, eq(clients.id, bills.clientId))
        .orderBy(desc(bills.date));

      const reqBills = result.map((item) => ({ id: item.id, gst: item.gst }));
      const rs = {
        taxableValue: 0,
        tax_cgst: 0,
        tax_sgst: 0,
      };
      for (const bill of reqBills) {
        const items = await db.query.billItems.findMany({
          where: eq(billItems.billId, bill.id),
        });
        const mltx = bill.gst === "12" ? 0.06 : 0.09;
        const billTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        rs.taxableValue += billTotal;
        rs.tax_cgst += billTotal * mltx;
        rs.tax_sgst += billTotal * mltx;
      }

      reply.send({ error: false, msg: "", data: rs });
    } catch (err) {
      reply.send({ error: true, msg: err.toString() });
    }
  });

  // HSN Code Report
  fastify.get("/hsncode", async (request, reply) => {
    const { year, month } = request.query;
    try {
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10);

      const result = await db
        .select({
          id: bills.id,
          invNo: bills.invNo,
          date: bills.date,
          gstNo: clients.gst,
          clientName: clients.name,
          gst: bills.gst,
          totalAmount: bills.totalAmount,
        })
        .from(bills)
        .where(
          and(
            sql`EXTRACT(YEAR FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${yearInt}`,
            sql`EXTRACT(MONTH FROM to_timestamp(${bills.date}, 'Dy Mon DD YYYY HH24:MI:SS GMT')) = ${monthInt}`
          )
        )
        .leftJoin(clients, eq(clients.id, bills.clientId))
        .orderBy(desc(bills.date));

      const hsncodebreakdown = {};
      const reqBills = result.map((item) => ({ id: item.id, gst: item.gst, invNo: item.invNo }));
      for (const bill of reqBills) {
        const items = await db
          .select({
            hsncode: products.hsncode,
            quantity: billItems.quantity,
            price: billItems.price,
          })
          .from(billItems)
          .leftJoin(products, eq(billItems.productId, products.id))
          .where(eq(billItems.billId, bill.id));
        const mltx = bill.gst === "12" ? 0.06 : 0.09;
        for (const item of items) {
          if (item.hsncode in hsncodebreakdown) {
            hsncodebreakdown[item.hsncode].quantity += item.quantity;
            hsncodebreakdown[item.hsncode].total += item.price * item.quantity;
          } else {
            hsncodebreakdown[item.hsncode] = {
              total: item.price * item.quantity,
              quantity: item.quantity,
            };
          }
        }
        const hsncodes = Object.keys(hsncodebreakdown);
        for (const hsncode of hsncodes) {
          hsncodebreakdown[hsncode].tax = hsncodebreakdown[hsncode].total * mltx;
        }
      }

      reply.send({ error: false, msg: "", data: hsncodebreakdown });
    } catch (err) {
      reply.send({ error: true, msg: err.toString() });
    }
  });
};

export default router;
