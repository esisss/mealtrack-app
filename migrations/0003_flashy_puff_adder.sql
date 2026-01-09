CREATE TABLE "meal_consumptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_plan_entry_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"consumed_at" timestamp with time zone DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "consumption_events" RENAME COLUMN "meal_plan_entry_id" TO "meal_consumption_id";--> statement-breakpoint
CREATE INDEX "meal_consumption_user_time_idx" ON "meal_consumptions" USING btree ("user_id","consumed_at");--> statement-breakpoint
CREATE INDEX "meal_consumption_entry_idx" ON "meal_consumptions" USING btree ("meal_plan_entry_id");--> statement-breakpoint
CREATE INDEX "consumption_meal_idx" ON "consumption_events" USING btree ("meal_consumption_id");--> statement-breakpoint
ALTER TABLE "consumption_events" DROP COLUMN "meta";