exports.up = (knex) =>
  knex.schema.createTable("orders", (table) => {
    table.increments("id");
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.integer("food_id");
    table.varchar("foods_order").notNullable();
    table.integer("count");
    table.enum("paymentType", ["creditCard", "pix"], {
      useNative: true,
      enumName: "typesOfPayments",
    });
    table.text("status").notNullable();
    table
      .timestamp("created_at")
      .defaultTo(
        knex.raw("(strftime('%d/%m/%Y %H:%M:%S', 'now', 'localtime'))")
      );
  });

exports.down = (knex) => knex.schema.dropTable("orders");
