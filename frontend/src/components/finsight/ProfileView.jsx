import React, { useState, useEffect } from "react";
import { User, Shield, Clock, Laptop, Smartphone, Globe, KeyRound, Download, Trash2, CheckCircle2, XCircle, AlertTriangle, Search, Bell, LogOut, Sliders, DollarSign, CreditCard, Layers, History, Lock, } from "lucide-react";
import { FinSightAPI, } from "../../services/finsightApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
export const ProfileView = () => {
    const { user: authUser, logout } = useAuth();
    // Active Tab
    const [activeTab, setActiveTab] = useState("profile");
    // State
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    // Activity Timeline State
    const [activities, setActivities] = useState([]);
    const [activityCategory, setActivityCategory] = useState("ALL");
    const [activitySearch, setActivitySearch] = useState("");
    const [activityCounts, setActivityCounts] = useState({});
    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditRiskFilter, setAuditRiskFilter] = useState("ALL");
    const [auditOutcomeFilter, setAuditOutcomeFilter] = useState("ALL");
    // Notification Preferences State
    const [notifPrefs, setNotifPrefs] = useState({
        emailNewLogin: true,
        emailFailedLogin: true,
        emailPasswordChange: true,
        emailBudgetAlert: true,
        emailBillDue: true,
        emailWeeklyDigest: false,
        pushOverspend: true,
        inAppAlerts: true,
    });
    // Modals
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [changeAvatarModalOpen, setChangeAvatarModalOpen] = useState(false);
    // Form states
    const [profileForm, setProfileForm] = useState({
        fullName: "",
        phone: "",
        username: "",
        country: "India",
        preferredCurrency: "INR",
        timezone: "Asia/Kolkata",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        revokeOthers: true,
    });
    const [deleteForm, setDeleteForm] = useState({
        confirmEmail: "",
        password: "",
    });
    const [avatarUrlInput, setAvatarUrlInput] = useState("");
    const presetAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    ];
    // Load all data
    const loadData = async () => {
        setLoading(true);
        try {
            const [prof, sess, hist, acts, logs] = await Promise.all([
                FinSightAPI.getProfile().catch(() => null),
                FinSightAPI.getSessions().catch(() => []),
                FinSightAPI.getLoginHistory().catch(() => []),
                FinSightAPI.getActivities({ category: activityCategory, search: activitySearch }).catch(() => ({ activities: [], pagination: {}, categoryCounts: {} })),
                FinSightAPI.getAuditLogs({ riskLevel: auditRiskFilter, outcome: auditOutcomeFilter }).catch(() => ({ logs: [], pagination: {} })),
            ]);
            if (prof) {
                setProfileData(prof);
                setProfileForm({
                    fullName: prof.personalInfo.fullName,
                    phone: prof.personalInfo.phone || "",
                    username: prof.personalInfo.username || "",
                    country: prof.personalInfo.country || "India",
                    preferredCurrency: prof.personalInfo.preferredCurrency,
                    timezone: prof.personalInfo.timezone,
                });
                if (prof.notificationPreferences) {
                    setNotifPrefs(prof.notificationPreferences);
                }
            }
            setSessions(sess);
            setLoginHistory(hist);
            setActivities(acts.activities || []);
            setActivityCounts(acts.categoryCounts || {});
            setAuditLogs(logs.logs || []);
        }
        catch (err) {
            toast.error("Failed to load profile details");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    // Filter activities dynamically
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await FinSightAPI.getActivities({
                    category: activityCategory,
                    search: activitySearch,
                });
                setActivities(res.activities || []);
                setActivityCounts(res.categoryCounts || {});
            }
            catch {
                // Fallback
            }
        };
        fetchActivities();
    }, [activityCategory, activitySearch]);
    // Filter audit logs dynamically
    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await FinSightAPI.getAuditLogs({
                    riskLevel: auditRiskFilter,
                    outcome: auditOutcomeFilter,
                });
                setAuditLogs(res.logs || []);
            }
            catch {
                // Fallback
            }
        };
        fetchAudit();
    }, [auditRiskFilter, auditOutcomeFilter]);
    // Action: Save Profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await FinSightAPI.updateProfile(profileForm);
            toast.success("Profile updated successfully!");
            setEditProfileModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error(err.message || "Failed to update profile");
        }
    };
    // Action: Change Avatar
    const handleSaveAvatar = async (url) => {
        try {
            await FinSightAPI.updateAvatar(url);
            toast.success("Profile picture updated!");
            setChangeAvatarModalOpen(false);
            loadData();
        }
        catch (err) {
            toast.error(err.message || "Failed to update profile picture");
        }
    };
    // Action: Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        try {
            await FinSightAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                revokeOthers: passwordForm.revokeOthers,
            });
            toast.success("Password changed successfully!");
            setChangePasswordModalOpen(false);
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                revokeOthers: true,
            });
            loadData();
        }
        catch (err) {
            toast.error(err.message || "Failed to change password");
        }
    };
    // Action: Revoke specific session
    const handleRevokeSession = async (sessionId) => {
        try {
            await FinSightAPI.revokeSession(sessionId);
            toast.success("Device session revoked successfully");
            loadData();
        }
        catch (err) {
            toast.error(err.message || "Failed to revoke session");
        }
    };
    // Action: Revoke all other sessions
    const handleRevokeOtherSessions = async () => {
        try {
            const res = await FinSightAPI.revokeOtherSessions();
            toast.success(`Revoked other active sessions.`);
            loadData();
        }
        catch (err) {
            toast.error(err.message || "Failed to revoke other sessions");
        }
    };
    // Action: Revoke all sessions (Log out everywhere)
    const handleRevokeAllSessions = async () => {
        try {
            await FinSightAPI.revokeAllSessions();
            toast.success("All device sessions revoked. Signing out...");
            setTimeout(() => logout(), 1200);
        }
        catch (err) {
            toast.error(err.message || "Failed to revoke all sessions");
        }
    };
    // Action: Update Notification Preferences
    const handleTogglePref = async (key, value) => {
        const updated = { ...notifPrefs, [key]: value };
        setNotifPrefs(updated);
        try {
            await FinSightAPI.updateNotificationPreferences(updated);
            toast.success("Notification preferences updated");
        }
        catch {
            toast.error("Failed to update preferences");
        }
    };
    // Action: Export GDPR User Data
    const handleExportData = async () => {
        try {
            toast.info("Preparing complete GDPR data archive...");
            await FinSightAPI.exportUserData();
            toast.success("GDPR Account Data downloaded successfully!");
        }
        catch (err) {
            toast.error("Failed to export account data");
        }
    };
    // Action: Export Activity CSV
    const handleExportActivityCsv = async () => {
        try {
            await FinSightAPI.exportActivityCsv();
            toast.success("Activity history CSV downloaded");
        }
        catch {
            toast.error("Failed to export activity history");
        }
    };
    // Action: Delete Account
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        try {
            await FinSightAPI.deleteAccount(deleteForm);
            toast.success("Account deactivated. Terminating session...");
            setDeleteAccountModalOpen(false);
            setTimeout(() => logout(), 1500);
        }
        catch (err) {
            toast.error(err.message || "Failed to deactivate account");
        }
    };
    // Helper date formatter in user's timezone
    const formatDate = (dateStr) => {
        if (!dateStr)
            return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };
    const getRelativeTime = (dateStr) => {
        if (!dateStr)
            return "Never";
        const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
        if (diff < 60)
            return "Just now";
        if (diff < 3600)
            return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };
    const userInitials = profileData?.personalInfo?.fullName
        ? profileData.personalInfo.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "FS";
    return (<div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#21352f]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Account, Security & Audit Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16a57a]/10 text-[#16a57a] border border-[#16a57a]/20">
              Pro Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, active device sessions, security credentials, and compliance activity logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportData} className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#1a2f29] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors">
            <Download size={14} className="text-[#16a57a]"/>
            <span>Export GDPR Data</span>
          </button>
          <button onClick={() => setEditProfileModalOpen(true)} className="px-3.5 py-1.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors">
            <User size={14}/>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#21352f] overflow-x-auto pb-px">
        {[
            { id: "profile", label: "User Profile", icon: User },
            { id: "sessions", label: "Security & Devices", icon: Laptop, badge: sessions.filter(s => s.status === "ACTIVE").length },
            { id: "activity", label: "Activity Timeline", icon: History, badge: activityCounts.ALL || activities.length },
            { id: "audit", label: "Security Audit Logs", icon: Shield },
            { id: "notifications", label: "Alert Preferences", icon: Bell },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${isActive
                    ? "border-[#16a57a] text-[#16a57a]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>
              <Icon size={15}/>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (<span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive
                        ? "bg-[#16a57a] text-white"
                        : "bg-slate-100 dark:bg-[#1a2f29] text-slate-600 dark:text-slate-400"}`}>
                  {tab.badge}
                </span>)}
            </button>);
        })}
      </div>

      {/* TAB 1: USER PROFILE & ACCOUNT INFORMATION */}
      {activeTab === "profile" && (<div className="space-y-6">
          {/* Profile Overview Card */}
          <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => setChangeAvatarModalOpen(true)}>
                {profileData?.personalInfo?.avatarUrl ? (<img src={profileData.personalInfo.avatarUrl} alt="User Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#16a57a]/30 shadow-md"/>) : (<div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#16a57a] to-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {userInitials}
                  </div>)}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  Change
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                    {profileData?.personalInfo?.fullName || "Arjun Sharma"}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {profileData?.accountInfo?.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  @{profileData?.personalInfo?.username || "arjunsharma"} • {profileData?.personalInfo?.email || authUser?.email}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Globe size={13} className="text-[#16a57a]"/>
                    {profileData?.personalInfo?.country || "India"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#16a57a]"/>
                    {profileData?.personalInfo?.timezone || "Asia/Kolkata"}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={13}/>
                    Currency: {profileData?.personalInfo?.preferredCurrency || "INR"} (₹)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button onClick={() => setChangePasswordModalOpen(true)} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#1a2f29] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors">
                <Lock size={14} className="text-amber-500"/>
                <span>Change Password</span>
              </button>
              <button onClick={() => setEditProfileModalOpen(true)} className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Sliders size={14}/>
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2f29]">
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <User size={16} className="text-[#16a57a]"/>
                  <span>Personal Information</span>
                </h3>
                <button onClick={() => setEditProfileModalOpen(true)} className="text-xs text-[#16a57a] hover:underline font-semibold">
                  Edit
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Full Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {profileData?.personalInfo?.fullName || "Arjun Sharma"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Username</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    @{profileData?.personalInfo?.username || "arjunsharma"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Email Address</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {profileData?.personalInfo?.email || authUser?.email}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10}/> Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Phone Number</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {profileData?.personalInfo?.phone || "+91 98765 43210"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10}/> Verified
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Country & Region</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {profileData?.personalInfo?.country || "India"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Preferred Currency</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {profileData?.personalInfo?.preferredCurrency || "INR"} (Indian Rupee)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Time Zone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {profileData?.personalInfo?.timezone || "Asia/Kolkata (UTC+05:30)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status & Credentials */}
            <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1a2f29]">
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={16} className="text-[#16a57a]"/>
                  <span>Account Status & Security</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ID: {profileData?.accountInfo?.userId?.slice(0, 8)}...
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Account Tier</span>
                  <span className="px-2 py-0.5 rounded-md font-bold bg-[#16a57a]/15 text-[#16a57a]">
                    PRO SUITE
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Account Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                    Active & Good Standing
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Two-Factor Authentication</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {profileData?.accountInfo?.twoFactorEnabled ? "Enabled" : "Disabled (Recommended)"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Last Profile Update</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(profileData?.accountInfo?.lastProfileUpdate)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Last Password Change</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(profileData?.accountInfo?.lastPasswordChange)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Active Device Sessions</span>
                  <span className="font-bold text-[#16a57a]">
                    {profileData?.accountInfo?.activeSessions || 1} Active Sessions
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Member Since</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(profileData?.personalInfo?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Snapshot Summary Table (Section 14.B) */}
          <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-[#16a57a]"/>
              <span>Real-Time Activity Snapshot</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#172c26]/40 border border-slate-100 dark:border-[#21352f]">
                <p className="text-[11px] text-slate-400 font-medium">Last Seen / Active</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {getRelativeTime(profileData?.accountInfo?.lastSeen)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatDate(profileData?.accountInfo?.lastSeen)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#172c26]/40 border border-slate-100 dark:border-[#21352f]">
                <p className="text-[11px] text-slate-400 font-medium">Last Login</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {getRelativeTime(profileData?.accountInfo?.lastLogin)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatDate(profileData?.accountInfo?.lastLogin)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#172c26]/40 border border-slate-100 dark:border-[#21352f]">
                <p className="text-[11px] text-slate-400 font-medium">Last Explicit Logout</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {profileData?.accountInfo?.lastLogout ? getRelativeTime(profileData.accountInfo.lastLogout) : "None recorded"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {profileData?.accountInfo?.lastLogout ? formatDate(profileData.accountInfo.lastLogout) : "Active session"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#172c26]/40 border border-slate-100 dark:border-[#21352f]">
                <p className="text-[11px] text-slate-400 font-medium">Total Activity Events</p>
                <p className="text-sm font-bold text-[#16a57a] mt-1">
                  {profileData?.accountInfo?.totalActivities || activities.length} Events
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Complete audit tracking</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-200/60 dark:border-rose-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={15}/> Danger Zone: Deactivate Account
              </h4>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-1">
                Deactivating your account will instantly revoke all sessions and lock access to financial intelligence.
              </p>
            </div>
            <button onClick={() => setDeleteAccountModalOpen(true)} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
              <Trash2 size={14}/>
              <span>Deactivate Account</span>
            </button>
          </div>
        </div>)}

      {/* TAB 2: SECURITY & DEVICE SESSIONS (SECTION 14.C) */}
      {activeTab === "sessions" && (<div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Active Devices & Sessions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review and manage all desktop, mobile, and browser sessions currently logged into your FinSight AI account.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleRevokeOtherSessions} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#1a2f29] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors">
                <LogOut size={13} className="text-amber-500"/>
                <span>Log out other devices</span>
              </button>
              <button onClick={handleRevokeAllSessions} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs">
                <LogOut size={13}/>
                <span>Log out all devices</span>
              </button>
            </div>
          </div>

          {/* Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => {
                const isPhone = session.operatingSystem?.includes("iOS") || session.operatingSystem?.includes("Android");
                const Icon = isPhone ? Smartphone : Laptop;
                const isRevoked = session.status === "REVOKED";
                return (<div key={session.id} className={`p-5 rounded-2xl border transition-all ${session.isCurrent
                        ? "bg-white dark:bg-[#121f1c] border-[#16a57a] shadow-xs ring-1 ring-[#16a57a]/20"
                        : isRevoked
                            ? "bg-slate-50 dark:bg-[#0e1816] border-slate-200/50 dark:border-[#1a2f29]/40 opacity-60"
                            : "bg-white dark:bg-[#121f1c] border-slate-200 dark:border-[#21352f]"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.isCurrent
                        ? "bg-[#16a57a]/15 text-[#16a57a]"
                        : isRevoked
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                            : "bg-slate-100 dark:bg-[#1a2f29] text-slate-600 dark:text-slate-300"}`}>
                        <Icon size={20}/>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {session.deviceName || "Desktop Workstation"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {session.browser} • {session.operatingSystem}
                        </p>
                      </div>
                    </div>

                    {session.isCurrent ? (<span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16a57a]/15 text-[#16a57a] border border-[#16a57a]/30">
                        Current Device
                      </span>) : isRevoked ? (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                        Revoked
                      </span>) : (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1a2f29] space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Approx. Location:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {session.location || "Bengaluru, India"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>IP Address:</span>
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {session.ipAddress || "127.0.0.1"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>First Signed In:</span>
                      <span>{formatDate(session.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Active:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {getRelativeTime(session.lastActiveAt)}
                      </span>
                    </div>
                  </div>

                  {!isRevoked && (<div className="mt-4">
                      {session.isCurrent ? (<p className="text-[11px] text-center text-slate-400 italic">
                          Your active session token is cryptographically protected.
                        </p>) : (<button onClick={() => handleRevokeSession(session.id)} className="w-full py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-colors">
                          Revoke Session
                        </button>)}
                    </div>)}
                </div>);
            })}
          </div>

          {/* Login History Table (Section 14.B) */}
          <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound size={16} className="text-[#16a57a]"/>
                  <span>Recent Login History & Attempts</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audited login attempts with status, user-agent parsing, IP, and location.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1a2f29] text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Device & Browser</th>
                    <th className="py-2.5 px-3">Operating System</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2f29]">
                  {loginHistory.map((item) => (<tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#172c26]/30">
                      <td className="py-3 px-3">
                        {item.status === "SUCCESS" ? (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 size={11}/> Success
                          </span>) : (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600" title={item.failureReason || "Failed"}>
                            <XCircle size={11}/> Failed
                          </span>)}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {item.device || "Desktop"} • {item.browser || "Chrome"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {item.os || "Windows"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {item.location || "Bengaluru, India"}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {item.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {/* TAB 3: ACTIVITY TIMELINE (SECTION 14.D & 14.E) */}
      {activeTab === "activity" && (<div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Activity History & Event Feed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete chronological timeline of your account changes, transactions, payments, and integrations.
              </p>
            </div>

            <button onClick={handleExportActivityCsv} className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#1a2f29] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors self-start md:self-auto">
              <Download size={14} className="text-[#16a57a]"/>
              <span>Export CSV</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f]">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: "All Activities" },
                { id: "ACCOUNT", label: "Account" },
                { id: "FINANCIAL", label: "Financial" },
                { id: "PAYMENTS", label: "Payments" },
                { id: "SECURITY", label: "Security" },
                { id: "INTEGRATION", label: "Integrations" },
            ].map((c) => (<button key={c.id} onClick={() => setActivityCategory(c.id)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${activityCategory === c.id
                    ? "bg-[#16a57a] text-white"
                    : "bg-slate-100 dark:bg-[#1a2f29] text-slate-600 dark:text-slate-300 hover:bg-slate-200"}`}>
                  <span>{c.label}</span>
                  {activityCounts[c.id] !== undefined && (<span className="text-[10px] opacity-80">({activityCounts[c.id]})</span>)}
                </button>))}
            </div>

            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
              <input type="text" placeholder="Search events..." value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#21352f] dark:bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#16a57a]"/>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f]">
            {activities.length === 0 ? (<div className="py-12 text-center text-slate-400 text-xs">
                No activity records found matching your filters.
              </div>) : (<div className="relative border-l-2 border-slate-100 dark:border-[#1a2f29] ml-4 space-y-6">
                {activities.map((act) => {
                    let Icon = Layers;
                    let iconColor = "bg-blue-500/10 text-blue-600";
                    if (act.category === "FINANCIAL") {
                        Icon = DollarSign;
                        iconColor = "bg-emerald-500/10 text-emerald-600";
                    }
                    else if (act.category === "PAYMENTS") {
                        Icon = CreditCard;
                        iconColor = "bg-amber-500/10 text-amber-600";
                    }
                    else if (act.category === "SECURITY") {
                        Icon = Shield;
                        iconColor = "bg-purple-500/10 text-purple-600";
                    }
                    else if (act.category === "ACCOUNT") {
                        Icon = User;
                        iconColor = "bg-slate-500/10 text-slate-600";
                    }
                    return (<div key={act.id} className="relative pl-6 group">
                      {/* Timeline Dot Icon */}
                      <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#121f1c] ${iconColor}`}>
                        <Icon size={12}/>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {act.title}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1a2f29] text-slate-500">
                              {act.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            {act.description}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-400 whitespace-nowrap sm:text-right">
                          <span>{formatDate(act.createdAt)}</span>
                          {act.sourceDevice && (<p className="text-[10px] text-slate-500">{act.sourceDevice}</p>)}
                        </div>
                      </div>

                      {act.metadata && (<div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-[#172c26]/30 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {JSON.stringify(act.metadata)}
                        </div>)}
                    </div>);
                })}
              </div>)}
          </div>
        </div>)}

      {/* TAB 4: SECURITY AUDIT LOGS (SECTION 14.F) */}
      {activeTab === "audit" && (<div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                  Compliance & Security Audit Trail
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Append-Only Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable security logs tracking access, authentication events, data exports, and privileged account modifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select value={auditRiskFilter} onChange={(e) => setAuditRiskFilter(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-semibold dark:bg-[#121f1c]">
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">Critical Risk</option>
              </select>

              <select value={auditOutcomeFilter} onChange={(e) => setAuditOutcomeFilter(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-semibold dark:bg-[#121f1c]">
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="DENIED">Denied</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1a2f29] text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Event Action</th>
                  <th className="py-2.5 px-3">Entity Affected</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">IP & Client</th>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1a2f29]">
                {auditLogs.map((log) => {
                let riskColor = "bg-slate-100 text-slate-600";
                if (log.riskLevel === "LOW")
                    riskColor = "bg-blue-500/10 text-blue-600";
                if (log.riskLevel === "MEDIUM")
                    riskColor = "bg-amber-500/10 text-amber-600";
                if (log.riskLevel === "HIGH")
                    riskColor = "bg-orange-500/10 text-orange-600";
                if (log.riskLevel === "CRITICAL")
                    riskColor = "bg-rose-500/10 text-rose-600";
                return (<tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#172c26]/30">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${riskColor}`}>
                          {log.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {log.entityType} ({log.entityId?.slice(0, 8)}...)
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.outcome === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-600"}`}>
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(log.createdAt).toUTCString()}
                      </td>
                    </tr>);
            })}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* TAB 5: ALERT PREFERENCES (SECTION 14.G) */}
      {activeTab === "notifications" && (<div className="p-6 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Security & Financial Alert Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure which alerts trigger instant in-app alerts and notifications to {profileData?.personalInfo?.email}.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Alerts</h3>

            {[
                {
                    id: "emailNewLogin",
                    title: "Login from New Device / Browser",
                    desc: "Send an alert whenever your account is accessed from an unrecognized browser or device.",
                },
                {
                    id: "emailFailedLogin",
                    title: "Failed Login Threshold Warning",
                    desc: "Notify when multiple failed authentication attempts occur within 15 minutes.",
                },
                {
                    id: "emailPasswordChange",
                    title: "Password & Security Credential Changes",
                    desc: "Immediate alert when password is changed or sessions are revoked.",
                },
            ].map((item) => (<div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#172c26]/30 border border-slate-100 dark:border-[#21352f]">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <input type="checkbox" checked={!!notifPrefs[item.id]} onChange={(e) => handleTogglePref(item.id, e.target.checked)} className="w-4 h-4 accent-[#16a57a] rounded cursor-pointer"/>
              </div>))}

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3">Financial Alerts</h3>

            {[
                {
                    id: "emailBudgetAlert",
                    title: "Budget Warning & Exceeded Notifications",
                    desc: "Notify when category spending reaches 80% or exceeds 100% of defined budget.",
                },
                {
                    id: "emailBillDue",
                    title: "Upcoming Bill & Subscription Due Dates",
                    desc: "Alerts 3 days prior to recurring bill execution or payment order renewal.",
                },
                {
                    id: "pushOverspend",
                    title: "AI Overspending Anomaly Alerts",
                    desc: "Real-time warnings when unusual spending velocity is detected.",
                },
                {
                    id: "inAppAlerts",
                    title: "Real-time In-App Notification Center",
                    desc: "Display badge indicators and instant notifications in FinSight dashboard.",
                },
            ].map((item) => (<div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#172c26]/30 border border-slate-100 dark:border-[#21352f]">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <input type="checkbox" checked={!!notifPrefs[item.id]} onChange={(e) => handleTogglePref(item.id, e.target.checked)} className="w-4 h-4 accent-[#16a57a] rounded cursor-pointer"/>
              </div>))}
          </div>
        </div>)}

      {/* MODAL 1: EDIT PROFILE */}
      {editProfileModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#21352f] shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Edit Profile Information
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Full Name</label>
                <input type="text" required value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Username</label>
                <input type="text" required value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Phone Number</label>
                <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Preferred Currency</label>
                  <select value={profileForm.preferredCurrency} onChange={(e) => setProfileForm({ ...profileForm, preferredCurrency: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-[#121f1c]">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-medium">Country</label>
                  <input type="text" value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Time Zone</label>
                <select value={profileForm.timezone} onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-[#121f1c]">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC Universal</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditProfileModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#21352f] font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#16a57a] hover:bg-[#138e69] text-white font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* MODAL 2: CHANGE PASSWORD */}
      {changePasswordModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#21352f] shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Lock size={16} className="text-[#16a57a]"/>
              <span>Change Account Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-medium">Current Password</label>
                <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">New Password (min 8 chars)</label>
                <input type="password" required minLength={8} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 font-medium">Confirm New Password</label>
                <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="revokeOthers" checked={passwordForm.revokeOthers} onChange={(e) => setPasswordForm({ ...passwordForm, revokeOthers: e.target.checked })} className="w-4 h-4 accent-[#16a57a] rounded"/>
                <label htmlFor="revokeOthers" className="text-slate-600 dark:text-slate-300 cursor-pointer">
                  Revoke all other device sessions after password change
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setChangePasswordModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#21352f] font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#16a57a] hover:bg-[#138e69] text-white font-semibold">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* MODAL 3: CHANGE AVATAR */}
      {changeAvatarModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#21352f] shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Choose Profile Picture
            </h3>

            <p className="text-xs text-slate-500">Select a preset avatar or paste a custom image URL:</p>

            <div className="flex items-center justify-center gap-3 py-2">
              {presetAvatars.map((url, i) => (<img key={i} src={url} alt={`Preset ${i}`} onClick={() => handleSaveAvatar(url)} className="w-12 h-12 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-[#16a57a] transition-all hover:scale-105"/>))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs text-slate-500 block font-medium">Or Custom Image URL</label>
              <input type="url" placeholder="https://..." value={avatarUrlInput} onChange={(e) => setAvatarUrlInput(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] text-xs dark:bg-transparent"/>
              <button onClick={() => handleSaveAvatar(avatarUrlInput)} disabled={!avatarUrlInput} className="w-full py-2 bg-[#16a57a] text-white font-semibold rounded-xl text-xs disabled:opacity-50">
                Use Custom URL
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setChangeAvatarModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600">
                Close
              </button>
            </div>
          </div>
        </div>)}

      {/* MODAL 4: DEACTIVATE ACCOUNT */}
      {deleteAccountModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl max-w-md w-full p-6 border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-heading text-rose-600 flex items-center gap-2">
              <AlertTriangle size={18}/>
              <span>Deactivate FinSight Account</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Please enter your email <span className="font-bold">{profileData?.personalInfo?.email}</span> and password to confirm deactivation. All sessions will be terminated immediately.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Confirm Email Address</label>
                <input type="email" required placeholder={profileData?.personalInfo?.email} value={deleteForm.confirmEmail} onChange={(e) => setDeleteForm({ ...deleteForm, confirmEmail: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Password</label>
                <input type="password" required value={deleteForm.password} onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] dark:bg-transparent"/>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setDeleteAccountModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#21352f] font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                  Confirm Deactivation
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};
