/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let records;
  try {
    records = app.findRecordsByFilter("blog_posts", "slug='sip-top-up-1-crore-strategy'");
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("No records found, skipping");
      return;
    }
    throw e;
  }
  
  for (const record of records) {
    record.set("title", "How to Reach \u20b91 Crore: The SIP Top-Up Secret for 2026");
    record.set("author", "GTrends Network");
    record.set("content", "The Strategy: Most Indian investors understand the power of a Systematic Investment Plan (SIP). However, sitting on a flat SIP for 20 years is no longer the fastest way to build wealth in a growing economy. To reach the milestone of \u20b91 Crore, you need to leverage the \"Step-Up\" or \"Top-Up\" method.\n\nWhy it Works: A SIP Top-Up allows you to increase your monthly investment by a fixed percentage every year. As your income grows from your job or business, your investments should grow too.\n\nThe 10% Advantage:\n- A Standard SIP of \u20b910,000 at 12% returns takes ~20 years to reach \u20b91 Crore.\n- A 10% Annual Top-Up on that same SIP reaches \u20b91 Crore in just 15 years.\n\nAction: Use our \"Crorepathi Solver\" on the Wealth page to calculate your exact date.");
    try {
      app.save(record);
    } catch (e) {
      if (e.message.includes("Value must be unique")) {
        console.log("Record with unique value already exists, skipping");
      } else {
        throw e;
      }
    }
  }
}, (app) => {
  // Rollback: original values not stored, manual restore needed
})