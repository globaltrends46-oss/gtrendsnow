/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("blog_posts");

  const record0 = new Record(collection);
    record0.set("title", "How to Reach \u20b91 Crore: The SIP Top-Up Secret for 2026");
    record0.set("author", "GTrends Network");
    record0.set("content", "Most Indian investors use SIPs, but the real wealth is built using a \"Top-Up\" strategy. By increasing your SIP by just 10% every year, you can reach your \u20b91 Crore goal 5-7 years earlier than a flat SIP. Use our \"Crorepathi Solver\" on the Wealth page to calculate your personalized timeline today.");
    record0.set("category", "Wealth");
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