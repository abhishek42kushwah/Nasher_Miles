const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "locations";

const DEFAULT_LOCATIONS = [
  "Office",
  "Site A",
  "Site B",
  "Warehouse",
];

const createLocationSheet = async () => {
  try {
    // 1️⃣ Create sheet if not exists
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
      console.log("Locations sheet created");
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

    // 3️⃣ Check if data exists
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:A`,
    });

    const existingRows = res.data.values || [];

    // 4️⃣ Seed default locations if empty
    if (existingRows.length === 0) {
      const now = new Date().toISOString();

      const seedRows = DEFAULT_LOCATIONS.map((name, index) => [
        index + 1,
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

      console.log("Seed locations added");
    } else {
      console.log("Locations already seeded");
    }
  } catch (err) {
    console.error("Error creating locations sheet:", err);
    throw err;
  }
};

module.exports = {
  createLocationSheet,
};
