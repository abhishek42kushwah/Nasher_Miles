const db = require('../config/db.config');

// Get all employees (simplified list for dropdowns)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await db.getAll("employees");

    const result = employees
      .map(emp => ({
        id: emp.User_Id,
        First_Name: emp.First_Name,
        Last_Name: emp.Last_Name,
        email: emp.Work_Email,
        Department: emp.Department,
        role: emp.Role,
      }))
      .sort((a, b) =>
        (a.First_Name || "").localeCompare(b.First_Name || "")
      );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching employees" });
  }
};


// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await db.getAll("departments");

    const result = departments.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching departments" });
  }
};


// Get PC/EA accountables
exports.getPCAccountables = async (req, res) => {
  try {
    const employees = await db.getAll("employees");

    const result = employees
      .filter(emp =>
        ["PC", "EA"].includes(emp.Designation)
      )
      .map(emp => ({
        id: emp.User_Id,
        name: `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching PC accountables" });
  }
};


// Get problem solvers (all except logged in user)
exports.getProblemSolvers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const employees = await db.getAll("employees");

    const result = employees
      .filter(emp => emp.User_Id != loggedInUserId)
      .map(emp => ({
        id: emp.User_Id,
        name: `${emp.First_Name || ""} ${emp.Last_Name || ""}`.trim(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching problem solvers" });
  }
};


// Get all locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await db.getAll("locations");

    const result = locations
      .map(loc => ({
        id: loc.id,
        name: loc.name,
      }))
      .sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching locations" });
  }
};


// Helper for IST Timestamp (Server side)
// Note: Usually handled by DB or by sending ISO strings, 
// but we can ensure the DB session is in IST if needed.
exports.getISTTimestamp = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
};

