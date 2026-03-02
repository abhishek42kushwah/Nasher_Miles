const db = require('../config/db.config');

// Get Config
exports.getConfig = async (req, res) => {
  try {
    const configs = await db.getAll("help_ticket_config");
    const holidays = await db.getAll("help_ticket_holidays");

    const config = configs.find(c => String(c.id) === "1");

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    const upcomingHolidays = holidays
      .filter(h => h.holiday_date >= today)
      .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));

    res.json({
      settings: {
        ...config,
        working_days: (config.working_days || "")
          .split(",")
          .map(Number),
      },
      holidays: upcomingHolidays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching configuration" });
  }
};


// Update Config
exports.updateConfig = async (req, res) => {
  const {
    stage2_tat_hours,
    stage4_tat_hours,
    stage5_tat_hours,
    office_start_time,
    office_end_time,
    working_days,
  } = req.body;

  try {
    await db.updateById("help_ticket_config", 1, {
      stage2_tat_hours,
      stage4_tat_hours,
      stage5_tat_hours,
      office_start_time,
      office_end_time,
      working_days: Array.isArray(working_days)
        ? working_days.join(",")
        : undefined,
      updated_at: new Date().toISOString(),
    });

    const configs = await db.getAll("help_ticket_config");
    const updated = configs.find(c => String(c.id) === "1");

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating configuration" });
  }
};


// Add Holiday
exports.addHoliday = async (req, res) => {
  const { holiday_date, description } = req.body;

  try {
    const holidays = await db.getAll("help_ticket_holidays");

    const exists = holidays.find(
      h => h.holiday_date === holiday_date
    );

    if (exists) {
      return res
        .status(400)
        .json({ message: "Holiday already exists for this date" });
    }

    const nextId = holidays.length + 1;

    const data = {
      id: nextId,
      holiday_date,
      description: description || "",
      created_at: new Date().toISOString(),
    };

    await db.insertByHeader("help_ticket_holidays", data);

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding holiday" });
  }
};


// Remove Holiday
exports.removeHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    const holidays = await db.getAll("help_ticket_holidays");
    const holiday = holidays.find(h => String(h.id) === String(id));

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // Soft delete (recommended for Sheets)
    await db.updateById("help_ticket_holidays", id, {
      deleted: true,
    });

    res.json({ message: "Holiday removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing holiday" });
  }
};

