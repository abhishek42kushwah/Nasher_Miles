import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useDispatch, useSelector } from "react-redux";
import {
  createChecklist,
  updateChecklistTask,
  
} from "../../store/slices/checklistSlice";
import toast from "react-hot-toast";
import DaySelector from "./DaySelector";
import MultiDateSelector from "./MultiDateSelector";
import CustomDatePicker from "../common/CustomDatePicker";
import useHolidayCheck from "../../hooks/useHolidayCheck";
const CreateChecklistModal = ({
  isOpen,
  onClose,
  onSuccess,
  checklistToEdit,
}) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'assignee', 'doer', 'verifier', 'department' or null
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [doerSearch, setDoerSearch] = useState("");
  const [verifierSearch, setVerifierSearch] = useState("");
  const { isInvalidDate } = useHolidayCheck();

  const [formData, setFormData] = useState({
    task: "",
    assignee_id: "",
    assignee_name: "",
    doer_id: "",
    doer_name: "",
    department: "",
    priority: "medium",
    frequency: "daily",
    start_date: "",
    due_date: "",
    verification_required: false,
    attachment_required: false,
    verifier_id: "",
    verifier_name: "",
  });

  const isEditMode = !!checklistToEdit;

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (checklistToEdit) {
        // Populate form for editing
        setFormData({
          task: checklistToEdit.question || checklistToEdit.task,
          assignee_id: checklistToEdit.assignee_id,
          assignee_name: checklistToEdit.assignee_name || "",
          doer_id: checklistToEdit.doer_id,
          doer_name: checklistToEdit.doer_name || "",
          department: checklistToEdit.department || "",
          priority: checklistToEdit.priority || "medium",
          frequency: checklistToEdit.frequency || "daily", // Usually read-only in edit
          start_date: checklistToEdit.created_at
            ? new Date(checklistToEdit.created_at).toISOString().slice(0, 16)
            : "",
          due_date: checklistToEdit.due_date
            ? new Date(checklistToEdit.due_date).toISOString().slice(0, 16)
            : "",
          verification_required: checklistToEdit.verification_required || false,
          verifier_id: checklistToEdit.verifier_id || "",
          verifier_name: checklistToEdit.verifier_name || "",
          attachment_required: checklistToEdit.attachment_required || false,
        });
      } else {
        // Reset form on open for create
        setFormData({
          task: "",

          assignee_id: user?.id || user?.User_Id || "",
          assignee_name:
            user?.name ||
            `${user?.first_name || user?.First_Name || ""} ${user?.last_name || user?.Last_Name || ""}`.trim(),
          doer_id: "",
          doer_name: "",
          department: "",
          priority: "medium",
          frequency: "daily",
          start_date: new Date().toISOString().slice(0, 16),
          due_date: "",
          weekly_days: [],
          selected_dates: [],
          verification_required: false,
          attachment_required: false,
        });
      }
    }
  }, [isOpen, checklistToEdit]);

  const fetchInitialData = async () => {
    try {
      // Fetch employees
      const empRes = await axios.get(`${API_BASE_URL}/api/master/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(empRes.data);

      // Fetch departments
      const deptRes = await axios.get(
        `${API_BASE_URL}/api/master/departments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDepartments(deptRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalidDate(formData.due_date)) {
       
      toast.error("This date is not available. Please select another date.");
      return;
    }
     if (isInvalidDate(formData.start_date)) {
       
      toast.error("This date is not available. Please select another date.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      question: formData.task,
      assignee_id: formData.assignee_id,
      assignee: formData.assignee_name, // Send name as 'assignee' or 'assignee_name' depending on backend. Sending both to be safe or just standardizing.
      assignee_name: formData.assignee_name,
      doer_id: formData.doer_id,
      doer: formData.doer_name,
      doer_name: formData.doer_name,
      priority: formData.priority,
      department: formData.department,
      verification_required: formData.verification_required,
      attachment_required: formData.attachment_required,
      verifier_id: formData.verifier_id,
      verifier_name: formData.verifier_name, // Send name if backend supports it later
      // For Edit, we send due_date. For Create, we send start_date (which becomes from_date/due_date logic)
      due_date: isEditMode ? formData.due_date : formData.start_date,
    };

    if (isEditMode) {
      // Only send updatable fields for task
      try {
        await dispatch(
          updateChecklistTask({ id: checklistToEdit.id, ...payload }),
        ).unwrap();
        toast.success("Checklist updated successfully");
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error updating checklist:", error);
        toast.error("Failed to update checklist: " + error);
      }
    } else {
      // Auto-infer dates/days if not explicitly selected
      let finalWeeklyDays =
        formData.frequency === "weekly" ? formData.weekly_days : [];
      const isDateFrequency = ["monthly", "quarterly", "yearly"].includes(
        formData.frequency,
      );
      let finalSelectedDates = isDateFrequency ? formData.selected_dates : [];

      if (formData.start_date) {
        const startDateObj = new Date(formData.start_date);

        // If weekly and no days selected, use start_date's day
        if (formData.frequency === "weekly" && finalWeeklyDays.length === 0) {
          const dayName = startDateObj.toLocaleDateString("en-US", {
            weekday: "long",
          });
          finalWeeklyDays = [dayName];
        }

        // If monthly/quarterly/yearly and no dates selected, use start_date's date
        if (isDateFrequency && finalSelectedDates.length === 0) {
          finalSelectedDates = [startDateObj.getDate()];
        }
      }

      // Create Master Logic
      const createPayload = {
        ...payload,
        frequency: formData.frequency,
        from_date: formData.start_date,
        weekly_days: finalWeeklyDays,
        selected_dates: finalSelectedDates,
      };

      try {
        await dispatch(createChecklist(createPayload)).unwrap();
        toast.success("Checklist created successfully");
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error creating checklist:", error);
        toast.error("Failed to create checklist: " + error);
      }
    }

    setIsSubmitting(false);
  };

  // Filter helpers
  const filterEmployees = (search) =>
    employees.filter(
      (emp) =>
        `${emp.First_Name} ${emp.Last_Name}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()),
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-card border border-yellow-500/30 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header - Yellow Theme */}
        <div className="px-6 py-4 border-b border-yellow-500/20 bg-yellow-500 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-black/10 text-black flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">
                {isEditMode ? "edit" : "check_box"}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-black tracking-tight leading-tight">
                {isEditMode ? "Edit Checklist Task" : "Add New Checklist"}
              </h2>
              <p className="text-[10px] text-black/70 font-bold uppercase tracking-wider">
                {isEditMode
                  ? "Update task details"
                  : "Tasks will be automatically generated based on frequency"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-black/10 text-black/60 hover:text-black transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6"
        >
          {/* Question/Task */}
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
              Question/Task *
            </label>
            <textarea
              required
              rows="3"
              placeholder="Enter the task or question..."
              className="w-full bg-bg-main border border-border-main rounded-2xl p-4 text-sm text-text-main font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none leading-relaxed"
              value={formData.task}
              onChange={(e) =>
                setFormData({ ...formData, task: e.target.value })
              }
            />
          </div>

          {/* Row: Assignee, Doer, Department */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assignee */}
            <div className="relative group">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
                Assignee
              </label>
              <div
                className="bg-bg-main rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-border-main hover:border-yellow-500/50 transition-all"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "assignee" ? null : "assignee",
                  )
                }
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="size-6 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-[8px] uppercase">
                    {(formData.assignee_name || "A")[0]}
                  </div>
                  <span
                    className={`truncate text-sm font-bold ${formData.assignee_name ? "text-text-main" : "text-text-muted"}`}
                  >
                    {formData.assignee_name || "Select assignee..."}
                  </span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[18px]">
                  expand_more
                </span>
              </div>

              {activeDropdown === "assignee" && (
                <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border-main rounded-xl shadow-xl p-2 flex flex-col max-h-48">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="w-full bg-bg-main border border-border-main rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {filterEmployees(assigneeSearch).map((emp) => (
                      <div
                        key={emp.id}
                        className="p-2 hover:bg-bg-main rounded-lg cursor-pointer flex items-center gap-2 text-xs"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            assignee_id: emp.id,
                            assignee_name: `${emp.First_Name} ${emp.Last_Name}`,
                          });
                          setActiveDropdown(null);
                        }}
                      >
                        <div className="size-6 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold text-[8px] uppercase">
                          {emp.First_Name[0]}
                        </div>
                        <span className="text-text-main font-medium">
                          {emp.First_Name} {emp.Last_Name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Doer */}
            <div className="relative group">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
                Doer
              </label>
              <div
                className="bg-bg-main rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-border-main hover:border-yellow-500/50 transition-all"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "doer" ? null : "doer")
                }
              >
                <span
                  className={`truncate text-sm font-bold ${formData.doer_name ? "text-text-main" : "text-text-muted"}`}
                >
                  {formData.doer_name || "Search doer..."}
                </span>
                <span className="material-symbols-outlined text-text-muted text-[18px]">
                  expand_more
                </span>
              </div>

              {activeDropdown === "doer" && (
                <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border-main rounded-xl shadow-xl p-2 flex flex-col max-h-48">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    className="w-full bg-bg-main border border-border-main rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                    value={doerSearch}
                    onChange={(e) => setDoerSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {filterEmployees(doerSearch).map((emp) => (
                      <div
                        key={emp.id}
                        className="p-2 hover:bg-bg-main rounded-lg cursor-pointer flex items-center gap-2 text-xs"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            doer_id: emp.id,
                            doer_name: `${emp.First_Name} ${emp.Last_Name}`,
                          });
                          setActiveDropdown(null);
                        }}
                      >
                        <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[8px] uppercase">
                          {emp.First_Name[0]}
                        </div>
                        <span className="text-text-main font-medium">
                          {emp.First_Name} {emp.Last_Name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Department */}
            <div className="relative group">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
                Department
              </label>
              <div
                className="bg-bg-main rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-border-main hover:border-yellow-500/50 transition-all"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "department" ? null : "department",
                  )
                }
              >
                <span
                  className={`truncate text-sm font-bold ${formData.department ? "text-text-main" : "text-text-muted"}`}
                >
                  {formData.department || "Select department..."}
                </span>
                <span className="material-symbols-outlined text-text-muted text-[18px]">
                  expand_more
                </span>
              </div>

              {activeDropdown === "department" && (
                <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border-main rounded-xl shadow-xl p-2 flex flex-col max-h-48">
                  <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="p-2 hover:bg-bg-main rounded-lg cursor-pointer flex items-center gap-2 text-xs"
                        onClick={() => {
                          setFormData({ ...formData, department: dept.name });
                          setActiveDropdown(null);
                        }}
                      >
                        <span className="text-text-main font-medium">
                          {dept.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
              Priority *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, priority: p.toLowerCase() })
                  }
                  className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                    formData.priority === p.toLowerCase()
                      ? p === "High"
                        ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                        : p === "Medium"
                          ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20"
                          : "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                      : "bg-bg-main/50 border-transparent text-text-muted hover:bg-bg-main"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence (Frequency) - Create Mode Only */}
          {!isEditMode && (
            <div>
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
                Frequency *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, frequency: f.toLowerCase() })
                      }
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        formData.frequency === f.toLowerCase()
                          ? "bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20"
                          : "bg-bg-main/50 border-transparent text-text-muted hover:bg-bg-main hover:text-text-main"
                      }`}
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Weekly Days Selector */}
          {!isEditMode && formData.frequency === "weekly" && (
            <DaySelector
              selectedDays={formData.weekly_days}
              onChange={(days) =>
                setFormData({ ...formData, weekly_days: days })
              }
            />
          )}

          {/* Date */}
          <div>
            <CustomDatePicker
              label={isEditMode ? "Due Date & Time" : "From Date & Time *"}
              multiple={
                !isEditMode &&
                ["monthly", "quarterly", "yearly"].includes(formData.frequency)
              }
              value={
                !isEditMode &&
                ["monthly", "quarterly", "yearly"].includes(
                  formData.frequency,
                ) &&
                formData.selected_dates?.length > 0 &&
                formData.start_date
                  ? formData.selected_dates.map((day) => {
                      const d = new Date(formData.start_date);
                      d.setDate(day);
                      return d.toISOString();
                    })
                  : isEditMode
                    ? formData.due_date
                    : formData.start_date
              }
              onChange={(val) => {
                if (Array.isArray(val)) {
                  // Handle Multi-Select
                  if (val.length > 0) {
                    const sorted = val.sort();
                    const startDate = sorted[0];
                    const days = sorted.map((d) => new Date(d).getDate());
                    setFormData({
                      ...formData,
                      start_date: startDate,
                      selected_dates: days,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      start_date: "",
                      selected_dates: [],
                    });
                  }
                } else {
                  // Handle Single Select
                  if (isEditMode) {
                    setFormData({ ...formData, due_date: val });
                  } else {
                    setFormData({ ...formData, start_date: val });
                  }
                }
              }}
            />
          </div>

          {/* Toggles */}
          {/* Toggles & Verification Logic */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verification Toggle */}
              <div
                className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${formData.verification_required ? "bg-yellow-500/10 border-yellow-500" : "bg-bg-main border-border-main"}`}
              >
                <span
                  className={`text-xs font-bold ${formData.verification_required ? "text-yellow-600" : "text-text-muted"}`}
                >
                  ✓ Verification Required
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      verification_required: !formData.verification_required,
                    })
                  }
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.verification_required ? "bg-yellow-500" : "bg-gray-700"}`}
                >
                  <div
                    className={`size-4 rounded-full bg-white absolute top-1 transition-all ${formData.verification_required ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>

              {/* Attachment Toggle */}
              <div
                className={`bg-bg-main border border-border-main rounded-2xl p-4 flex items-center justify-between`}
              >
                <span className="text-xs font-bold text-text-muted">
                  📎 Task Attachment Required
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      attachment_required: !formData.attachment_required,
                    })
                  }
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.attachment_required ? "bg-yellow-500" : "bg-gray-700"}`}
                >
                  <div
                    className={`size-4 rounded-full bg-white absolute top-1 transition-all ${formData.attachment_required ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
            </div>

            {/* Verifier Dropdown (Visible only if Verification Required) */}
            {formData.verification_required && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.15em] mb-2 px-1">
                  Verifier Name *
                </label>
                <div className="relative group">
                  <div
                    className="bg-bg-main rounded-2xl p-3 flex items-center justify-between cursor-pointer border border-border-main hover:border-yellow-500/50 transition-all"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "verifier" ? null : "verifier",
                      )
                    }
                  >
                    <span
                      className={`truncate text-sm font-bold ${formData.verifier_name ? "text-text-main" : "text-text-muted"}`}
                    >
                      {formData.verifier_name || "Search verifier..."}
                    </span>
                    <span className="material-symbols-outlined text-text-muted text-[18px]">
                      expand_more
                    </span>
                  </div>

                  {activeDropdown === "verifier" && (
                    <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border-main rounded-xl shadow-xl p-2 flex flex-col max-h-48 bottom-full mb-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search..."
                        className="w-full bg-bg-main border border-border-main rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                        value={verifierSearch}
                        onChange={(e) => setVerifierSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
                        {filterEmployees(verifierSearch).map((emp) => (
                          <div
                            key={emp.id}
                            className="p-2 hover:bg-bg-main rounded-lg cursor-pointer flex items-center gap-2 text-xs"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                verifier_id: emp.id,
                                verifier_name: `${emp.First_Name} ${emp.Last_Name}`,
                              });
                              setActiveDropdown(null);
                            }}
                          >
                            <div className="size-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-[8px] uppercase">
                              {emp.First_Name[0]}
                            </div>
                            <span className="text-text-main font-medium">
                              {emp.First_Name} {emp.Last_Name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-border-main bg-bg-main/30 flex gap-4 shrink-0">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-xl bg-yellow-500 text-black text-[12px] font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="size-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            )}
            <span>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Task"
                  : "Create Checklist"}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-32 py-3.5 rounded-xl bg-bg-main/50 text-text-muted border border-border-main text-[12px] font-black uppercase tracking-widest hover:bg-bg-main hover:text-text-main transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklistModal;
