import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "../../store/slices/masterSlice";
import { createTodo,fetchTodos } from "../../store/slices/todoSlice";
import toast from "react-hot-toast";
import useHolidayCheck from "../../hooks/useHolidayCheck";
const CreateTodoModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.master);
  const { isInvalidDate } = useHolidayCheck();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Normal",
    due_date: "",
    assigned_to: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchEmployees());
    }
  }, [isOpen, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalidDate(formData.due_date)) {
      toast.error(
        "Selected date is not available. Please choose another date.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(
        createTodo({
          ...formData,
          assigned_to: formData.assigned_to
            ? parseInt(formData.assigned_to)
            : null,
          status: "To Do", // Always start in To Do column
        }),
      ).unwrap();
     await dispatch(fetchTodos()).unwrap();
      toast.success("Task created successfully");
      onClose();
      setFormData({
        title: "",
        description: "",
        priority: "Normal",
        due_date: "",
        assigned_to: "",
      });
    } catch (err) {
      toast.error(err || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-bg-card border border-border-main w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-5 border-b border-border-main bg-bg-main/50">
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              add_task
            </span>
            Create New Task
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-main rounded-full text-text-muted transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase px-1">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="Brief summary of the task"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase px-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Detailed instructions or context..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                name="due_date"
                required
                value={formData.due_date}
                onChange={handleChange}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase px-1">
              Assign To
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="">Self (Default)</option>
              {employees.map((e, idx) => (
                <option key={e.id || `emp-${idx}`} value={e.id}>
                  {e.First_Name} {e.Last_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border-main mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border-main font-bold text-text-muted hover:bg-bg-main transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
              )}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTodoModal;
