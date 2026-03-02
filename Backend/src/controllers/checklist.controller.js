const db = require('../config/db.config');
const cron = require('node-cron');
const { uploadToDrive } = require('../utils/googleDrive');


// Create a new master template
exports.createChecklistMaster = async (req, res) => {
  const body = req.body;

  try {
    const masters = await db.getAll("checklist_master");
    const nextId = masters.length + 1;

    const data = {
      id: nextId,
      question: body.question,
      assignee_id: body.assignee_id || "",
      assignee_name: body.assignee_name || "",
      doer_id: body.doer_id || "",
      doer_name: body.doer_name || "",
      priority: body.priority,
      department: body.department,
      verification_required: body.verification_required,
      verifier_id: body.verifier_id || "",
      verifier_name: body.verifier_name || "",
      attachment_required: body.attachment_required,
      frequency: body.frequency,
      from_date: body.from_date || "",
      due_date: body.due_date || "",
      weekly_days: (body.weekly_days || []).join(","),     // array → string
      selected_dates: (body.selected_dates || []).join(","), // array → string
      created_at: new Date().toISOString(),
    };

    await db.insertByHeader("checklist_master", data);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating checklist master" });
  }
};


// Update template details
exports.updateChecklistMaster = async (req, res) => {
  const { id } = req.params;

  try {
    await db.updateById("checklist_master", id, {
      ...req.body,
      weekly_days: req.body.weekly_days?.join(","),
      selected_dates: req.body.selected_dates?.join(","),
    });

    const masters = await db.getAll("checklist_master");
    const updated = masters.find(m => String(m.id) === String(id));

    if (!updated) return res.status(404).json({ message: "Template not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating checklist master" });
  }
};


// Delete a template
exports.deleteChecklistMaster = async (req, res) => {
  const { id } = req.params;

  try {
    await db.updateById("checklist_master", id, {
      deleted: true,
    });

    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting checklist master" });
  }
};


// Update checklist status
exports.updateChecklistStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    let proofFileUrl = "";

    if (req.file) {
      try {
        proofFileUrl = await uploadToDrive(
          req.file.buffer,
          `checklist_${id}_${Date.now()}_${req.file.originalname}`,
          req.file.mimetype
        );
      } catch {
        proofFileUrl = `/uploads/proof_${id}.pdf`;
      }
    }

    await db.updateById("checklist", id, {
      status,
      proof_file_url: proofFileUrl,
    });

    const rows = await db.getAll("checklist");
    const updated = rows.find(r => String(r.id) === String(id));

    if (!updated) return res.status(404).json({ message: "Checklist task not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating checklist status" });
  }
};


// Update checklist task details (Edit)
exports.updateChecklistTaskDetails = async (req, res) => {
  const { id } = req.params;

  try {
    await db.updateById("checklist", id, req.body);

    const rows = await db.getAll("checklist");
    const updated = rows.find(r => String(r.id) === String(id));

    if (!updated) return res.status(404).json({ message: "Checklist task not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating checklist details" });
  }
};


// Delete a specific task instance
exports.deleteChecklistTask = async (req, res) => {
  const { id } = req.params;

  try {
    await db.updateById("checklist", id, {
      status: "Deleted",
    });

    res.json({ message: "Checklist task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting checklist task" });
  }
};


// Get all checklist tasks (with filtering)
exports.getChecklists = async (req, res) => {
  const { role, id, User_Id } = req.user;
  const currentUserId = id || User_Id;

  try {
    const checklist = await db.getAll("checklist");
    const employees = await db.getAll("employees");

    const empMap = {};
    employees.forEach(e => (empMap[e.User_Id] = e));

    let result = checklist;

    if (role !== "Admin" && role !== "SuperAdmin") {
      result = checklist.filter(
        c =>
          c.assignee_id == currentUserId ||
          c.doer_id == currentUserId ||
          c.verifier_id == currentUserId
      );
    }

    result = result
      .map(c => ({
        ...c,
        assignee_name:
          empMap[c.assignee_id]
            ? `${empMap[c.assignee_id].First_Name} ${empMap[c.assignee_id].Last_Name}`
            : c.assignee_name,
        doer_name:
          empMap[c.doer_id]
            ? `${empMap[c.doer_id].First_Name} ${empMap[c.doer_id].Last_Name}`
            : c.doer_name,
      }))
      .sort((a, b) => Number(b.id) - Number(a.id));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching checklists" });
  }
};


// Automation Logic: Generate daily tasks
const generateDailyTasks = async () => {
  console.log("Checklist cron running...");

  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const todayDate = now.getDate();

  const masters = await db.getAll("checklist_master");
  const tasks = await db.getAll("checklist");

  for (const master of masters) {
    let shouldCreate = false;

    const weeklyDays = (master.weekly_days || "").split(",");
    const selectedDates = (master.selected_dates || "").split(",").map(Number);

    if (master.frequency === "daily") shouldCreate = true;
    if (master.frequency === "weekly" && weeklyDays.includes(todayName)) shouldCreate = true;
    if (master.frequency === "monthly" && selectedDates.includes(todayDate)) shouldCreate = true;

    if (!shouldCreate) continue;

    const alreadyExists = tasks.find(
      t =>
        String(t.master_id) === String(master.id) &&
        t.created_at?.startsWith(new Date().toISOString().split("T")[0])
    );

    if (alreadyExists) continue;

    const nextId = tasks.length + 1;

    await db.insertByHeader("checklist", {
      id: nextId,
      master_id: master.id,
      question: master.question,
      assignee_id: master.assignee_id,
      assignee_name: master.assignee_name,
      doer_id: master.doer_id,
      doer_name: master.doer_name,
      priority: master.priority,
      department: master.department,
      verification_required: master.verification_required,
      verifier_id: master.verifier_id,
      verifier_name: master.verifier_name,
      attachment_required: master.attachment_required,
      frequency: master.frequency,
      status: "Pending",
      due_date: master.due_date,
      created_at: new Date().toISOString(),
    });
  }

  console.log("Checklist cron completed");
};


// Start Cron Job (daily at 00:00)
exports.startChecklistCron = () => {
  cron.schedule("0 0 * * *", generateDailyTasks);
  console.log("Checklist automation cron scheduled");
};

exports.generateDailyTasks = generateDailyTasks;

// Export for manual testing if needed
exports.generateDailyTasks = generateDailyTasks;
