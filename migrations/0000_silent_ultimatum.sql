CREATE TYPE "public"."base_unit" AS ENUM('g', 'ml', 'unit', 'cups', 'tbsp', 'tsp');--> statement-breakpoint
CREATE TYPE "public"."cycle_status" AS ENUM('planning', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."list_item_status" AS ENUM('pending', 'bought', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TABLE "consumption_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pantry_item_id" uuid NOT NULL,
	"qty" numeric NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now(),
	"meal_consumption_id" uuid
);
--> statement-breakpoint
CREATE TABLE "meal_consumptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_plan_entry_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"consumed_at" timestamp with time zone DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "meal_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "cycle_status" DEFAULT 'planning' NOT NULL,
	"budget_planned" numeric,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meal_plan_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"day" date NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"recipe_id" uuid NOT NULL,
	"servings" numeric DEFAULT '1' NOT NULL,
	"done" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pantry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"base_unit" "base_unit" NOT NULL,
	"fixed_buy_qty" numeric,
	"unit_to_grams" numeric,
	"unit_to_ml" numeric,
	"kcal_per_base_unit" numeric,
	"default_pkg_qty" numeric,
	"default_pkg_price" numeric,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchase_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"pantry_item_id" uuid NOT NULL,
	"qty" numeric NOT NULL,
	"unit_price" numeric,
	"total_price" numeric
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vendor" varchar(160),
	"purchased_at" timestamp with time zone DEFAULT now(),
	"total" numeric,
	"currency" varchar(8) DEFAULT 'ARS',
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"pantry_item_id" uuid NOT NULL,
	"qty_per_serving" numeric NOT NULL,
	"notes" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"notes" text,
	"image_url" varchar,
	"public_image_id" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopping_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"pantry_item_id" uuid NOT NULL,
	"required_qty" numeric NOT NULL,
	"on_hand_qty" numeric DEFAULT '0' NOT NULL,
	"to_buy_qty" numeric DEFAULT '0' NOT NULL,
	"est_unit_price" numeric,
	"est_total" numeric,
	"status" "list_item_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shopping_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pantry_item_id" uuid NOT NULL,
	"purchase_item_id" uuid,
	"acquired_at" timestamp with time zone DEFAULT now(),
	"expires_at" date,
	"qty_initial" numeric NOT NULL,
	"qty_remaining" numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX "consumption_user_time_idx" ON "consumption_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "consumption_meal_idx" ON "consumption_events" USING btree ("meal_consumption_id");--> statement-breakpoint
CREATE INDEX "meal_consumption_user_time_idx" ON "meal_consumptions" USING btree ("user_id","consumed_at");--> statement-breakpoint
CREATE INDEX "meal_consumption_entry_idx" ON "meal_consumptions" USING btree ("meal_plan_entry_id");--> statement-breakpoint
CREATE INDEX "cycle_user_dates_idx" ON "meal_cycles" USING btree ("user_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "plan_cycle_day_idx" ON "meal_plan_entries" USING btree ("cycle_id","day");--> statement-breakpoint
CREATE UNIQUE INDEX "pantry_user_name_uq" ON "pantry_items" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "pantry_user_idx" ON "pantry_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchase_items_purchase_idx" ON "purchase_items" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "purchase_user_date_idx" ON "purchases" USING btree ("user_id","purchased_at");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_item_uq" ON "recipe_ingredients" USING btree ("recipe_id","pantry_item_id");--> statement-breakpoint
CREATE INDEX "recipe_user_name_idx" ON "recipes" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "list_item_uq" ON "shopping_list_items" USING btree ("list_id","pantry_item_id");--> statement-breakpoint
CREATE INDEX "stock_user_item_idx" ON "stock_lots" USING btree ("user_id","pantry_item_id");--> statement-breakpoint
CREATE INDEX "stock_expiry_idx" ON "stock_lots" USING btree ("expires_at");