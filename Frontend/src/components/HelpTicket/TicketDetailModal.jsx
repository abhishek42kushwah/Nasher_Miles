import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProblemSolvers } from "../../store/slices/masterSlice";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../config";
import useHolidayCheck from "../../hooks/useHolidayCheck";
const TicketDetailModal = ({ ticket, onClose, onUpdate }) => {
  const { token, user } = useSelector((state) => state.auth);
  const { problemSolvers } = useSelector((state) => state.master);
  const dispatch = useDispatch();
  const { isInvalidDate } = useHolidayCheck();
  const [loading, setLoading] = useState(false);
  const [actionTab, setActionTab] = useState("solve"); // 'solve' or 'revise' for Solver
  const [formData, setFormData] = useState({
    // PC Planning
    solver_planned_date: "",
    problem_solver: "",
    pc_status: "Not Done",
    pc_remark: "",
    // Solver
    solver_remark: "",
    proof_upload: null,
    // PC Confirm
    pc_status_stage4: "Pending",
    pc_remark_stage4: "",
    // Closure
    closing_rating: 5,
    closing_status: "Satisfied",
    reraise_date: "",
    remarks: "", // for closure or reraise
  });

  useEffect(() => {
    if (token && !problemSolvers.length) dispatch(fetchProblemSolvers());
  }, [dispatch, token]);

  useEffect(() => {
    if (ticket) {
      setFormData((prev) => ({
        ...prev,
        solver_planned_date: ticket.solver_planned_date
          ? new Date(ticket.solver_planned_date).toISOString().split("T")[0]
          : "",
        problem_solver: ticket.problem_solver || "",
        pc_status: ticket.pc_status || "Not Done",
        pc_remark: ticket.pc_remark || "",
        pc_status_stage4: ticket.pc_status_stage4 || "Pending",
        pc_remark_stage4: ticket.pc_remark_stage4 || "",
      }));
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, proof_upload: e.target.files[0] }));
  };

  // --- Actions ---

  const handlePCPlanning = async () => {
    if (!formData.solver_planned_date || !formData.problem_solver) {
      return toast.error("Solver and Date are required");
    }
        if (isInvalidDate(formData.solver_planned_date)) {
          toast.error(
         "This date is not available. Please select another date."
         );
       return;
       }
    await submitAction(
      `${API_BASE_URL}/api/help-tickets/pc-planning/${ticket.id}`,
      "PUT",
      {
        pc_planned_date: formData.solver_planned_date,
        problem_solver: formData.problem_solver,
        pc_status: formData.pc_status,
        pc_remark: formData.pc_remark,
      },
    );
  };

  const handleSolverAction = async () => {
    if (actionTab === "solve") {
      const data = new FormData();
      data.append("solver_remark", formData.solver_remark);
      if (formData.proof_upload)
        data.append("proof_upload", formData.proof_upload);

      // Use plain fetch for FormData
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/help-tickets/solve/${ticket.id}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: data,
          },
        );
        await handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    } else {
      if (isInvalidDate(formData.solver_planned_date)) {
          toast.error(
         "This date is not available. Please select another date."
         );
       return;
       }
      await submitAction(
        `${API_BASE_URL}/api/help-tickets/revise/${ticket.id}`,
        "PUT",
        {
          solver_planned_date: formData.solver_planned_date,
          solver_remark: formData.solver_remark,
        },
      );
    }
  };

  const handlePCConfirm = async () => {
    await submitAction(
      `${API_BASE_URL}/api/help-tickets/pc-confirm/${ticket.id}`,
      "PUT",
      {
        pc_status_stage4: formData.pc_status_stage4,
        pc_remark_stage4: formData.pc_remark_stage4,
      },
    );
  };

  const handleClosure = async (isReraise = false) => {
        if (isInvalidDate(formData.reraise_date)) {
          toast.error(
         "This date is not available. Please select another date."
         );
       return;
       }
    const url = isReraise
      ? `${API_BASE_URL}/api/help-tickets/reraise/${ticket.id}`
      : `${API_BASE_URL}/api/help-tickets/close/${ticket.id}`;
    const body = isReraise
      ? { remarks: formData.remarks, reraise_date: formData.reraise_date }
      : {
          closing_rating: formData.closing_rating,
          closing_status: formData.closing_status,
          remarks: formData.remarks,
        };
    await submitAction(url, "PUT", body);
  };

  // --- Helper for API ---
  const submitAction = async (url, method, body) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      await handleResponse(res);
    } catch (err) {
      handleError(err);
    }
  };

  const handleResponse = async (res) => {
    setLoading(false);
    if (res.ok) {
      toast.success("Updated successfully");
      if (onUpdate) onUpdate();
      onClose();
    } else {
      const err = await res.json();
      toast.error(err.message || "Failed");
    }
  };

  const handleError = (err) => {
    console.error(err);
    setLoading(false);
    toast.error("Something went wrong");
  };

  if (!ticket) return null;
   
  // RBAC Checks
  const isPC = user?.id === ticket.pc_accountable;
  const isSolver = user?.id === ticket.problem_solver;
  const isRaiser = user?.id === ticket.raised_by;

  // Determine Action Section based on Stage
  const renderActionSection = () => {
    // Stage 1 & 2: PC Planning
    if (parseInt(ticket.current_stage) === 1 || parseInt(ticket.current_stage) === 2) {
      if (!isPC)
        return (
          <p className="text-center text-text-muted italic">
            Waiting for PC to plan...
          </p>
        );
      return (
        <div className="space-y-4 bg-bg-main/50 p-4 rounded-xl border border-border-main">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">edit_calendar</span> PC
            Planning
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Assign Solver
              </label>
              <select
                name="problem_solver"
                value={formData.problem_solver}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
              >
                <option value="">Select Solver</option>
                {problemSolvers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Planned Date
              </label>
              <input
                type="date"
                name="solver_planned_date"
                value={formData.solver_planned_date}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Status
              </label>
              <select
                name="pc_status"
                value={formData.pc_status}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
              >
                <option value="Not Done">Not Done</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Remarks
              </label>
              <input
                type="text"
                name="pc_remark"
                value={formData.pc_remark}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
              />
            </div>
          </div>
          <button
            onClick={handlePCPlanning}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2 rounded-lg"
          > 
           {loading ? "Saving..." : "Save Plan"}
          </button>
        </div>
      );
    }

    // Stage 3: Solver
    if (parseInt(ticket.current_stage) === 3) {
      if (!isSolver)
        return (
          <p className="text-center text-text-muted italic">
            Waiting for Solver...
          </p>
        );
      return (
        <div className="space-y-4 bg-bg-main/50 p-4 rounded-xl border border-border-main">
          <div className="flex bg-bg-card rounded-lg p-1 border border-border-main">
            <button
              onClick={() => setActionTab("solve")}
              disabled={loading}
              className={`flex-1 py-1 rounded-md text-sm font-bold ${actionTab === "solve" ? "bg-primary text-white" : "text-text-muted"}`}
            >
              Mark Solved
            </button>
            <button
              onClick={() => setActionTab("revise")}
              disabled={loading}
              className={`flex-1 py-1 rounded-md text-sm font-bold ${actionTab === "revise" ? "bg-amber-500 text-white" : "text-text-muted"}`}
            >
              Revise Date
            </button>
          </div>

          {actionTab === "solve" ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">
                  Proof Upload
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">
                  Remarks
                </label>
                <textarea
                  name="solver_remark"
                  value={formData.solver_remark}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
                  rows="2"
                ></textarea>
              </div>
              <button
                onClick={handleSolverAction}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? "Submitting..." : "Submit Solution"}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">
                  New Planned Date
                </label>
                <input
                  type="date"
                  name="solver_planned_date"
                  value={formData.solver_planned_date}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">
                  Reason for Revision
                </label>
                <textarea
                  name="solver_remark"
                  value={formData.solver_remark}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
                  rows="2"
                ></textarea>
              </div>
              <button
                onClick={handleSolverAction}
                disabled={loading}
                className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? "Updating..." : "Update Date"}
              </button>
            </>
          )}
        </div>
      );
    }

    // Stage 4: PC Confirmation
    if (parseInt(ticket.current_stage) === 4) {
      // Only if status is SOLVED, ideally stage 3 complete
      if (!isPC)
        return (
          <p className="text-center text-text-muted italic">
            Waiting for PC Confirmation...
          </p>
        );
      return (
        <div className="space-y-4 bg-bg-main/50 p-4 rounded-xl border border-border-main">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">verified</span> PC
            Confirmation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Status
              </label>
              <select
                name="pc_status_stage4"
                value={formData.pc_status_stage4}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
                disabled={loading}
              >
                <option value="Pending">Pending</option>
                <option value="Confident">Confident</option>
                <option value="Not Confident">Not Confident</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted">
                Remarks
              </label>
              <input
                type="text"
                name="pc_remark_stage4"
                value={formData.pc_remark_stage4}
                onChange={handleChange}
                className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
                disabled={loading}
              />
            </div>
          </div>
          <button
            onClick={handlePCConfirm}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : "Confirm & Proceed"}
          </button>
        </div>
      );
    }

    // Stage 5: Closure
    if (parseInt(ticket.current_stage) === 5 || ticket.status === "CONFIRMED") {
      if (!isRaiser)
        return (
          <p className="text-center text-text-muted italic">
            Waiting for Raiser Closure...
          </p>
        );
      return (
        <div className="space-y-4 bg-bg-main/50 p-4 rounded-xl border border-border-main">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">task_alt</span> Closure
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-muted">
              Remarks / Feedback
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
              rows="2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-muted">
              Reraise Date
            </label>
            <input
              type="date"
              name="reraise_date"
              value={formData.reraise_date}
              onChange={handleChange}
              className="w-full bg-bg-card border p-2 rounded-lg text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleClosure(true)}
              disabled={loading}
              className="w-full bg-red-500 text-white font-bold py-2 rounded-lg
  flex items-center justify-center gap-2"
            >
             
              {loading ? "Reraising..." : "Reraise Ticket"}
            </button>
            <button
              onClick={() => handleClosure(false)}
              disabled={loading}
              className="w-full bg-emerald-500 text-white font-bold py-2 rounded-lg"
            >
              Close Successfully
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-bg-card border border-border-main w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-main/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                confirmation_number
              </span>
              #{ticket.help_ticket_no}
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase mt-1 inline-block">
              {ticket.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-bg-main text-text-muted transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Read-Only Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">
                Issue
              </label>
              <p className="font-medium">{ticket.issue_description}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">
                Location
              </label>
              <p className="font-medium">{ticket.location}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">
                {ticket.reraise_date ? "Reraise Date" : "Desired Date"}
              </label>
              <p className="font-medium">
                {ticket.reraise_date
                  ? ticket.reraise_date?.split("T")[0]
                  : ticket.desired_date?.split("T")[0]}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase">
                PC Owner
              </label>
              <p className="font-medium">{ticket.pc_name}</p>
            </div>
            {ticket.image_upload && (
              <div className="col-span-2">
                <a
                  href={ticket.image_upload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    attachment
                  </span>{" "}
                  View Attachment
                </a>
              </div>
            )}
          </div>

          {renderActionSection()}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
