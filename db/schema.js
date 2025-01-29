import { varchar, pgTable, date, integer, uuid, numeric } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: varchar("username").unique(),
  password: varchar("password").notNull(),
  createAt: date("createAt").notNull(),
  token: varchar("token"),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  gst: varchar("gst"),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  district: varchar("district").notNull(),
  state: varchar("state").notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  hsncode: varchar("hsncode").notNull(),
  description: varchar("description"),
});

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey(),
  invNo: varchar("invNo").notNull(),
  clientId: uuid("clientId")
    .references(() => clients.id)
    .notNull(),
  clientName: varchar("clientName").notNull(),
  gst: varchar("gst").notNull(),
  totalAmount: varchar("totalAmount").notNull(),
  date: date("date").notNull(),
  amountPaid: varchar("amountPaid").notNull(),
});

export const billItems = pgTable("billItems", {
  id: uuid("id").primaryKey(),
  billId: uuid("billId")
    .references(() => bills.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  productId: uuid("productId")
    .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: varchar("price").notNull(),
});

export const raw_material_stock = pgTable("raw_material_stock", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  quantityType: varchar("quantityType").notNull(),
  quantity: numeric("quantity").notNull(),
  rate: varchar("rate").notNull(),
});

export const productRawMaterials = pgTable("product_raw_materials", {
  id: uuid("id").primaryKey(),
  productId: uuid("productId")
    .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  rawMaterialId: uuid("rawMaterialId")
    .references(() => raw_material_stock.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  quantity: varchar("quantity").notNull(), // Quantity of raw material used in the product
});
