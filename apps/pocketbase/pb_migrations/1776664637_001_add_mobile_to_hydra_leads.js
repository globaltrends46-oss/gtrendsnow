/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("hydra_leads");

  const existing = collection.fields.getByName("mobile");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("mobile"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "mobile",
    required: true,
    pattern: "^[0-9]{10}$"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("hydra_leads");
    collection.fields.removeByName("mobile");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})