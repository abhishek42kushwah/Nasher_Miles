const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "departments";

const DEFAULT_DEPARTMENTS = [
  "HR",
  "IT",
  "Finance",
  "Sales",
  "Operations",
  "Customer Service",
  "Custom",
];

const createDepartmentSheet = async () => {
  try {
    // 1️⃣ Try to create the sheet (ignore if exists)
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
      console.log("Departments sheet created");
    } catch {
      // Sheet already exists → ignore
    }

    // 2️⃣ Ensure header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["id", "name", "created_at"]],
      },
    });

    // 3️⃣ Read existing data
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const existingRows = res.data.values || [];

    // 4️⃣ Seed only if empty
    if (existingRows.length === 0) {
      const now = new Date().toISOString();

      const seedRows = DEFAULT_DEPARTMENTS.map((name, index) => [
        index + 1, // id
        name,
        now,
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:C`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: seedRows,
        },
      });

      console.log("Seed departments added");
    } else {
      console.log("Departments already seeded");
    }
  } catch (err) {
    console.error("Error creating departments sheet:", err);
    throw err;
  }
};

module.exports = {
  createDepartmentSheet,
};
