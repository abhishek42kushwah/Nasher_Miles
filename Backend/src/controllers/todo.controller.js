const db = require('../config/db.config');

// --- Kanban ToDo CRUD ---

exports.createTodo = async (req, res) => {
  const {
    title,
    description,
    priority,
    status,
    due_date,
    assigned_to,
  } = req.body;

  const created_by = req.user.id || req.user.User_Id;

  try {
    const todos = await db.getAll("todos");
    const nextTodoId = todos.length + 1;

    const todoData = {
      todo_id: nextTodoId,
      title,
      description: description || "",
      priority: priority || "Normal",
      status: status || "To Do",
      due_date: due_date || "",
      created_by,
      assigned_to: assigned_to || created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.insertByHeader("todos", todoData);

    res.status(201).json(todoData);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ message: "Error creating todo" });
  }
};


exports.getTodosByUserId = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const todos = await db.getAll("todos");
    const employees = await db.getAll("employees");

    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.User_Id] = emp;
    });

    const result = todos
      .filter(
        t =>
          String(t.created_by) === String(userId) ||
          String(t.assigned_to) === String(userId)
      )
      .map(t => ({
        ...t,
        creator_first_name:
          employeeMap[t.created_by]?.First_Name || "",
        creator_last_name:
          employeeMap[t.created_by]?.Last_Name || "",
        assignee_first_name:
          employeeMap[t.assigned_to]?.First_Name || "",
        assignee_last_name:
          employeeMap[t.assigned_to]?.Last_Name || "",
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ message: "Error fetching todos" });
  }
};


exports.updateTodoStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.updateById("todos", id, {
      status,
      updated_at: new Date().toISOString(),
    });

    // Re-fetch updated todo
    const todos = await db.getAll("todos");
    const employees = await db.getAll("employees");

    const todo = todos.find(t => String(t.todo_id) === String(id));
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const creator = employees.find(
      e => String(e.User_Id) === String(todo.created_by)
    );
    const assignee = employees.find(
      e => String(e.User_Id) === String(todo.assigned_to)
    );

    res.status(200).json({
      ...todo,
      creator_first_name: creator?.First_Name || "",
      creator_last_name: creator?.Last_Name || "",
      assignee_first_name: assignee?.First_Name || "",
      assignee_last_name: assignee?.Last_Name || "",
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Error updating status" });
  }
};
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;

  try {
    const todos = await db.getAll("todos");
    const todo = todos.find(t => String(t.todo_id) === String(id));

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Soft-delete approach (recommended)
    await db.updateById("todos", id, {
      status: "Deleted",
      updated_at: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Todo deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: "Error deleting todo" });
  }
};