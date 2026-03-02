const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "todos";

const createTodoSheet = async () => {
  try {
    // 1️⃣ Create sheet if it does not exist
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        },
      });
      console.log("Todos sheet created");
    } catch {
      // Sheet already exists → ignore
    }

    // 2️⃣ Ensure header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:J1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          "todo_id",
          "title",
          "description",
          "priority",
          "status",
          "due_date",
          "created_by",
          "assigned_to",
          "created_at",
          "updated_at",
        ]],
      },
    });

    console.log("Kanban ToDo sheet ensured");
  } catch (err) {
    console.error("Error creating ToDo sheet:", err);
    throw err;
  }
};

module.exports = {
  createTodoSheet,
};
