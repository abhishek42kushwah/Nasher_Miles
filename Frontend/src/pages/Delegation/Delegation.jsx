import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import CreateDelegationModal from "../../components/delegation/CreateDelegationModal";
import DelegationCard from "../../components/delegation/DelegationCard";
import DelegationCalendar from "../../components/delegation/DelegationCalendar";
import Loader from "../../components/common/Loader";
import {
  fetchDelegations,
  deleteDelegation,
} from "../../store/slices/delegationSlice";
import { fetchHelpTicketConfig } from "../../store/slices/helpTicketConfigSlice";
import toast from "react-hot-toast";

const Delegation = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { delegations, isLoading, error } = useSelector(
    (state) => state.delegation,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("delegationViewMode") || "list",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("delegationViewMode", viewMode);
  }, [viewMode]);
  const [delegationToEdit, setDelegationToEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  // Strict Visibility Logic
  const visibleDelegations = React.useMemo(() => {
    let data = [...delegations];

    // Role-based visibility
    if (!isAdmin) {
      const userId = user?.User_Id || user?.id;
      data = data.filter((d) => d.doer_id === userId);
    }

    // Search (Task name / ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (d) =>
          d.delegation_name?.toLowerCase().includes(term) ||
          String(d.id).includes(term),
      );
    }

    // Department filter
    if (filterDepartment) {
      data = data.filter((d) => d.department === filterDepartment);
    }

    // Status filter
    if (filterStatus) {
      data = data.filter((d) => d.status === filterStatus);
    }

    // Priority filter
    if (filterPriority) {
      data = data.filter((d) => d.priority === filterPriority);
    }

    return data;
  }, [
    delegations,
    isAdmin,
    user,
    searchTerm,
    filterDepartment,
    filterStatus,
    filterPriority,
  ]);

  const getStatCount = (label) => {
    return visibleDelegations.filter((d) => d.status === label).length;
  };

  const stats = [
    {
      label: "NEED CLARITY",
      count: getStatCount("NEED CLARITY"),
      color: "text-amber-500",
      bgColor: "bg-amber-100",
      icon: "help_outline",
    },
    {
      label: "APPROVAL WAITING",
      count: getStatCount("APPROVAL WAITING"),
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      icon: "schedule",
    },
    {
      label: "COMPLETED",
      count: getStatCount("COMPLETED"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-100",
      icon: "check_circle",
    },
    {
      label: "NEED REVISION",
      count: getStatCount("NEED REVISION"),
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      icon: "history",
    },
    {
      label: "HOLD",
      count: getStatCount("HOLD"),
      color: "text-slate-500",
      bgColor: "bg-slate-100",
      icon: "pause_circle",
    },
  ];

  useEffect(() => {
    // Only fetch if we don't have data or it's stale
    if (delegations.length === 0) {
      dispatch(fetchDelegations());
    }
    // Fetch holidays for the calendar
    dispatch(fetchHelpTicketConfig());
  }, [dispatch, delegations.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterStatus, filterPriority]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this delegation?")) {
      setDeletingId(id);
      try {
        await dispatch(deleteDelegation(id)).unwrap();
        toast.success("Delegation deleted successfully");
      } catch (error) {
        console.error("Error deleting delegation:", error);
        toast.error("Failed to delete delegation");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (delegation) => {
    setDelegationToEdit(delegation);
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    if (!visibleDelegations.length) return;

    const headers = [
      "ID",
      "Name",
      "Description",
      "Delegator",
      "Doer",
      "Department",
      "Priority",
      "Due Date",
      "Status",
      "Created At",
    ];
    const rows = visibleDelegations.map((d) => [
      d.id,
      `"${d.delegation_name.replace(/"/g, '""')}"`, // Escape quotes
      `"${(d.description || "").replace(/"/g, '""')}"`,
      d.delegator_name,
      d.doer_name,
      d.department,
      d.priority,
      d.due_date,
      d.status,
      d.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `delegations_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting Logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return (
        <span className="text-slate-400 text-[10px] ml-1 opacity-50">↕</span>
      );
    return sortConfig.direction === "asc" ? (
      <span className="text-white text-[10px] ml-1">↑</span>
    ) : (
      <span className="text-white text-[10px] ml-1">↓</span>
    );
  };

  const sortedDelegations = React.useMemo(() => {
    let sortableItems = [...visibleDelegations];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle dates
        if (["created_at", "due_date"].includes(sortConfig.key)) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        // Handle strings (case insensitive)
        else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }
        // Handle numbers (IDs)
        else {
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }

        return 0;
      });
    }
    return sortableItems;
  }, [visibleDelegations, sortConfig]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems =
    viewMode === "calendar"
      ? visibleDelegations
      : sortedDelegations.slice(indexOfFirstItem, indexOfLastItem); // Calendar usually shows all or its own month view logic
  const totalPages = Math.ceil(visibleDelegations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MainLayout title="Delegations">
      <div className="flex flex-col gap-3 p-1 md:p-2">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-bg-card border border-border-main rounded-lg p-2 flex items-center gap-2 hover:border-primary/30 transition-all shadow-sm"
            >
              <div
                className={`${stat.bgColor} ${stat.color} size-8 rounded-lg flex items-center justify-center shrink-0`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {stat.icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted truncate">
                  {stat.label}
                </p>
                <p className="text-base font-bold text-text-main">
                  {stat.count}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-bg-card border border-border-main rounded-xl p-1.5 shadow-sm">
          {/* View Switcher */}
          <div className="flex bg-bg-main rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "list" ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text-main"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                format_list_bulleted
              </span>
              List
            </button>
            <button
              onClick={() => setViewMode("tiles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "tiles" ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text-main"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                grid_view
              </span>
              Tiles
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "calendar" ? "bg-primary text-white shadow-md" : "text-text-muted hover:text-text-main"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                calendar_month
              </span>
              Calendar
            </button>
          </div>

          {/* Actions Group */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg border border-border-main transition-all flex items-center gap-1.5 text-xs font-bold ${showFilters ? "bg-primary/10 text-primary border-primary" : "text-text-main bg-bg-card hover:bg-bg-main"}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                filter_alt
              </span>
              Filters
            </button>

            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-lg border border-border-main transition-all flex items-center gap-1.5 text-xs font-bold text-text-main bg-bg-card hover:bg-bg-main"
            >
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              Export CSV
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setDelegationToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add New Delegation
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="bg-bg-card border border-border-main rounded-xl p-4 md:p-5 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                  Search Task
                </label>
                <input
                  type="text"
                  placeholder="By name, ID..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                  Department
                </label>
                <select
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="">All Departments</option>
                  {[
                    "HR",
                    "IT",
                    "Finance",
                    "Sales",
                    "Operations",
                    "Customer Service",
                    "Custom"
                  ].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                  Status
                </label>
                <select
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="">All Statuses</option>
                  {[
                    "NEED CLARITY",
                    "APPROVAL WAITING",
                    "COMPLETED",
                    "NEED REVISION",
                    "HOLD",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase px-1">
                  Priority
                </label>
                <select
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader className="w-48 h-48" />
              <p className="mt-2 text-text-muted font-bold text-sm">
                Loading delegations...
              </p>
            </div>
          ) : visibleDelegations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 bg-bg-card border border-border-main rounded-2xl">
              <span className="material-symbols-outlined text-5xl text-text-muted opacity-20 mb-3">
                inventory_2
              </span>
              <p className="font-bold text-text-muted">No delegations found.</p>
            </div>
          ) : (
            <>
              {viewMode === "list" && (
                <div className="bg-bg-card border border-border-main rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse min-w-[1000px] lg:min-w-full">
                      <thead>
                        <tr className="bg-bg-main/40 text-text-muted font-bold uppercase tracking-wider text-[10px] border-b border-border-main">
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("id")}
                          >
                            <div className="flex items-center gap-1">
                              Task ID {getSortIcon("id")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("created_at")}
                          >
                            <div className="flex items-center gap-1">
                              Created {getSortIcon("created_at")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("delegation_name")}
                          >
                            <div className="flex items-center gap-1">
                              Task {getSortIcon("delegation_name")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("delegator_name")}
                          >
                            <div className="flex items-center gap-1">
                              Assignee {getSortIcon("delegator_name")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("doer_name")}
                          >
                            <div className="flex items-center gap-1">
                              Doer {getSortIcon("doer_name")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("department")}
                          >
                            <div className="flex items-center gap-1">
                              Dept {getSortIcon("department")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("priority")}
                          >
                            <div className="flex items-center gap-1">
                              Priority {getSortIcon("priority")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("due_date")}
                          >
                            <div className="flex items-center gap-1">
                              Due Date {getSortIcon("due_date")}
                            </div>
                          </th>
                          <th
                            className="px-5 py-4 cursor-pointer hover:bg-bg-main transition-colors select-none group"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center gap-1">
                              Status {getSortIcon("status")}
                            </div>
                          </th>
                          <th className="px-5 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main">
                        {currentItems.map((del) => (
                          <tr
                            key={del.id}
                            className="hover:bg-bg-main/20 transition-colors group"
                          >
                            <td className="px-5 py-4 font-bold text-text-main text-xs">
                              #{del.id}
                            </td>
                            <td className="px-5 py-4 text-xs font-medium text-text-muted">
                              {new Date(del.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4">
                              <div className="max-w-[200px] md:max-w-xs">
                                <p
                                  className="font-bold text-text-main truncate"
                                  title={del.delegation_name}
                                >
                                  {del.delegation_name}
                                </p>
                                <p className="text-[11px] text-text-muted line-clamp-1">
                                  {del.description || "No description"}
                                </p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase">
                                  {del.delegator_name?.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-text-main line-clamp-1">
                                  {del.delegator_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px] uppercase">
                                  {del.doer_name?.charAt(0)}
                                </div>
                                <span className="text-xs font-medium text-text-main line-clamp-1">
                                  {del.doer_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-xs font-semibold text-text-main">
                                {del.department}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                                  del.priority === "high"
                                    ? "bg-white text-red-600 border-red-200"
                                    : del.priority === "medium"
                                      ? "bg-white text-blue-600 border-blue-200"
                                      : "bg-white text-slate-600 border-slate-200"
                                }`}
                              >
                                {del.priority}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-[11px]">
                                <p className="font-bold text-text-main">
                                  {new Date(del.due_date).toLocaleDateString()}
                                </p>
                                {new Date(del.due_date) < new Date() &&
                                  del.status !== "COMPLETED" && (
                                    <p className="text-red-500 font-bold text-[10px] uppercase">
                                      Overdue
                                    </p>
                                  )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${
                                  del.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : del.status === "NEED CLARITY"
                                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                      : del.status === "APPROVAL WAITING"
                                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                    del.status === "COMPLETED"
                                      ? "bg-emerald-500"
                                      : del.status === "NEED CLARITY"
                                        ? "bg-amber-500"
                                        : del.status === "APPROVAL WAITING"
                                          ? "bg-blue-500"
                                          : "bg-slate-500"
                                  }`}
                                ></span>
                                {del.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() =>
                                    navigate(`/delegation/${del.id}`)
                                  }
                                  className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-primary transition-colors inline-flex items-center justify-center"
                                  title="View Details"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    visibility
                                  </span>
                                </button>
                                {(isAdmin || del.delegator_id === user.id) && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(del)}
                                      className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-amber-500 transition-colors inline-flex items-center justify-center"
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">
                                        edit
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(del.id)}
                                      disabled={deletingId === del.id}
                                      className="p-2 rounded-lg hover:bg-bg-main text-text-muted hover:text-red-500 transition-colors inline-flex items-center justify-center disabled:opacity-50"
                                      title="Delete"
                                    >
                                      {deletingId === del.id ? (
                                        <div className="size-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                                      ) : (
                                        <span className="material-symbols-outlined text-[20px]">
                                          delete
                                        </span>
                                      )}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewMode === "tiles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-in fade-in duration-500">
                  {currentItems.map((del) => (
                    <DelegationCard
                      key={del.id}
                      delegation={del}
                      user={user}
                      isAdmin={isAdmin}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {viewMode === "calendar" && (
                <div className="animate-in fade-in duration-500">
                  <DelegationCalendar
                    delegations={visibleDelegations}
                    user={user}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}

              {/* Pagination Footer */}
              {viewMode !== "calendar" && (
                <div className="bg-bg-card border border-border-main rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm mt-4">
                  <div className="text-sm text-text-muted">
                    Showing{" "}
                    <span className="font-bold text-text-main">
                      {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, visibleDelegations.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-text-main">
                      {visibleDelegations.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-bg-main border border-border-main rounded-lg text-sm font-medium text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Previous
                    </button>
                    {/* Simple page numbers could go here if needed, keeping it simple "Prev/Next" for now as per design */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-bg-main border border-border-main rounded-lg text-sm font-medium text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreateDelegationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDelegations}
        delegationToEdit={delegationToEdit}
      />
    </MainLayout>
  );
};

export default Delegation;
