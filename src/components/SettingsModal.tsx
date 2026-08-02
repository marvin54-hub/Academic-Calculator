import { useState } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings as SettingsIcon,
  Info,
  ShieldCheck,
  KeyRound,
  Trash2,
  Bell,
  ChevronRight,
  ChevronLeft,
  Github,
  ExternalLink,
} from "lucide-react";
import { api } from "../services/api";
import { ProfileSettings, UserSession } from "../types";

type SettingsView = "menu" | "about" | "privacy" | "account";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: ProfileSettings;
  user: UserSession;
  onUpdateSettings: (settings: Partial<ProfileSettings>) => void;
  onDeleteAccount: (password: string) => Promise<void>;
  onLogout: () => void;
  themeColor: string;
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  user,
  onUpdateSettings,
  onDeleteAccount,
  onLogout,
  themeColor,
}: SettingsModalProps) {
  const [view, setView] = useState<SettingsView>("menu");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setView("menu");
    setCurrentPassword("");
    setNewPassword("");
    setPasswordMsg(null);
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setDeleteError(null);
    onClose();
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await onDeleteAccount(deletePassword);
      close();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-3 mb-5">
      <button
        onClick={() => setView("menu")}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 shadow-2xl"
        >
          {view === "menu" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})` }}
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Settings</h3>
                </div>
                <button
                  onClick={close}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {/* Notifications toggle, right on the menu since it's a single control */}
                <div className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Notifications</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Streaks, deadlines, and study reminders
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                    className="w-10 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                    style={{ backgroundColor: settings.notificationsEnabled ? themeColor : "#cbd5e1" }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ transform: settings.notificationsEnabled ? "translateX(18px)" : "translateX(2px)" }}
                    />
                  </button>
                </div>

                {user.isLoggedIn && !user.isAnonymous && (
                  <button
                    onClick={() => setView("account")}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <KeyRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Account & Security
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </button>
                )}

                <button
                  onClick={() => setView("privacy")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Privacy & Permissions
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </button>

                <button
                  onClick={() => setView("about")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Info className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">About the App</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                </button>
              </div>
            </>
          )}

          {view === "about" && (
            <div>
              <SectionHeader title="About the App" />
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
                  style={{ backgroundImage: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})` }}
                >
                  <SettingsIcon className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100">Academic Calculator</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Version 1.0.0</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Calculate grades, track course progress, predict outcomes, and get planning help from an AI
                Academic Assistant. Built to help students stay on top of assessments, targets, and deadlines
                across every module.
              </p>
              <div className="space-y-2">
                <a
                  href="https://github.com/marvin54-hub/Academic-Calculator"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
                >
                  <span className="flex items-center space-x-2">
                    <Github className="w-4 h-4" />
                    <span>View Source on GitHub</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                </a>
              </div>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-6">
                Released under the MIT License.
              </p>
            </div>
          )}

          {view === "privacy" && (
            <div>
              <SectionHeader title="Privacy & Permissions" />
              <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">What's stored, and where</p>
                  <p>
                    {user.isAnonymous
                      ? "You're using Guest Mode — your modules, grades, and history are stored only in this browser's local storage, on this device. Nothing is sent to any server."
                      : "Your name, email, hashed password, and academic data (modules, grades, history) are stored in this app's database. Your password is never stored in plain text."}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">AI Academic Assistant</p>
                  <p>
                    When you message the AI Assistant, your question and relevant academic context (module
                    names, grades) are sent to Google's Gemini API to generate a response. This only happens
                    when you actively use the assistant.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Password reset emails</p>
                  <p>
                    If you request a password reset, the reset link is sent through the email provider this
                    app's operator has configured (if any). No other account data is included in that email.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">No ads, no analytics</p>
                  <p>This app doesn't use tracking, analytics, or advertising services of any kind.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Your data, your control</p>
                  <p>
                    You can export a full copy of your data as JSON, or delete it, anytime from{" "}
                    <span className="font-semibold">Profile → Export & Import Data</span>.
                    {!user.isAnonymous && (
                      <>
                        {" "}
                        You can permanently delete your account and all associated data under{" "}
                        <span className="font-semibold">Account & Security</span>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === "account" && (
            <div>
              <SectionHeader title="Account & Security" />

              <form onSubmit={handleChangePassword} className="space-y-3 mb-6">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Change Password</p>
                {passwordMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-medium text-center ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
                        : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}
                <input
                  type="password"
                  required
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition"
                />
                <input
                  type="password"
                  required
                  placeholder="New password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition"
                />
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition"
                  style={{ backgroundColor: themeColor }}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              <button
                onClick={() => {
                  close();
                  onLogout();
                }}
                className="w-full py-2.5 mb-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
              >
                Sign Out
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                ) : (
                  <div className="space-y-2.5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl">
                    <p className="text-[11px] font-bold text-red-500">
                      This permanently deletes your account and all saved data. This can't be undone.
                    </p>
                    {deleteError && <p className="text-[11px] text-red-500">{deleteError}</p>}
                    <input
                      type="password"
                      required
                      placeholder="Confirm your password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword("");
                          setDeleteError(null);
                        }}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || !deletePassword}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold text-white bg-red-500 disabled:opacity-50"
                      >
                        {deleting ? "Deleting..." : "Permanently Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
