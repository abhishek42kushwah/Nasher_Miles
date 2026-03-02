import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { useSelector } from "react-redux";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import enUS from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Toolbar Component
const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  const goToCurrent = () => toolbar.onNavigate("TODAY");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-2 gap-4">
      <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
        {format(toolbar.date, "MMMM yyyy")}
      </h2>
      <div className="flex items-center gap-2 bg-bg-main p-1.5 rounded-xl border border-border-main">
        <button
          className="text-text-muted hover:text-text-main transition-colors p-1"
          onClick={goToBack}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95"
          onClick={goToCurrent}
        >
          Today
        </button>
        <button
          className="text-text-muted hover:text-text-main transition-colors p-1"
          onClick={goToNext}
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

// Custom Date Header to match reference
const CustomDateHeader = ({ label, date, delegations }) => {
  const dayDelegations = delegations.filter(
    (d) => new Date(d.due_date).toDateString() === date.toDateString(),
  );

  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-xs sm:text-base font-bold text-text-main">
        {label}
      </span>
      {dayDelegations.length > 0 && (
        <div className="size-5 sm:size-6 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold shadow-sm shadow-yellow-400/20">
          {dayDelegations.length}
        </div>
      )}
    </div>
  );
};

// Custom Event Component with Hover Actions
const CustomEvent = ({ event, user, isAdmin, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const canManage = isAdmin || event.resource?.delegator_id === user?.id;
  const isHoliday = event.resource?.type === "holiday";

  if (isHoliday) {
    return (
      <div className="px-2 py-2 rounded-lg under bg-purple-600 text-white text-xs font-bold">
        🎉 {event.title}
      </div>
    );
  }
  // Determine background color based on priority
  const priority = event.resource?.priority?.toLowerCase();
  let bgColor = "#ef4444"; // default red for high
  if (priority === "medium") bgColor = "#2563eb"; // Deep Blue
  if (priority === "low") bgColor = "#475569"; // Slate

  return (
    <div
      className="relative group h-full w-full flex items-center px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: bgColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 min-w-0 pr-10">
        <p className="text-[10px] font-extrabold text-white truncate uppercase tracking-tight leading-tight">
          {event.title}
        </p>
        <p className="text-[9px] font-bold text-white/80 truncate capitalize">
          {event.resource?.doer_name}
        </p>
      </div>

      {/* Hover Action Overlay */}
      {isHovered && (
        <div className="absolute right-1 top-1 bottom-1 w-24 bg-bg-card rounded-md flex items-center justify-around z-50 animate-in fade-in slide-in-from-right-1 duration-200 border border-border-main shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/delegation/${event.id}`);
            }}
            className="text-yellow-400 hover:scale-110 transition-transform h-8 w-8 flex items-center justify-center p-0"
            title="View"
          >
            <span className="material-symbols-outlined text-base">
              visibility
            </span>
          </button>
          {canManage && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event.resource);
                }}
                className="text-blue-500 hover:scale-110 transition-transform h-8 w-8 flex items-center justify-center p-0"
                title="Edit"
              >
                <span className="material-symbols-outlined text-base">
                  edit
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
                className="text-red-500 hover:scale-110 transition-transform h-8 w-8 flex items-center justify-center p-0"
                title="Delete"
              >
                <span className="material-symbols-outlined text-base">
                  delete
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const DelegationCalendar = ({
  delegations,
  user,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  const { holidays } = useSelector((state) => state.helpTicketConfig);
  const delegationEvents = delegations.map((d) => ({
    id: d.id,
    title: d.delegation_name,
    start: new Date(d.due_date),
    end: new Date(d.due_date),
    allDay: true,
    resource: { ...d, type: "delegation" },
  }));

  /* -------------------------
     HOLIDAY EVENTS
  -------------------------- */
  const holidayEvents = holidays.map((h) => ({
    id: h.id,
    title: h.description,
    start: new Date(h.holiday_date),
    end: new Date(h.holiday_date),
    allDay: true,
    resource: { ...h, type: "holiday" },
  }));

  const events = [...delegationEvents, ...holidayEvents];

  const onNavigate = (newDate) => setDate(newDate);
  const onView = (newView) => setView(newView);

  const eventStyleGetter = (event) => {
    if (event.resource?.type === "holiday") {
      return {
        style: {
          backgroundColor: "#7c3aed",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: 800,
          pointerEvents: "none",
        },
      };
    }
    const priority = event.resource?.priority?.toLowerCase();
    let bgColor = "#ef4444"; // default red
    if (priority === "medium") bgColor = "#2563eb"; // Deep Blue
    if (priority === "low") bgColor = "#475569"; // Slate

    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "8px",
        border: "none",
        padding: "0",
        marginBottom: "6px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
        minHeight: "44px",
        // Ensure event box styling doesn't force width > 100%
        width: "auto",
        maxWidth: "100%",
        marginLeft: "4px",
        marginRight: "4px",
      },
    };
  };

  return (
    <div className="min-h-screen bg-bg-card rounded-2xl p-4 md:p-6 border border-border-main shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
      <style>{`
                .rbc-calendar { 
                    color: var(--muted-text); 
                    font-family: inherit; 
                    height: auto !important; /* Allow calendar to grow */
                    min-height: 900px; /* Minimum height for usability */
                }
                .rbc-header { 
                    border-bottom: 1px solid var(--main-border); 
                    padding: 16px 10px; 
                    font-weight: 800; 
                    color: var(--muted-text); 
                    font-size: 11px; 
                    text-transform: uppercase; 
                    letter-spacing: 0.1em;
                    flex: 1; /* Ensure headers take even width */
                }
                .rbc-month-view { 
                    border: 1px solid var(--main-border); 
                    border-radius: 16px; 
                    overflow: hidden; 
                    background-color: var(--card-bg);
                    position: static; /* Important for auto-height */
                    height: auto !important;
                    display: flex;
                    flex-direction: column;
                }
                .rbc-month-row {
                    flex: unset !important; /* Disable flex-basis: 0% forcing equal height */
                    height: auto !important; /* Allow row to grow */
                    min-height: 150px; /* Minimum height for a row */
                    overflow: visible !important; /* Allow popup to show */
                }
                .rbc-row-bg {
                    height: 100% !important; /* Ensure grid lines stretch */
                }
                .rbc-day-bg { 
                    border-left: 1px solid var(--main-border); 
                    background-color: var(--card-bg);
                    transition: background-color 0.2s; 
                }
                .rbc-day-bg:hover { 
                    background-color: var(--main-bg); 
                }
                .rbc-month-row + .rbc-month-row { 
                    border-top: 1px solid var(--main-border); 
                }
                .rbc-off-range-bg { 
                    background-color: var(--main-bg); 
                    opacity: 0.5; 
                }
                .rbc-today .rbc-day-bg {
                    background-color: var(--main-bg) !important;
                }
                .rbc-date-cell {
                    padding: 4px !important;
                    text-align: left !important;
                }
                .rbc-event { 
                    padding: 2px 4px !important; 
                    margin: 2px 0 !important; /* Remove horizontal margin from class, handled by style prop */
                    cursor: pointer;
                    overflow: visible !important;
                    background: none !important;
                    border: none !important;
                    position: relative;
                    height: auto !important; /* Allow event to grow */
                    white-space: normal !important; /* Allow text wrap */
                    width: auto !important;
                }
                @media (min-width: 768px) {
                    /* .rbc-event { margin: 2px 8px !important; } Remove this as it conflicts */
                }
                .rbc-event:focus { outline: none; }
                .rbc-show-more { 
                    display: none; /* Hide "Show more" - we show all by expanding */
                }
                /* Popup z-index */
                .rbc-event:hover {
                    z-index: 50;
                }
                /* Ensure row content stretches */
                .rbc-row-content {
                    position: static !important;
                    height: auto !important;
                }
                /* MOBILE FIX: Enable horizontal scroll for the grid on small screens 
                   so cells don't get squashed */
                .rbc-calendar {
                    min-width: 800px; /* Force minimum width to trigger scroll on mobile */
                }
            `}</style>
      <div className="overflow-x-auto w-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "auto" }} // Changed from 100% to auto
          eventPropGetter={eventStyleGetter}
          views={["month"]}
          view={view}
          date={date}
          onNavigate={onNavigate}
          onView={onView}
          // showAllEvents={true} // Removed as it's not a standard prop, we handle via CSS
          components={{
            toolbar: CustomToolbar,
            month: {
              dateHeader: (props) => (
                <CustomDateHeader {...props} delegations={delegations} />
              ),
              event: (props) => (
                <CustomEvent
                  {...props}
                  user={user}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
            },
          }}
        />
      </div>
    </div>
  );
};

export default DelegationCalendar;
