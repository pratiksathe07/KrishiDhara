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
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      title: "Open Issues",
      value: stats.open,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      title: "Under Review",
      value: stats.inReview,
      icon: Activity,
      color: "text-[#3b38e4]",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-800">
      {/* Top Heading & Refresh */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Reports & Complaints Management</h2>
          <p className="text-sm text-slate-500 font-medium">
            Review, investigate, and resolve user issues and marketplace disputes.
          </p>
        </div>
        <button
          onClick={() => {
            fetchStats();
            fetchComplaints();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw size={16} className={isLoadingList ? "animate-spin text-[#3b38e4]" : ""} />
          Refresh Data
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-6 flex items-center gap-5 hover:border-[#3b38e4]/50 hover:shadow-md transition-all shadow-sm"
          >
            <div className={`h-14 w-14 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-extrabold text-slate-900">
                {isLoadingStats ? "..." : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by subject..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition-colors"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] appearance-none pr-9 cursor-pointer font-medium"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] appearance-none pr-9 cursor-pointer font-medium"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="report">Report</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] appearance-none pr-9 cursor-pointer font-medium"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Subject & Category</th>
                <th className="px-6 py-4 font-bold">Raised By</th>
                <th className="px-6 py-4 font-bold">Against</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">Priority</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingList ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="mx-auto animate-spin mb-3 text-[#3b38e4]" size={28} />
                    <p className="font-semibold">Loading complaints and reports...</p>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-slate-500">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400 border border-slate-200">
                        <FileText size={32} />
                      </div>
                      <p className="text-base font-bold text-slate-900 mb-1">No reports or complaints found</p>
                      <p className="text-xs text-slate-500">
                        There are currently no records matching your selected filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Subject & Category */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-bold text-slate-900 truncate group-hover:text-[#3b38e4] transition-colors">
                          {item.subject}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {categoryLabels[item.category] || item.category}
                        </span>
                      </div>
                    </td>

                    {/* Raised By */}
                    <td className="px-6 py-4">
                      {item.raisedBy ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {item.raisedBy.firstName} {item.raisedBy.lastName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                              ${item.raisedBy.role === "farmer" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                item.raisedBy.role === "labour" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                item.raisedBy.role === "dealer" ? "bg-indigo-50 text-[#3b38e4] border-indigo-200" :
                                "bg-purple-50 text-purple-700 border-purple-200"}`}
                            >
                              {item.raisedBy.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.raisedBy.mobile || "No phone"}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unknown User</span>
                      )}
                    </td>

                    {/* Against */}
                    <td className="px-6 py-4">
                      {item.againstUser ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {item.againstUser.firstName} {item.againstUser.lastName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              {item.againstUser.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.againstUser.mobile || ""}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">General / Platform</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                        ${item.type === "complaint"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-indigo-50 text-[#3b38e4] border-indigo-200"}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
                        ${item.priority === "high"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : item.priority === "medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"}`}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize border
                        ${item.status === "open"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "in_review"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"}`}
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
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap font-medium">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-sm"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative text-slate-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border
                    ${selectedComplaint.type === "complaint"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-indigo-50 text-[#3b38e4] border-indigo-200"}`}
                  >
                    {selectedComplaint.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedComplaint._id}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedComplaint.subject}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6">
              {/* Category & Timestamps Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                <div>
                  <p className="text-slate-500 mb-1 font-semibold">Category</p>
                  <p className="font-bold text-slate-900">
                    {categoryLabels[selectedComplaint.category] || selectedComplaint.category}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1 font-semibold">Date Raised</p>
                  <p className="font-bold text-slate-900">
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
                  <p className="text-slate-500 mb-1 font-semibold">Resolution Date</p>
                  <p className="font-bold text-slate-900">
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
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Description
                </h4>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Parties Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Raised By */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <User size={14} />
                    Raised By
                  </div>
                  {selectedComplaint.raisedBy ? (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm text-slate-900">
                        {selectedComplaint.raisedBy.firstName} {selectedComplaint.raisedBy.lastName}
                      </p>
                      <p className="text-slate-600">Role: <span className="capitalize font-semibold text-slate-900">{selectedComplaint.raisedBy.role}</span></p>
                      <p className="text-slate-600">Phone: <span className="font-semibold text-slate-900">{selectedComplaint.raisedBy.mobile}</span></p>
                      <p className="text-slate-600 truncate">Email: <span className="font-semibold text-slate-900">{selectedComplaint.raisedBy.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Information unavailable</p>
                  )}
                </div>

                {/* Against User */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <ShieldAlert size={14} />
                    Reported Against
                  </div>
                  {selectedComplaint.againstUser ? (
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-sm text-slate-900">
                        {selectedComplaint.againstUser.firstName} {selectedComplaint.againstUser.lastName}
                      </p>
                      <p className="text-slate-600">Role: <span className="capitalize font-semibold text-slate-900">{selectedComplaint.againstUser.role}</span></p>
                      <p className="text-slate-600">Phone: <span className="font-semibold text-slate-900">{selectedComplaint.againstUser.mobile}</span></p>
                      <p className="text-slate-600 truncate">Email: <span className="font-semibold text-slate-900">{selectedComplaint.againstUser.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 pt-2">
                      Platform issue or no specific individual reported.
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Action Form */}
              <form onSubmit={handleSaveChanges} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Save size={16} className="text-[#3b38e4]" />
                  Admin Resolution & Status Update
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Status
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] font-medium"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] font-medium"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Notes / Investigation Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter details on actions taken, communication with parties, or resolution terms..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] resize-none"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={isSaving}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-sm font-semibold text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#3b38e4] hover:bg-[#302dc4] text-white rounded-xl text-sm font-semibold shadow-md shadow-[#3b38e4]/25 transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
            {/* Top close button */}
            <button
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Header with warning icon */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Complaint</h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {complaintToDelete._id}
                </p>
              </div>
            </div>

            {/* Confirmation text */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Are you sure you want to delete this complaint? This action cannot be undone.
              </p>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs space-y-1.5">
                <div>
                  <span className="text-slate-400">Subject: </span>
                  <span className="font-bold text-slate-900">{complaintToDelete.subject}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
                  <span>
                    Category: <strong className="text-slate-900">{categoryLabels[complaintToDelete.category] || complaintToDelete.category}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status: <strong className="capitalize text-slate-900">{complaintToDelete.status.replace("_", " ")}</strong>
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200/80 text-sm font-semibold text-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
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
