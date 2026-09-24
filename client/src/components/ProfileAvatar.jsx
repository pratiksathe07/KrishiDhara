import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadProfilePicture, deleteProfilePicture } from "../services/userService";
import { Camera, Upload, Trash2, X, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Resolves full URL for profile image.
 * Handles relative paths with Vite proxy or absolute URLs.
 */
export const getProfileImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith("http")) {
    const origin = apiBase.replace(/\/api\/?$/, "");
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  }
  return path;
};

/**
 * Generates initials from first and last name.
 * e.g., "Siddhi B" -> "SB"
 */
const getInitials = (firstName = "", lastName = "") => {
  const f = firstName.trim()[0] || "";
  const l = lastName.trim()[0] || "";
  return (f + l).toUpperCase() || "KD";
};

/**
 * Role-based gradient for initials avatar background
 */
const getRoleGradient = (role = "") => {
  switch (role) {
    case "dealer":
      return "from-blue-500 to-indigo-600";
    case "farmer":
      return "from-emerald-500 to-teal-700";
    case "labour":
      return "from-amber-500 to-orange-600";
    default:
      return "from-emerald-500 to-teal-700";
  }
};

const ProfileAvatar = () => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef(null);

  const initials = getInitials(user?.firstName, user?.lastName);
  const roleGradient = getRoleGradient(user?.role);
  const hasCustomPicture = Boolean(user?.profilePicture) && !imageError;

  // Clean up object URL when component unmounts or selectedFile changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading]);

  const handleOpen = () => {
    setErrorMessage("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setErrorMessage("");
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");

    // Validate MIME type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage("Please select a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }

    // Validate File Size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage("Image is too large. Maximum file size is 5MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      const res = await uploadProfilePicture(formData);

      if (res.data?.success) {
        const newUrl = res.data.data.profilePicture;
        // Update local auth context immediately
        updateUser({ profilePicture: newUrl });
        setImageError(false);
        toast.success(res.data.message || "Profile picture updated successfully.");
        handleClose();
      } else {
        setErrorMessage(res.data?.message || "Failed to update profile picture.");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred while uploading.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await deleteProfilePicture();
      if (res.data?.success) {
        updateUser({ profilePicture: "" });
        setImageError(false);
        toast.success("Profile picture removed successfully.");
        handleClose();
      } else {
        setErrorMessage(res.data?.message || "Failed to remove profile picture.");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred while removing picture.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Circular Header Avatar ── */}
      <button
        type="button"
        onClick={handleOpen}
        title="Click to change profile picture"
        aria-label="Profile picture and settings"
        className="relative group shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform active:scale-95 cursor-pointer shadow-md"
      >
        <div className="w-full h-full rounded-full overflow-hidden border border-white/30 bg-gray-800 flex items-center justify-center">
          {hasCustomPicture ? (
            <img
              src={getProfileImageUrl(user.profilePicture)}
              alt={`${user?.firstName || "User"}'s profile`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-tr ${roleGradient} flex items-center justify-center text-white font-bold text-xs sm:text-sm tracking-wider select-none shadow-inner`}>
              {initials}
            </div>
          )}
        </div>

        {/* Hover Camera Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
          <Camera className="w-4 h-4 text-white drop-shadow-md" />
        </div>
      </button>

      {/* ── Upload Modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-full max-w-md backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-2xl shadow-2xl p-6 text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 id="modal-title" className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-emerald-400" />
                Profile Picture
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs sm:text-sm animate-in fade-in duration-150">
                {errorMessage}
              </div>
            )}

            {/* Avatar Preview Area */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-gray-800 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="New preview"
                    className="w-full h-full object-cover"
                  />
                ) : hasCustomPicture ? (
                  <img
                    src={getProfileImageUrl(user.profilePicture)}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${roleGradient} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl tracking-wider select-none`}>
                    {initials}
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-white/60 text-center">
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : "Upload a JPG, PNG, or WEBP image up to 5MB."}
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Modal Actions */}
            <div className="flex flex-col gap-2.5">
              {selectedFile ? (
                /* When file is selected: Save or Choose Different */
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Picture
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl && previewUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(null);
                      setErrorMessage("");
                    }}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Choose Photo button */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {hasCustomPicture ? "Choose New Picture" : "Upload Picture"}
                </button>
              )}

              {/* Remove Existing Picture option */}
              {hasCustomPicture && !selectedFile && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Current Picture
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileAvatar;
