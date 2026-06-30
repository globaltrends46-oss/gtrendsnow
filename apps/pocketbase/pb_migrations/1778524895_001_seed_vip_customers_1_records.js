/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("vip_customers");

  const record0 = new Record(collection);
    record0.set("email", "ram25108@gmail.com");
    record0.set("status", "active");
    record0.set("purchase_date", "2026-05-11");
    record0.set("expiration_date", "2026-06-10");
    record0.set("auto_renewal", false);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})