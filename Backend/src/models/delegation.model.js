const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const createDelegationSheets = async () => {
  try {
    // ================= DELEGATION =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "delegation" } } }],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "delegation!A1:R1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "delegation_name",
          "description",
          "delegator_id",
          "delegator_name",
          "doer_id",
          "doer_name",
          "department",
          "priority",
          "status",
          "due_date",
          "voice_note_url",
          "reference_docs",
          "evidence_required",
          "created_at",
          "updated_at",
          "remarks",
          "revision_history"
        ]],
      },
    });

    // ================= REMARK =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "remark" } } }],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "remark!A1:G1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "delegation_id",
          "user_id",
          "username",
          "remark",
          "created_at",
        ]],
      },
    });

    // ================= REVISION HISTORY =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: "revision_history" } } }],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "revision_history!A1:J1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "delegation_id",
          "old_due_date",
          "new_due_date",
          "old_status",
          "new_status",
          "reason",
          "changed_by",
          "created_at",
          "updated_at"
        ]],
      },
    });

    console.log("✅ Delegation sheets ensured successfully");
  } catch (err) {
    console.error("❌ Error creating delegation sheets:", err);
    throw err;
  }
};

module.exports = {
  createDelegationSheets,
};
