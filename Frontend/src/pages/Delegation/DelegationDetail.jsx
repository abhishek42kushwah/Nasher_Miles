import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { parseArrayField } from "../../utils/format";
import { API_BASE_URL } from "../../config";
import MainLayout from "../../components/layout/MainLayout";
import Loader from "../../components/common/Loader";
import {
  fetchDelegationById,
  updateDelegationStatus,
  addDelegationRemark,
} from "../../store/slices/delegationSlice";
import toast from "react-hot-toast";
import useHolidayCheck from "../../hooks/useHolidayCheck";
const DelegationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
  const { isInvalidDate } = useHolidayCheck();

  // Try to get delegation from Redux cache first
  const cachedDelegation = useSelector(
    (state) => state.delegation.delegationsById[id],
  );
  const isFetching = useSelector((state) => state.delegation.isFetching);

  const [delegation, setDelegation] = useState(cachedDelegation || null);
  const [loading, setLoading] = useState(!cachedDelegation);

  useEffect(() => {
    // If we have cached data, use it immediately
    if (cachedDelegation) {
      setDelegation(cachedDelegation);

      // Critical Fix: If the cached delegation comes from the LIST view, it lacks remarks_detail/revision_history
      // So we MUST fetch if these missing, even if we are showing the cached data.
      if (
        !cachedDelegation.remarks_detail ||
        !cachedDelegation.revision_history_detail
      ) {
        // Background fetch - keeps UI responsive but updates with full info
        dispatch(fetchDelegationById(id));
      }

      setLoading(false);
    } else {
      // Nothing in cache, show loader and fetch
      setLoading(true);
      dispatch(fetchDelegationById(id))
        .unwrap()
        .then((data) => {
          setDelegation(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching delegation details:", error);
          setLoading(false);
        });
    }
  }, [id, cachedDelegation, dispatch]);

  // Status Update State
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [revisedDueDate, setRevisedDueDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    // Reset specific fields when switching status
    if (status !== "APPROVAL WAITING") setEvidenceFiles([]);
    if (status !== "NEED REVISION" && status !== "HOLD") setRevisedDueDate("");
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setEvidenceFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    // Validation: Ensure evidence is uploaded if required and status is APPROVAL WAITING
    if (selectedStatus === "APPROVAL WAITING" && delegation.evidence_required) {
      if (evidenceFiles.length === 0) {
        toast.error("Evidence is required for approval");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const payload = {
        id,
        status: selectedStatus,
        remark: remark, // Send remark if present
      };

      // Validation: Ensure revised due date is provided for REVISION/HOLD
      // Validation: Ensure revised due date is provided for REVISION/HOLD
      if (selectedStatus === "NEED REVISION" || selectedStatus === "HOLD") {
        if (!revisedDueDate) {
          toast.error("Please provide a revised due date");
          setIsUpdating(false);
          return;
        }

        if (isInvalidDate(revisedDueDate)) {
          toast.error(
            "Selected date is not available. Please choose another date.",
          );
          setIsUpdating(false);
          return;
        }

        payload.due_date = revisedDueDate;
      }

      await dispatch(updateDelegationStatus(payload)).unwrap();
      toast.success("Status updated successfully");
      // Reset fields
      setRemark("");
      setRevisedDueDate("");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status: " + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRemarkOnly = async () => {
    if (!remark.trim()) {
      toast.error("Please enter a remark");
      return;
    }

    setIsAddingRemark(true);
    try {
      await dispatch(addDelegationRemark({ id, remark })).unwrap();
      setRemark("");
      toast.success("Remark added successfully");
    } catch (error) {
      console.error("Failed to add remark:", error);
      toast.error("Failed to add remark: " + error);
    } finally {
      setIsAddingRemark(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Delegation Details">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <Loader className="w-48 h-48" />
          <p className="mt-2 text-text-muted font-bold animate-pulse">
            Loading details...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (!delegation) {
    return (
      <MainLayout title="Delegation Details">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <span className="material-symbols-outlined text-6xl text-text-muted opacity-20 mb-4">
            error_outline
          </span>
          <h2 className="text-xl font-bold text-text-main">
            Delegation Not Found
          </h2>
          <button
            onClick={() => navigate("/delegation")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-bold"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }
  const referenceDocs = parseArrayField(delegation.reference_docs);
  return (
    <MainLayout title={`Delegation #${delegation.id}`}>
      <div className="max-w-full mx-auto p-2 md:p-3 space-y-3">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-1">
              <button
                onClick={() => navigate("/delegation")}
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                Delegations
              </button>
              <span>/</span>
              <span>Details</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main leading-tight">
              {delegation.delegation_name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                delegation.status === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-700"
                  : delegation.status === "NEED CLARITY"
                    ? "bg-amber-100 text-amber-700"
                    : delegation.status === "APPROVAL WAITING"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
              }`}
            >
              {delegation.status}
            </span>
            <button className="size-10 rounded-xl bg-bg-card border border-border-main flex items-center justify-center hover:bg-bg-main transition-colors text-text-main">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-3">
            {/* Core Information Card */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  info
                </span>
                Core Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase">
                    Department
                  </label>
                  <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-primary">
                      corporate_fare
                    </span>
                    {delegation.department}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase">
                    Priority
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-2.5 rounded-full ${delegation.priority === "high" ? "bg-red-500" : delegation.priority === "medium" ? "bg-blue-500" : "bg-slate-500"}`}
                    ></span>
                    <p className="text-xs font-bold text-text-main capitalize">
                      {delegation.priority}
                    </p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase">
                    Deadline
                  </label>
                  <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-orange-500">
                      event
                    </span>
                    {new Date(delegation.due_date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase">
                    Evidence Required
                  </label>
                  <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                    {delegation.evidence_required ? (
                      <>
                        <span className="material-symbols-outlined text-base text-emerald-500">
                          check_circle
                        </span>
                        Yes
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base text-slate-400">
                          cancel
                        </span>
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">
                  description
                </span>
                Execution Instructions
              </h2>
              <p className="text-xs text-text-main leading-relaxed whitespace-pre-wrap">
                {delegation.description}
              </p>
            </div>

            {/* Attachments Card */}
            {(delegation.voice_note_url ||
              (delegation.reference_docs &&
                delegation.reference_docs.length > 0)) && (
              <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm">
                <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    attach_file
                  </span>
                  Attachments
                </h2>

                <div className="space-y-4">
                  {delegation.voice_note_url && (
                    <div className="bg-bg-main/50 rounded-2xl p-4 border border-border-main flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">mic</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-main mb-1">
                          Voice Briefing
                        </p>
                        <audio
                          controls
                          src={(() => {
                            const url = delegation.voice_note_url;
                            if (
                              url &&
                              (url.includes("drive.google.com") ||
                                url.includes("docs.google.com"))
                            ) {
                              const match =
                                url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                                url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                              if (match && match[1]) {
                                return `${API_BASE_URL}/api/delegations/audio/${match[1]}`;
                              }
                            }
                            return url;
                          })()}
                          className="w-full h-8"
                        />
                      </div>
                    </div>
                  )}

                  {referenceDocs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {referenceDocs.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-bg-main/50 border border-border-main hover:border-primary/50 hover:bg-bg-main transition-all group"
                        >
                          <div className="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-lg">
                              description
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-main truncate group-hover:text-primary">
                              Document {idx + 1}
                            </p>
                            <p className="text-[10px] text-text-muted">
                              Click to view
                            </p>
                          </div>

                          <span className="material-symbols-outlined text-text-muted ml-auto text-sm">
                            open_in_new
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Update Section */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-text-white uppercase tracking-widest flex items-center gap-2">
                Update Status
              </h2>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-text-muted uppercase">
                  Select Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {user?.id === delegation?.doer_id && (
                    <button
                      onClick={() => handleStatusSelect("NEED CLARITY")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === "NEED CLARITY" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-bg-main text-text-muted hover:bg-bg-main/80 border border-border-main"}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        help
                      </span>
                      Need Clarity
                    </button>
                  )}
                  {user?.id === delegation?.doer_id && (
                    <button
                      onClick={() => handleStatusSelect("APPROVAL WAITING")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === "APPROVAL WAITING" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-bg-main text-text-muted hover:bg-bg-main/80 border border-border-main"}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        hourglass_top
                      </span>
                      Approval Waiting
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleStatusSelect("COMPLETED")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === "COMPLETED" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-bg-main text-text-muted hover:bg-bg-main/80 border border-border-main"}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        check
                      </span>
                      Completed
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => handleStatusSelect("NEED REVISION")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === "NEED REVISION" ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-bg-main text-text-muted hover:bg-bg-main/80 border border-border-main"}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        sync
                      </span>
                      Need Revision
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleStatusSelect("HOLD")}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedStatus === "HOLD" ? "bg-slate-600 text-white shadow-lg shadow-slate-600/20" : "bg-bg-main text-text-muted hover:bg-bg-main/80 border border-border-main"}`}
                    >
                      <span className="material-symbols-outlined text-base">
                        pause
                      </span>
                      Hold
                    </button>
                  )}
                </div>
              </div>

              {/* Conditional Fields */}
              {(selectedStatus === "NEED REVISION" ||
                selectedStatus === "HOLD") && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase">
                    Revised Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={revisedDueDate}
                    onChange={(e) => setRevisedDueDate(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              )}

              {/* Remark Field (Always Visible) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase">
                  Add Remark
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your remark..."
                  className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors h-24 resize-none"
                />
              </div>

              {/* Evidence Upload (Only for Approval Waiting) */}
              {selectedStatus === "APPROVAL WAITING" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase">
                    Attach Evidence{" "}
                    {delegation.evidence_required && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border-main rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-bg-main/50 hover:border-primary/30 transition-all group"
                  >
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <span className="material-symbols-outlined text-3xl text-text-muted group-hover:text-primary transition-colors mb-2">
                      add
                    </span>
                    <p className="text-sm font-bold text-text-muted group-hover:text-text-main transition-colors">
                      Click to select evidence files
                    </p>
                    <p className="text-[10px] text-text-muted opacity-60 mt-1">
                      Accepted: PDF, DOC, JPG, PNG, MP4
                    </p>
                  </div>
                  {evidenceFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {evidenceFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="bg-bg-main border border-border-main rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-xs"
                        >
                          <span className="text-xs text-text-main truncate max-w-[150px]">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-text-muted hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-base">
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || isAddingRemark}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-colors shadow-lg shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating && (
                    <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  )}
                  <span>{isUpdating ? "Updating..." : "Update Status"}</span>
                </button>
                <button
                  onClick={handleAddRemarkOnly}
                  disabled={isUpdating || isAddingRemark}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingRemark && (
                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  )}
                  <span>
                    {isAddingRemark ? "Adding..." : "Add Remark Only"}
                  </span>
                </button>
              </div>
            </div>

            {/* History Sections */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-text-main mb-4">
                  Remark History
                </h3>
                {delegation.remarks_detail &&
                delegation.remarks_detail.length > 0 ? (
                  <div className="space-y-4">
                    {delegation.remarks_detail.map((rem) => (
                      <div
                        key={rem.id}
                        className="bg-bg-card border border-border-main p-3 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-text-main">
                            {rem.username}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(rem.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">{rem.remark}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted text-sm border-t border-border-main">
                    No remarks yet
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main mb-4">
                  Revision History
                </h3>
                {delegation.revision_history_detail &&
                delegation.revision_history_detail.length > 0 ? (
                  <div className="space-y-4">
                    {delegation.revision_history_detail.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-bg-card border border-border-main p-3 rounded-xl"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-text-main">
                            {rev.changed_by}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(rev.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                            Old: {new Date(rev.old_due_date).toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            New: {new Date(rev.new_due_date).toLocaleString()}
                          </span>
                        </div>
                        {rev.reason && (
                          <p className="text-xs text-text-muted mt-1 italic">
                            Reason: {rev.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted text-sm border-t border-border-main">
                    No revision history yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - People & Meta */}
          <div className="space-y-3">
            {/* People Card */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">
                Involved Parties
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase shrink-0">
                    {delegation.delegator_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">
                      Assigned By
                    </p>
                    <p className="text-sm font-bold text-text-main">
                      {delegation.delegator_name}
                    </p>
                    <button className="text-[10px] font-bold text-primary hover:underline mt-1">
                      View Profile
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-border-main"></div>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg uppercase shrink-0">
                    {delegation.doer_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">
                      Assigned To
                    </p>
                    <p className="text-sm font-bold text-text-main">
                      {delegation.doer_name}
                    </p>
                    <button className="text-[10px] font-bold text-primary hover:underline mt-1">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-bg-card border border-border-main rounded-2xl p-4 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-muted font-bold">Created On</span>
                  <span className="text-text-main font-bold">
                    {new Date(delegation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-muted font-bold">
                    Delegation ID
                  </span>
                  <span className="text-text-main font-mono bg-bg-main px-2 py-0.5 rounded">
                    #{delegation.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DelegationDetail;
