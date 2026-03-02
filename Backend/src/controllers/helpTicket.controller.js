const db = require('../config/db.config');
const { uploadToDrive,formatDuration } = require('../utils/googleDrive');
const { addBusinessHours } = require('../utils/dateUtils');


// Helper to generate Ticket No: HT-YYYYMMDD-XXXX
const generateTicketNo = async () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const tickets = await db.getAll("help_tickets");

  const todaysCount = tickets.filter(t =>
    t.help_ticket_no?.startsWith(`HT-${date}-`)
  ).length;

  return `HT-${date}-${String(todaysCount + 1).padStart(4, "0")}`;
};


// Helper: Get Config & Holidays
const getTATConfig = async () => {
  const config = (await db.getAll("help_ticket_config"))[0];
  const holidays = await db.getAll("help_ticket_holidays");
  return { config, holidays };
};


// Helper to record history
const recordHistory = async (
  ticketId,
  ticketNo,
  stage,
  oldValues,
  newValues,
  actionType,
  actionBy,
  remarks
) => {
  const history = await db.getAll("help_ticket_history");
  const nextId = history.length + 1;

  await db.insertByHeader("help_ticket_history", {
    id: nextId,
    ticket_id: ticketId,
    ticket_no: ticketNo,
    stage,
    old_values: oldValues ? JSON.stringify(oldValues) : "",
    new_values: JSON.stringify(newValues),
    action_type: actionType,
    action_by: actionBy,
    action_date: new Date().toISOString(),
    remarks,
  });
};



exports.raiseTicket = async (req, res) => {
  try {
    const {
      location,
      pc_accountable,
      issue_description,
      desired_date,
      priority,
      problem_solver,
    } = req.body;

    const raised_by = req.user.id;
    let image_upload = "";

    if (req.file) {
      image_upload = await uploadToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const tickets = await db.getAll("help_tickets");
    const id = tickets.length + 1;
    const help_ticket_no = await generateTicketNo();

    const { config, holidays } = await getTATConfig();
    const pcPlannedDate = addBusinessHours(
      new Date(),
      config.stage2_tat_hours,
      config,
      holidays
    );

    const ticket = {
      id,
      created_at: new Date().toISOString(),
      help_ticket_no,
      location,
      raised_by,
      pc_accountable,
      issue_description,
      desired_date,
      image_upload,
      priority,
      problem_solver,
      current_stage: 1,
      status: "OPEN",
      pc_planned_date: pcPlannedDate,
      updated_at: new Date().toISOString(),
    };

    await db.insertByHeader("help_tickets", ticket);
    await recordHistory(id, help_ticket_no, 1, null, ticket, "TICKET_RAISED", raised_by, "Ticket created");

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error raising ticket" });
  }
};


// Stage 2: PC Planning
exports.pcPlanning = async (req, res) => {
  const { id } = req.params;
  const { pc_planned_date, problem_solver, pc_remark, pc_status } = req.body;
  const actionBy = req.user.id;

  try {
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));
    if (!ticket) throw new Error("Ticket not found");

    if (String(ticket.pc_accountable) !== String(actionBy)) {
      throw new Error("Unauthorized");
    }

     let PC_TimeDifference = null;

    if (ticket.created_at) {
      const currentTime = new Date();
      const pcActualStage4 = new Date(ticket.created_at);
    
      const PCdiffMs = currentTime - pcActualStage4;

      // store in minutes (recommended)
      PC_TimeDifference = formatDuration(PCdiffMs);
    }

    const updated = {
      ...ticket,
      pc_planned_date,
      problem_solver,
      pc_remark,
      pc_status,
      pc_actual_date: new Date().toISOString(),
      pc_time_difference:PC_TimeDifference,
      current_stage: 3,
      status: "IN_PLANNING",
      solver_planned_date: pc_planned_date,
    };

    await db.updateById("help_tickets", id, updated);
    await recordHistory(id, ticket.help_ticket_no, 2, ticket, updated, "PC_PLANNING_COMPLETE", actionBy, pc_remark);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Stage 3: Problem Solver - Solve
exports.solveTicket = async (req, res) => {
  const { id } = req.params;
  const { solver_remark } = req.body;
  const actionBy = req.user.id;

  try {
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));
    if (!ticket) throw new Error("Ticket not found");
    
   

    let proof_upload = "";
    if (req.file) {
      proof_upload = await uploadToDrive(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

     let solveTimeDifference = null;

    if (ticket.pc_planned_date) {
      const solverActualDate = new Date();
      const pcPlanDate = new Date(ticket.pc_planned_date);
    
      const diffMs = solverActualDate -  pcPlanDate;

      // store in minutes (recommended)
      solveTimeDifference =formatDuration(diffMs);
    }
    
    const { config, holidays } = await getTATConfig();
    const pcPlannedStage4 = addBusinessHours(
      new Date(),
      config.stage4_tat_hours,
      config,
      holidays
    );

    const updated = {
      ...ticket,
      solver_actual_date: new Date().toISOString(),
      solver_remark,
      proof_upload,
      solver_time_difference : solveTimeDifference,
      current_stage: 4,
      status: "SOLVED",
      pc_planned_stage4: pcPlannedStage4,
    };

    await db.updateById("help_tickets", id, updated);
    await recordHistory(id, ticket.help_ticket_no, 3, ticket, updated, "TICKET_SOLVED", actionBy, solver_remark);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Stage 3: Problem Solver - Revise Date
exports.reviseTicketDate = async (req, res) => {
  const { id } = req.params;
  const { solver_planned_date, solver_remark } = req.body;
  const actionBy = req.user.id;

  try {
    // 1️⃣ Fetch tickets
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const oldValues = { ...ticket };

    // 2️⃣ Increment revise count safely
    const reviseCount = Number(ticket.revise_count || 0) + 1;

    // 3️⃣ Prepare updated ticket
    const updatedTicket = {
      ...ticket,
      solver_planned_date,
      solver_remark,
      revise_count: reviseCount,
      updated_at: new Date().toISOString(),
    };

    // 4️⃣ Update ticket in sheet
    await db.updateById("help_tickets", id, updatedTicket);

    // 5️⃣ Record history
    await recordHistory(
      id,
      ticket.help_ticket_no,
      3,                    // Stage 3 (Solver)
      oldValues,
      updatedTicket,
      "DATE_REVISED",
      actionBy,
      solver_remark
    );

    // 6️⃣ Respond
    res.json(updatedTicket);
  } catch (err) {
    console.error("Error revising ticket date:", err);
    res.status(500).json({
      message: err.message || "Error revising date",
    });
  }
};

// Stage 4: PC Confirmation
exports.pcConfirmation = async (req, res) => {
  const { id } = req.params;
  const { pc_status_stage4, pc_remark_stage4 } = req.body;
  const actionBy = req.user.id;

  try {
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));
    if (!ticket) throw new Error("Ticket not found");

    const { config, holidays } = await getTATConfig();
    const closingPlanned = addBusinessHours(
      new Date(),
      config.stage5_tat_hours,
      config,
      holidays
    );

     let pcTimeDifference = null;

    if (ticket.solver_actual_date) {
      const pc_Actual = new Date();
      const pcTimeStage4 = new Date(ticket.solver_actual_date);
    
      const pcDiffMs = pc_Actual - pcTimeStage4;

      // store in minutes (recommended)
      pcTimeDifference = formatDuration(pcDiffMs);
    }

    const updated = {
      ...ticket,
      pc_actual_stage4: new Date().toISOString(),
      pc_status_stage4,
      pc_remark_stage4,
      pc_time_difference_stage4: pcTimeDifference,
      current_stage: 5,
      status: "CONFIRMED",
      closing_planned: closingPlanned,
    };

    await db.updateById("help_tickets", id, updated);
    await recordHistory(id, ticket.help_ticket_no, 4, ticket, updated, "PC_CONFIRMED", actionBy, pc_remark_stage4);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Stage 5: Closure
exports.closeTicket = async (req, res) => {
  const { id } = req.params;
  const { closing_rating, closing_status, remarks } = req.body;
  const actionBy = req.user.id;

  try {
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ⏱ Calculate time difference safely
    let closingTimeDifference = null;

    if (ticket.pc_actual_stage4) {
      const closingActual = new Date();
      const pcActualStage4 = new Date(ticket.pc_actual_stage4);
    
      const closediffMs = closingActual - pcActualStage4;

      // store in minutes (recommended)
      closingTimeDifference = formatDuration(closediffMs);
    }
  
    const updated = {
      ...ticket,
      closing_actual: new Date().toISOString(),
      closing_status: closing_status || "Satisfied",
      closing_rating: closing_rating || 5,
      closing_time_difference: closingTimeDifference, // minutes
      current_stage: 6,
      status: "CLOSED",
      updated_at: new Date().toISOString(),
    };
  
    await db.updateById("help_tickets", id, updated);

    await recordHistory(
      id,
      ticket.help_ticket_no,
      5,
      ticket,
      updated,
      "TICKET_CLOSED",
      actionBy,
      remarks || "Ticket closed"
    );

    res.json(updated);
  } catch (err) {
    console.error("closeTicket error:", err);
    res.status(500).json({
      message: err.message || "Error closing ticket",
    });
  }
};



// Stage 5: Re-raise
exports.reraiseTicket = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;
  const actionBy = req.user.id;

  try {
    const tickets = await db.getAll("help_tickets");
    const ticket = tickets.find(t => String(t.id) === String(id));

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const updated = {
      ...ticket,
      reraise_date: new Date().toISOString(),
      current_stage: 3,
      status: "RERAISED",
      updated_at: new Date().toISOString(),
    };

    await db.updateById("help_tickets", id, updated);

    await recordHistory(
      id,
      ticket.help_ticket_no,
      5,
      ticket,
      updated,
      "TICKET_RERAISED",
      actionBy,
      remarks
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Error re-raising ticket" });
  }
};



//help ticket history 
exports.getHelpTicketHistoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const history = await db.getAll("help_ticket_history");

    const result = history
      .filter(h => String(h.ticket_id) === String(id))
      .sort(
        (a, b) =>
          new Date(b.action_date) - new Date(a.action_date)
      );

    res.json({
      success: true,
      count: result.length,
      data: result.map(h => ({
        ...h,
        old_values: h.old_values ? JSON.parse(h.old_values) : null,
        new_values: h.new_values ? JSON.parse(h.new_values) : null,
      })),
    });
  } catch (err) {
    console.error("getHelpTicketHistoryById error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch help ticket history",
    });
  }
};




// List Tickets
exports.getTickets = async (req, res) => {
  try {
    const { filter_type, raised_by } = req.query;
    const userId = req.user.id;

    const tickets = await db.getAll("help_tickets");
    const employees = await db.getAll("employees");

    const empMap = {};
    employees.forEach(e => (empMap[e.User_Id] = e));

    let result = tickets;

    if (filter_type === "assigned") {
      result = tickets.filter(
        t =>
          String(t.pc_accountable) === String(userId) ||
          String(t.problem_solver) === String(userId)
      );
    } else if (filter_type === "raised") {
      result = tickets.filter(
        t => String(t.raised_by) === String(userId)
      );
    } else if (raised_by) {
      result = tickets.filter(
        t => String(t.raised_by) === String(raised_by)
      );
    }

    result = result
      .map(t => ({
        ...t,
        raiser_name: empMap[t.raised_by]
          ? `${empMap[t.raised_by].First_Name} ${empMap[t.raised_by].Last_Name}`
          : "",
        pc_name: empMap[t.pc_accountable]
          ? `${empMap[t.pc_accountable].First_Name} ${empMap[t.pc_accountable].Last_Name}`
          : "",
        solver_name: empMap[t.problem_solver]
          ? `${empMap[t.problem_solver].First_Name} ${empMap[t.problem_solver].Last_Name}`
          : "",
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};


// Ticket Detail with History
exports.getTicketById = async (req, res) => {
  const { id } = req.params;

  try {
    const tickets = await db.getAll("help_tickets");
    const history = await db.getAll("help_ticket_history");
    const employees = await db.getAll("employees");

    const empMap = {};
    employees.forEach(e => (empMap[e.User_Id] = e));

    const ticket = tickets.find(
      t => String(t.id) === String(id)
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticketHistory = history
      .filter(h => String(h.ticket_id) === String(id))
      .sort(
        (a, b) =>
          new Date(b.action_date) - new Date(a.action_date)
      )
      .map(h => ({
        ...h,
        action_by_name: empMap[h.action_by]
          ? `${empMap[h.action_by].First_Name} ${empMap[h.action_by].Last_Name}`
          : "",
        old_values: h.old_values ? JSON.parse(h.old_values) : null,
        new_values: h.new_values ? JSON.parse(h.new_values) : null,
      }));

    res.json({
      ...ticket,
      raiser_name: empMap[ticket.raised_by]
        ? `${empMap[ticket.raised_by].First_Name} ${empMap[ticket.raised_by].Last_Name}`
        : "",
      pc_name: empMap[ticket.pc_accountable]
        ? `${empMap[ticket.pc_accountable].First_Name} ${empMap[ticket.pc_accountable].Last_Name}`
        : "",
      solver_name: empMap[ticket.problem_solver]
        ? `${empMap[ticket.problem_solver].First_Name} ${empMap[ticket.problem_solver].Last_Name}`
        : "",
      history: ticketHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching ticket detail" });
  }
};
