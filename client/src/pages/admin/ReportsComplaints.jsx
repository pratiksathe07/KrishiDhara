import React, { useState, useEffect, useCallback } from "react";
import { complaintService } from "../../services/complaintService";
import {
  AlertCircle,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  X,
  RefreshCw,
  FileText,
  User,
  Save,
  ShieldAlert,
  ChevronDown,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const categoryLabels = {
  fraud: "Fraud",
  payment: "Payment Issue",
  behavior: "Inappropriate Behavior",
  quality: "Quality Issue",
  app_issue: "App / Technical Issue",
  other: "Other",
};

const ReportsComplaints = () => {
  // Stats & data
  const [stats, setStats] = useState({ total: 0, open: 0, inReview: 0, resolved: 0, rejected: 0 });
  const [complaints, setComplaints] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  });

  // Modal inspection & edit state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalForm, setModalForm] = useState({
    status: "open",
    priority: "medium",
    adminNote: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await complaintService.getComplaintStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch {
      toast.error("Failed to load complaint statistics");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch list
  const fetchComplaints = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const res = await complaintService.getAllComplaints(filters);
      if (res.success) {
        setComplaints(res.data.complaints);
      }
    } catch {
      toast.error("Failed to load complaints");
    } finally {
      setIsLoadingList(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 250); // slight debounce for search input
    return () => clearTimeout(timer);
  }, [fetchComplaints]);

  // Open modal with item details
  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalForm({
      status: complaint.status || "open",
      priority: complaint.priority || "medium",
      adminNote: complaint.adminNote || "",
    });
  };

  // Close modal
  const handleCloseModal = () => {
    if (isSaving) return;
    setSelectedComplaint(null);
  };

  // Save changes from modal
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSaving(true);
    try {
      const res = await complaintService.updateComplaint(selectedComplaint._id, modalForm);
      if (res.success) {
        toast.success("Complaint updated successfully");
        const updated = res.data.complaint;
        // Update item in local list
        setComplaints((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
        setSelectedComplaint(updated);
        // Refresh stats
        fetchStats();
        handleCloseModal();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update complaint");
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setComplaintToDelete(null);
  };

  // Confirm delete complaint
  const handleConfirmDelete = async () => {
    if (!complaintToDelete) return;

    setIsDeleting(true);
    try {
      const res = await complaintService.deleteComplaint(complaintToDelete._id);
      if (res.success) {
        toast.success(res.message || "Complaint deleted successfully");
        // Remove locally from state immediately
        setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
        // If the view/edit details modal is open for this complaint, close it too
        if (selectedComplaint && selectedComplaint._id === complaintToDelete._id) {
          setSelectedComplaint(null);
        }
        // Close delete confirmation modal
        setComplaintToDelete(null);
        // Refresh summary cards and list
        fetchStats();
        fetchComplaints();
      } else {
        toast.error(res.message || "Failed to delete complaint");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete complaint");
    } finally {
      setIsDeleting(false);
    }
  };

  const statCards = [
    {
      title: "Total Reports & Complaints",
      value: stats.total,
      icon: AlertCircle,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Open Issues",
      value: stats.open,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Under Review",
      value: stats.inReview,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Heading & Refresh */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Reports & Complaints Management</h2>
          <p className="text-sm text-white/60">
            Review, investigate, and resolve user issues and marketplace disputes.
          </p>
        </div>
        <button
          onClick={() => {
            fetchStats();
            fetchComplaints();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all self-start sm:self-auto"
        >
          <RefreshCw size={16} className={isLoadingList ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-black/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
          >
            <div className={`h-14 w-14 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color}`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold">
                {isLoadingStats ? "..." : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            placeholder="Search by subject..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 appearance-none pr-9 cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 appearance-none pr-9 cursor-pointer"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="report">Report</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/50 appearance-none pr-9 cursor-pointer"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 uppercase bg-black/50 border-b border-white/10 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Subject & Category</th>
                <th className="px-6 py-4 font-semibold">Raised By</th>
                <th className="px-6 py-4 font-semibold">Against</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingList ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/50">
                    <RefreshCw className="mx-auto animate-spin mb-3 text-green-400" size={28} />
                    <p className="font-medium">Loading complaints and reports...</p>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-white/50">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/30 border border-white/10">
                        <FileText size={32} />
                      </div>
                      <p className="text-base font-semibold text-white/80 mb-1">No reports or complaints found</p>
                      <p className="text-xs text-white/40">
                        There are currently no records matching your selected filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    {/* Subject & Category */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-semibold text-white truncate group-hover:text-green-300 transition-colors">
                          {item.subject}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/5">
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </div>
                    </td>

                    {/* Raised By */}
                    <td className="px-6 py-4">
                      {item.raisedBy ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {item.raisedBy.firstName} {item.raisedBy.lastName}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border
                              ${item.raisedBy.role === "farmer" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                item.raisedBy.role === "labour" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                item.raisedBy.role === "dealer" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                "bg-red-500/10 text-red-400 border-red-500/20"}`}
                            >
                              {item.raisedBy.role}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 font-mono">{item.raisedBy.mobile || "No phone"}</p>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs italic">Unknown User</span>
                      )}
                    </td>

                    {/* Against */}
                    <td className="px-6 py-4">
                      {item.againstUser ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white/90">
                              {item.againstUser.firstName} {item.againstUser.lastName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/60 border border-white/10">
                              {item.againstUser.role}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5 font-mono">{item.againstUser.mobile || ""}</p>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">General / Platform</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider border
                        ${item.type === "complaint"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize border
                        ${item.priority === "high"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : item.priority === "medium"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize border
                        ${item.status === "open"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : item.status === "in_review"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : item.status === "resolved"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                      >
                        {item.status === "resolved" ? (
                          <CheckCircle size={12} />
                        ) : item.status === "in_review" ? (
                          <Activity size={12} />
                        ) : item.status === "rejected" ? (
                          <XCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-white/60 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 hover:border-green-500/30 border border-white/10 rounded-lg text-xs font-medium text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-medium transition-all shadow-sm"
                          title="Delete Complaint"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-950/95 border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border
                    ${selectedComplaint.type === "complaint"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"}`}
                  >
                    {selectedComplaint.type}
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    ID: {selectedComplaint._id}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedComplaint.subject}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6">
              {/* Category & Timestamps Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
                <div>
                  <p className="text-white/50 mb-1">Category</p>
                  <p className="font-semibold text-white">
                    {categoryLabels[selectedComplaint.category] || selectedComplaint.category}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Date Raised</p>
                  <p className="font-semibold text-white">
                    {new Date(selectedComplaint.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Resolution Date</p>
                  <p className="font-semibold text-white">
                    {selectedComplaint.resolvedAt
                      ? new Date(selectedComplaint.resolvedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not Resolved"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-white/60 tracking-wider mb-2">
                  Description
                </h4>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Parties Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Raised By */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">
                    <User size={14} />
                    Raised By
                  </div>
                  {selectedComplaint.raisedBy ? (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm text-white">
                        {selectedComplaint.raisedBy.firstName} {selectedComplaint.raisedBy.lastName}
                      </p>
                      <p className="text-white/70">Role: <span className="capitalize font-medium text-white">{selectedComplaint.raisedBy.role}</span></p>
                      <p className="text-white/70">Phone: <span className="font-mono text-white">{selectedComplaint.raisedBy.mobile}</span></p>
                      <p className="text-white/70 truncate">Email: <span className="text-white">{selectedComplaint.raisedBy.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">Information unavailable</p>
                  )}
                </div>

                {/* Against User */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <ShieldAlert size={14} />
                    Reported Against
                  </div>
                  {selectedComplaint.againstUser ? (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm text-white">
                        {selectedComplaint.againstUser.firstName} {selectedComplaint.againstUser.lastName}
                      </p>
                      <p className="text-white/70">Role: <span className="capitalize font-medium text-white">{selectedComplaint.againstUser.role}</span></p>
                      <p className="text-white/70">Phone: <span className="font-mono text-white">{selectedComplaint.againstUser.mobile}</span></p>
                      <p className="text-white/70 truncate">Email: <span className="text-white">{selectedComplaint.againstUser.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 pt-2">
                      Platform issue or no specific individual reported.
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Action Form */}
              <form onSubmit={handleSaveChanges} className="space-y-4 pt-2 border-t border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Save size={16} className="text-green-400" />
                  Admin Resolution & Status Update
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status selector */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Status
                    </label>
                    <select
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/60"
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    >
                      <option value="open">Open</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Priority selector */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/60"
                      value={modalForm.priority}
                      onChange={(e) => setModalForm({ ...modalForm, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Admin Note textarea */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">
                    Admin Notes / Investigation Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter details on actions taken, communication with parties, or resolution terms..."
                    className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/60 resize-none"
                    value={modalForm.adminNote}
                    onChange={(e) => setModalForm({ ...modalForm, adminNote: e.target.value })}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteModal(selectedComplaint)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                    >
                      {isSaving && <RefreshCw size={14} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {complaintToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-950/95 border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            {/* Top close button */}
            <button
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Header with warning icon */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Complaint</h3>
                <p className="text-xs text-white/50 font-mono">
                  ID: {complaintToDelete._id}
                </p>
              </div>
            </div>

            {/* Confirmation text */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-white/80 leading-relaxed">
                Are you sure you want to delete this complaint? This action cannot be undone.
              </p>
              <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs space-y-1.5">
                <div>
                  <span className="text-white/40">Subject: </span>
                  <span className="font-semibold text-white">{complaintToDelete.subject}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60">
                  <span>
                    Category: <strong className="text-white/90">{categoryLabels[complaintToDelete.category] || complaintToDelete.category}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status: <strong className="capitalize text-white/90">{complaintToDelete.status.replace("_", " ")}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsComplaints;
