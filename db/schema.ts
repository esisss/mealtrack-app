import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  date,
  timestamp,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const baseUnit = pgEnum("base_unit", ["g", "ml", "unit"]);
export const mealType = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);
export const cycleStatus = pgEnum("cycle_status", [
  "planning",
  "active",
  "closed",
]);
export const listItemStatus = pgEnum("list_item_status", [
  "pending",
  "bought",
  "skipped",
]);

export const pantryItems = pgTable(
  "pantry_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(), // FK lógica a Neon Auth
    name: varchar("name", { length: 160 }).notNull(),
    baseUnit: baseUnit("base_unit").notNull(), // g | ml | unit
    // conversiones opcionales por ingrediente (no globales)
    unitToGrams: numeric("unit_to_grams"), // 1 unidad ≈ X g
    unitToMl: numeric("unit_to_ml"), // 1 unidad ≈ X ml
    kcalPerBaseUnit: numeric("kcal_per_base_unit"),
    defaultPkgQty: numeric("default_pkg_qty"), // ej. 1000 (g), 6 (unit)
    defaultPkgPrice: numeric("default_pkg_price"), // precio de referencia
    tags: jsonb("tags").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("pantry_user_name_uq").on(t.userId, t.name),
    index("pantry_user_idx").on(t.userId),
  ]
);
export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("recipe_user_name_idx").on(t.userId, t.name)]
);

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipeId: uuid("recipe_id").notNull(),
    pantryItemId: uuid("pantry_item_id").notNull(),
    qtyPerServing: numeric("qty_per_serving").notNull(), // en baseUnit del pantry_item
    notes: varchar("notes", { length: 200 }),
  },
  (t) => [uniqueIndex("recipe_item_uq").on(t.recipeId, t.pantryItemId)]
);
export const mealCycles = pgTable(
  "meal_cycles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: cycleStatus("status").notNull().default("planning"),
    budgetPlanned: numeric("budget_planned"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("cycle_user_dates_idx").on(t.userId, t.startDate, t.endDate)]
);

export const mealPlanEntries = pgTable(
  "meal_plan_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: uuid("cycle_id").notNull(),
    day: date("day").notNull(),
    mealType: mealType("meal_type").notNull(),
    recipeId: uuid("recipe_id").notNull(),
    servings: numeric("servings").notNull().default("1"),
    done: boolean("done").notNull().default(false),
  },
  (t) => [index("plan_cycle_day_idx").on(t.cycleId, t.day)]
);

export const shoppingLists = pgTable("shopping_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  cycleId: uuid("cycle_id").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
});

export const shoppingListItems = pgTable(
  "shopping_list_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id").notNull(),
    pantryItemId: uuid("pantry_item_id").notNull(),
    requiredQty: numeric("required_qty").notNull(), // total requerido para el ciclo
    onHandQty: numeric("on_hand_qty").notNull().default("0"),
    toBuyQty: numeric("to_buy_qty").notNull().default("0"),
    estUnitPrice: numeric("est_unit_price"),
    estTotal: numeric("est_total"),
    status: listItemStatus("status").notNull().default("pending"),
  },
  (t) => [uniqueIndex("list_item_uq").on(t.listId, t.pantryItemId)]
);
export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    vendor: varchar("vendor", { length: 160 }),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).defaultNow(),
    total: numeric("total"),
    currency: varchar("currency", { length: 8 }).default("ARS"),
    meta: jsonb("meta"),
  },
  (t) => [index("purchase_user_date_idx").on(t.userId, t.purchasedAt)]
);

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaseId: uuid("purchase_id").notNull(),
    pantryItemId: uuid("pantry_item_id").notNull(),
    qty: numeric("qty").notNull(), // en baseUnit del pantry_item
    unitPrice: numeric("unit_price"), // por baseUnit
    totalPrice: numeric("total_price"),
  },
  (t) => [index("purchase_items_purchase_idx").on(t.purchaseId)]
);

export const stockLots = pgTable(
  "stock_lots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    pantryItemId: uuid("pantry_item_id").notNull(),
    purchaseItemId: uuid("purchase_item_id"),
    acquiredAt: timestamp("acquired_at", { withTimezone: true }).defaultNow(),
    expiresAt: date("expires_at"),
    qtyInitial: numeric("qty_initial").notNull(),
    qtyRemaining: numeric("qty_remaining").notNull(),
  },
  (t) => [
    index("stock_user_item_idx").on(t.userId, t.pantryItemId),
    index("stock_expiry_idx").on(t.expiresAt),
  ]
);

export const consumptionEvents = pgTable(
  "consumption_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    pantryItemId: uuid("pantry_item_id").notNull(),
    qty: numeric("qty").notNull(), // en baseUnit
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
    mealPlanEntryId: uuid("meal_plan_entry_id"),
    meta: jsonb("meta"),
  },
  (t) => [index("consumption_user_time_idx").on(t.userId, t.occurredAt)]
);
export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const pantryRelations = relations(pantryItems, ({ many }) => ({
  recipeUses: many(recipeIngredients),
}));

export const cyclesRelations = relations(mealCycles, ({ many }) => ({
  entries: many(mealPlanEntries),
}));
