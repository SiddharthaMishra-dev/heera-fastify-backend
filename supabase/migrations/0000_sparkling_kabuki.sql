CREATE TABLE "billItems" (
	"id" uuid PRIMARY KEY NOT NULL,
	"billId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY NOT NULL,
	"invNo" varchar NOT NULL,
	"clientId" uuid NOT NULL,
	"clientName" varchar NOT NULL,
	"gst" varchar NOT NULL,
	"totalAmount" varchar NOT NULL,
	"date" date NOT NULL,
	"amountPaid" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"gst" varchar,
	"address" varchar NOT NULL,
	"city" varchar NOT NULL,
	"district" varchar NOT NULL,
	"state" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_raw_materials" (
	"id" uuid PRIMARY KEY NOT NULL,
	"productId" uuid NOT NULL,
	"rawMaterialId" uuid NOT NULL,
	"quantity" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"hsncode" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "raw_material_stock" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"quantityType" varchar NOT NULL,
	"quantity" numeric NOT NULL,
	"rate" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar,
	"password" varchar NOT NULL,
	"createAt" date NOT NULL,
	"token" varchar,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "billItems" ADD CONSTRAINT "billItems_billId_bills_id_fk" FOREIGN KEY ("billId") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "billItems" ADD CONSTRAINT "billItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_raw_materials" ADD CONSTRAINT "product_raw_materials_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_raw_materials" ADD CONSTRAINT "product_raw_materials_rawMaterialId_raw_material_stock_id_fk" FOREIGN KEY ("rawMaterialId") REFERENCES "public"."raw_material_stock"("id") ON DELETE cascade ON UPDATE cascade;