const sheets = require("../config/googleSheet");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const createEmployeeSheet = async () => {
  const headers = [[
    "User_Id",
    "First_Name",
    "Last_Name",
    "Work_Email",
    "Personal_Email",
    "Password",
    "Mobile_Number",
    "Emergency_Mobile_No",
    "Role",
    "Designation",
    "Department",
    "Date_of_Birth",
    "Profile_Photo_URL",
    "Resume_URL",
    "Salary",
    "Last_Increment",
    "Current_Salary",
    "Joining_Date",
    "Manager",
    "Contract",
    "Marital_Status",
    "Anniversary_Date",
    "Gender",
    "Address",
    "City",
    "State",
    "Nationality",
    "Theme",
    "Created_at",
    "Updated_at"
  ]];

  try {
    // 1️⃣ Create Sheet if not exists
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: "employees",
              },
            },
          },
        ],
      },
    });
  } catch (err) {
    // Sheet may already exist → ignore
  }

  // 2️⃣ Add Header Row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "employees!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: headers,
    },
  });

  console.log("✅ Employees sheet (table) created successfully");
};

module.exports = {
  createEmployeeSheet,
};
