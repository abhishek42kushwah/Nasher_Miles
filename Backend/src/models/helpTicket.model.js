const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const createHelpTicketSheets = async () => {
  try {
    // ================= HELP TICKETS =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: "help_tickets" } } },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "help_tickets!A1:AK1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "created_at",
          "help_ticket_no",
          "location",
          "raised_by",
          "pc_accountable",
          "issue_description",
          "problem_solver",
          "desired_date",
          "image_upload",
          "priority",
          "current_stage",
          "status",

          "pc_planned_date",
          "pc_actual_date",
          "pc_status",
          "pc_remark",
          "pc_time_difference",

          "solver_planned_date",
          "solver_actual_date",
          "revise_count",
          "proof_upload",
          "solver_remark",
          "solver_time_difference",

          "pc_planned_stage4",
          "pc_actual_stage4",
          "pc_status_stage4",
          "pc_remark_stage4",
          "pc_time_difference_stage4",

          "closing_planned",
          "closing_actual",
          "closing_status",
          "closing_rating",
          "reraise_date",
          "closing_time_difference",

          "updated_at",
        ]],
      },
    });

    // ================= HISTORY =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: "help_ticket_history" } } },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "help_ticket_history!A1:J1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "ticket_id",
          "ticket_no",
          "stage",
          "old_values",
          "new_values",
          "action_type",
          "action_by",
          "action_date",
          "remarks",
        ]],
      },
    });

    console.log("✅ Help Ticket sheets ensured");
  } catch (err) {
    console.error("Error creating help ticket sheets:", err);
    throw err;
  }
};

module.exports = {
  createHelpTicketSheets,
};
