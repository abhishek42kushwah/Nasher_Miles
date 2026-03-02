const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const createHelpTicketConfigSheets = async () => {
  try {
    // ================= CONFIG SHEET =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: "help_ticket_config" } } },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "help_ticket_config!A1:H1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "stage2_tat_hours",
          "stage4_tat_hours",
          "stage5_tat_hours",
          "office_start_time",
          "office_end_time",
          "working_days",
          "updated_at",
        ]],
      },
    });

    // Ensure default config row (id = 1)
    const configCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "help_ticket_config!A2:A",
    });

    if (!configCheck.data.values || configCheck.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "help_ticket_config!A:H",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            1,
            24,
            4,
            24,
            "09:00",
            "18:00",
            "1,2,3,4,5,6",
            new Date().toISOString(),
          ]],
        },
      });
    }

    // ================= HOLIDAYS SHEET =================
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: "help_ticket_holidays" } } },
          ],
        },
      });
    } catch {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "help_ticket_holidays!A1:D1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "id",
          "holiday_date",
          "description",
          "created_at",
        ]],
      },
    });

    console.log("✅ Help Ticket Config & Holidays sheets ensured");
  } catch (err) {
    console.error("Error creating help ticket config sheets:", err);
    throw err;
  }
};

module.exports = {
  createHelpTicketConfigSheets,
};
