const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db.config");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_erp";
const SHEET_NAME = "employees";


exports.register = async (req, res) => {
  const {
    First_Name,
    Last_Name,
    Work_Email,
    Password,
    Role,
    Designation,
    Department,
    Joining_Date,
  } = req.body;

  try {
    
    const existingUser = await db.find(
      SHEET_NAME,
      "Work_Email",
      Work_Email
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Employee with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const allEmployees = await db.getAll(SHEET_NAME);
    const nextUserId = allEmployees.length + 1;

    await db.insertByHeader(SHEET_NAME, {
      User_Id: nextUserId,
      First_Name,
      Last_Name,
      Work_Email,
      Password: hashedPassword,
      Role: Role || "Employee",
      Designation: Designation || "",
      Department: Department || "",
      Joining_Date: Joining_Date || "",
      Theme: "light",
      Created_at: new Date().toISOString(),
      Updated_at: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Employee registered successfully",
      user: {
        id: nextUserId,
        email: Work_Email,
        role: Role || "Employee",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};


/**
 * LOGIN EMPLOYEE
 */
exports.login = async (req, res) => {
  const { Work_Email, Password } = req.body;

  try {
    const users = await db.find(
      SHEET_NAME,
      "Work_Email",
      Work_Email
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const employee = users[0];

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(
      Password,
      employee.Password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🎫 Generate JWT
    const token = jwt.sign(
      {
        id: employee.User_Id,
        email: employee.Work_Email,
        role: employee.Role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: employee.User_Id,
        email: employee.Work_Email,
        role: employee.Role,
        name: `${employee.First_Name} ${employee.Last_Name}`,
        theme: employee.Theme || "light",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

/**
 * UPDATE THEME
 */
exports.updateTheme = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user.id;

  try {
    await db.updateById(SHEET_NAME, userId, {
      Theme: theme,
      Updated_at: new Date().toISOString(),
    });

    res.json({ message: "Theme updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while updating theme",
    });
  }
};
