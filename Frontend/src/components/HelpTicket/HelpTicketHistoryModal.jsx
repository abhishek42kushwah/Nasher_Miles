import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getHelpTicketHistoryById } from "../../store/slices/masterSlice";

const IMPORTANT_FIELDS_BY_ACTION = {
  DATE_REVISED: ["solver_planned_date"],
};

const normalizeValue = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" && val.trim() === "") return null;
  return val;
};

const formatValue = (val) => {
  const normalized = normalizeValue(val);
  if (normalized === null) return "-";


  if (typeof normalized === "string" && normalized.includes("T")) {
    return new Date(normalized).toLocaleDateString();
  }

  if (typeof normalized === "object") {
    return Object.entries(normalized)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }

  return String(normalized);
};



const getChangedFields = (oldVal = {}, newVal = {}, actionType) => {
  const changes = [];
  const importantFields = IMPORTANT_FIELDS_BY_ACTION[actionType] || [];

  Object.keys(newVal || {}).forEach((key) => {
    const oldValue = normalizeValue(oldVal?.[key]);
    const newValue = normalizeValue(newVal?.[key]);

    // Skip empty → empty
    if (oldValue === null && newValue === null) return;

    const isChanged =
      JSON.stringify(oldValue) !== JSON.stringify(newValue);

    const isImportant = importantFields.includes(key);

    
    if (isChanged || isImportant) {
      changes.push({
        field: key,
        oldValue,
        newValue,
        important: isImportant,
      });
    }
  });

  return changes;
};


const DiffRow = ({ field, oldValue, newValue, important }) => {
  return (
    <div
      className={`grid grid-cols-12 gap-3 items-start text-xs ${
        important
          ? "ring-1 ring-primary/40 rounded-lg p-1 bg-primary/5"
          : ""
      }`}
    >
      {/* Field */}
      <div className="col-span-3 text-text-muted font-semibold capitalize break-words">
        {field.replaceAll("_", " ")}
      </div>

      {/* Old */}
      <div className="col-span-4 bg-red-50 text-red-700 px-3 py-2 rounded-lg break-words max-h-24 overflow-auto">
        {formatValue(oldValue)}
      </div>

      {/* New */}
      <div className="col-span-5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg break-words max-h-24 overflow-auto font-semibold">
        {formatValue(newValue)}
      </div>
    </div>
  );
};

/* ===================== MAIN COMPONENT ===================== */

const HelpTicketHistoryModal = ({ ticketId, onClose }) => {
  const dispatch = useDispatch();
  const { helpTicketHistory, isLoading } = useSelector(
    (state) => state.master
  );

  useEffect(() => {
    if (ticketId) {
      dispatch(getHelpTicketHistoryById(ticketId));
    }
  }, [ticketId, dispatch]);

  if (!ticketId) return null;

  const histories = helpTicketHistory?.data || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border-main w-full max-w-5xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* ================= HEADER ================= */}
        <div className="p-5 border-b border-border-main flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-text-main">
              Ticket History
            </h2>
            <p className="text-xs text-text-muted">
              Ticket ID: {ticketId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-bg-main"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="p-6 space-y-8">

          {isLoading && (
            <p className="text-center text-sm text-text-muted">
              Loading history...
            </p>
          )}

          {!isLoading && histories.length === 0 && (
            <p className="text-center text-sm text-text-muted">
              No history found
            </p>
          )}

          {histories.map((item) => {
            const {
              id,
              ticket_no,
              stage,
              action_type,
              action_by,
              action_date,
              remarks,
              old_values,
              new_values,
            } = item;

            const changes = getChangedFields(
              old_values,
              new_values,
              action_type
            );

            return (
              <div
                key={id}
                className="border border-border-main rounded-xl p-5 bg-bg-main/40 space-y-4"
              >
                {/* Meta */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wide">
                      {action_type.replaceAll("_", " ")}
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Stage {stage} •{" "}
                      {new Date(action_date).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Ticket: {ticket_no}
                    </p>
                  </div>

                  <span className="text-[11px] text-text-muted">
                    By User #{action_by}
                  </span>
                </div>

                {/* Remarks */}
                {remarks && remarks.trim() !== "" && (
                  <div className="bg-bg-main/50 p-3 rounded-lg text-xs">
                    <strong>Remarks:</strong> {remarks}
                  </div>
                )}

                {/* Changes */}
                {changes.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-text-muted">
                      <span className="col-span-3">Field</span>
                      <span className="col-span-4">Old</span>
                      <span className="col-span-5">New</span>
                    </div>

                    {changes.map((chg) => (
                      <DiffRow
                        key={chg.field}
                        field={chg.field}
                        oldValue={chg.oldValue}
                        newValue={chg.newValue}
                        important={chg.important}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HelpTicketHistoryModal;
