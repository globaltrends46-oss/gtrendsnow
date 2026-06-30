/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("vip_customers");

  const existing = collection.fields.getByName("auto_renewal");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("auto_renewal"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "auto_renewal",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("vip_customers");
    collection.fields.removeByName("auto_renewal");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})