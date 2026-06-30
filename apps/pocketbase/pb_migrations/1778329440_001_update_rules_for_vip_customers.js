/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("vip_customers");
  // No rules to update
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("vip_customers");
  collection.listRule = "email = @request.auth.email";
  collection.viewRule = "email = @request.auth.email";
  collection.createRule = null;
  collection.updateRule = null;
  collection.deleteRule = null;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})