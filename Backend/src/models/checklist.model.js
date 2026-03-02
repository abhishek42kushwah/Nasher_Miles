const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const createChecklistSheets = async () => {
  try {
    // ========== CHECKLIST MASTER ==========
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "checklist_master" },
              },
            },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "checklist_master!A1:O1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "question",
          "assignee_id",
          "doer_id",
          "priority",
          "department",
          "verification_required",
          "verifier_id",
          "attachment_required",
          "frequency",
          "from_date",
          "due_date",
          "weekly_days",
          "selected_dates",
          "created_at",
        ]],
      },
    });

    // ========== CHECKLIST ==========
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "checklist" },
              },
            },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "checklist!A1:R1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "master_id",
          "question",
          "assignee_id",
          "assignee_name",
          "doer_id",
          "doer_name",
          "priority",
          "department",
          "verification_required",
          "verifier_id",
          "verifier_name",
          "attachment_required",
          "frequency",
          "status",
          "proof_file_url",
          "due_date",
          "created_at",
        ]],
      },
    });

    console.log("✅ Checklist sheets created successfully");
  } catch (err) {
    console.error("Error creating checklist sheets:", err);
    throw err;
  }
};

module.exports = {
  createChecklistSheets,
};
