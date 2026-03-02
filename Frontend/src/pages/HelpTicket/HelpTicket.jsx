import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../components/layout/MainLayout";
import HelpTicketForm from "../../components/HelpTicket/HelpTicketForm";
import HelpTicketTracker from "../../components/HelpTicket/HelpTicketTracker";
import HelpTicketHistoryModal from "../../components/HelpTicket/HelpTicketHistoryModal";
import TicketDetailModal from "../../components/HelpTicket/TicketDetailModal";
import { toast } from "react-hot-toast";
import Loader from "../../components/common/Loader";
import { API_BASE_URL } from "../../config";
import { RotateCcw } from "lucide-react";
const HelpTicket = () => {
  const { token } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/help-tickets?filter_type=${activeTab}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTickets();
  }, [token, activeTab]);

  const handleFormSuccess = () => {
    fetchTickets();
    setIsFormOpen(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <MainLayout title="Help Ticket System">
      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">
              Help Desk
            </h1>
            <p className="text-text-muted text-sm font-medium">
              Raise tickets, track progress, and resolve issues efficiently.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Raise New Ticket
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border-main">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`pb-3 px-1 relative font-bold text-sm transition-colors ${
              activeTab === "assigned"
                ? "text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Assigned to Me
            {activeTab === "assigned" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("raised")}
            className={`pb-3 px-1 relative font-bold text-sm transition-colors ${
              activeTab === "raised"
                ? "text-primary"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            Raised by Me
            {activeTab === "raised" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Ticket List & Tracking */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                list_alt
              </span>
              Active Tickets
            </h2>
            <span className="bg-bg-card border border-border-main px-3 py-1 rounded-full text-xs font-bold text-text-muted">
              {tickets.length} TOTAL
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader className="w-48 h-48" />
              <p className="mt-2 text-text-muted font-bold text-sm">
                Loading Help Tickets
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-bg-card border border-border-main rounded-2xl border-dashed text-center">
              <span className="material-symbols-outlined text-6xl text-text-muted mb-4 opacity-20">
                history_edu
              </span>
              <h3 className="text-lg font-bold text-text-main">
                No Tickets Found
              </h3>
              <p className="text-text-muted max-w-xs mx-auto text-sm">
                You haven't raised any tickets yet. Click "Raise New Ticket" to
                get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="
    w-full
    bg-bg-card border border-border-main rounded-2xl
    overflow-hidden shadow-sm hover:shadow-md
    transition-all group hover:border-primary/30
    flex flex-col
  "
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Ticket Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-primary tracking-wider uppercase">
                          #{ticket.help_ticket_no}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                        <span className="relative group inline-flex">
                          {ticket.reraise_date && (
                            <>
                              <RotateCcw className="w-5 h-5 text-red-500 cursor-pointer" />

                              {/* Tooltip */}
                              <span
                                className="absolute bottom-full mt-6 hidden group-hover:block
        whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white shadow"
                              >
                                Ticket Reraised
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-text-muted bg-bg-main px-3 py-1 rounded-lg">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2 flex justify-between flex-1">
                      <h3 className="text-lg font-bold text-text-main leading-tight line-clamp-2">
                        {ticket.issue_description}
                      </h3>
                      <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          location_on
                        </span>
                        {ticket.location}
                      </span>
                    </div>

                    {ticket.image_upload && (
                      <div className="mb-4">
                        <a
                          href={ticket.image_upload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            attachment
                          </span>
                          View Attachment
                        </a>
                      </div>
                    )}

                    {/* Tracker Section */}
                    <div className="mb-6 pt-4 border-t border-border-main/50">
                      <HelpTicketTracker currentStage={ticket.current_stage} />
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-border-main/50 space-y-4">
                      {/* TOP ROW → 3 DETAILS IN ONE ROW */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                            Raised By
                          </span>
                          <span className="text-xs font-bold text-text-main truncate">
                            {ticket.raiser_name}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                            PC Owner
                          </span>
                          <span className="text-xs font-bold text-text-main truncate">
                            {ticket.pc_name || "Unassigned"}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                            Solver
                          </span>
                          <span className="text-xs font-bold text-text-main truncate">
                            {ticket.solver_name || "Unassigned"}
                          </span>
                        </div>
                      </div>

                      {/* BOTTOM ROW → BOTH BUTTONS */}
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="bg-bg-main hover:bg-border-main text-text-main
      font-bold py-1.5 px-6 rounded-lg text-xs
      transition-colors flex items-center gap-2"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => {
                            setSelectedHistory(ticket.id);
                            setOpenModal(true);
                          }}
                          className="bg-bg-main hover:bg-border-main text-text-main
  font-bold py-1.5 px-3 rounded-lg text-xs
  transition-colors flex items-center gap-2"
                        >
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offcanvas Overlay & Panel */}
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isFormOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsFormOpen(false)}
        ></div>

        {/* Sliding Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isFormOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border-main flex items-center justify-between bg-bg-main/50">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                New Request
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="size-8 flex items-center justify-center rounded-full hover:bg-bg-main text-text-muted transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <HelpTicketForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      </div>
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            fetchTickets();
            // Optional: Keep modal open or close it? Usually close on success which is handled in modal
          }}
        />
      )}
      {openModal && selectedHistory && (
        <HelpTicketHistoryModal
          show={openModal}
          ticketId={selectedHistory}
          onClose={() => {
            setOpenModal(false);
            setSelectedHistory(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default HelpTicket;
