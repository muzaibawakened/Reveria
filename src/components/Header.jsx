import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Menu, X, BookOpen, Download, Upload, Check, AlertCircle } from "lucide-react";

export default function Header({ currentView, onNavigate, onBackup, onRestore, dreamCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [restoreMsg, setRestoreMsg] = useState("");
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [menuOpen]);

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setRestoreStatus("loading");
    setRestoreMsg("Importing dreams…");
    try {
      const count = await onRestore(file);
      setRestoreStatus("success");
      setRestoreMsg(
        count === 0
          ? "No new dreams — already up to date."
          : `${count} dream${count !== 1 ? "s" : ""} restored!`
      );
    } catch (err) {
      setRestoreStatus("error");
      setRestoreMsg(err.message || "Restore failed. Check the file.");
    } finally {
      setTimeout(() => setRestoreStatus(null), 4000);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-5 py-3 flex items-center gap-3"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate("record")}
        >
          <Moon
            className="w-4 h-4 text-gold opacity-50 group-hover:opacity-90 transition-all duration-500"
            strokeWidth={1.5}
          />
          <h1 className="font-editorial text-lg font-light tracking-[0.15em] text-shimmer select-none uppercase">
            Reveria
          </h1>
        </div>

        <div className="flex-1" />

        {/* Vault quick-access button (always visible) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate(currentView === "record" ? "vault" : "record")}
          className="p-2.5 rounded-full border border-white/[0.06] hover:border-gold/20 transition-all duration-300 group"
          title={currentView === "record" ? "Your Dreams" : "Record Dream"}
          id="header-vault-btn"
        >
          <BookOpen
            className="w-4 h-4 text-text-secondary group-hover:text-gold transition-colors"
            strokeWidth={1.5}
          />
        </motion.button>

        {/* Hamburger (backup/restore only) */}
        <div ref={menuRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2.5 rounded-full border border-white/[0.06] hover:border-gold/20 transition-all duration-300 group"
            aria-label="More options"
            id="header-menu-btn"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X className="w-4 h-4 text-text-secondary group-hover:text-gold transition-colors" strokeWidth={1.5} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu className="w-4 h-4 text-text-secondary group-hover:text-gold transition-colors" strokeWidth={1.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-12 right-0 w-52 rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(19,19,48,0.97) 0%, rgba(12,12,29,0.97) 100%)",
                  border: "1px solid rgba(201,169,110,0.12)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
                  backdropFilter: "blur(24px)",
                }}
                id="header-menu-panel"
              >
                <div className="p-2">
                  {/* Label */}
                  <p className="px-3 pt-1 pb-2 text-[9px] font-ui uppercase tracking-[0.25em] text-text-ghost">
                    Journal
                  </p>

                  <MenuButton
                    icon={<Download className="w-3.5 h-3.5" />}
                    label="Backup Dreams"
                    hint={dreamCount > 0 ? `${dreamCount} saved` : ""}
                    disabled={dreamCount === 0}
                    onClick={() => {
                      onBackup();
                      setMenuOpen(false);
                    }}
                  />

                  <MenuButton
                    icon={<Upload className="w-3.5 h-3.5" />}
                    label="Restore from File"
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hidden file input for restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleRestore}
        id="restore-file-input"
      />

      {/* Restore toast */}
      <AnimatePresence>
        {restoreStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full"
            style={{
              background:
                restoreStatus === "error"
                  ? "rgba(140,30,30,0.95)"
                  : "rgba(19,19,48,0.95)",
              border: `1px solid ${
                restoreStatus === "success"
                  ? "rgba(124,106,239,0.4)"
                  : restoreStatus === "error"
                  ? "rgba(255,100,100,0.3)"
                  : "rgba(201,169,110,0.2)"
              }`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              backdropFilter: "blur(16px)",
              whiteSpace: "nowrap",
            }}
          >
            {restoreStatus === "loading" && (
              <motion.div
                className="w-3 h-3 rounded-full bg-gold flex-shrink-0"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {restoreStatus === "success" && (
              <Check className="w-3.5 h-3.5 text-violet flex-shrink-0" />
            )}
            {restoreStatus === "error" && (
              <AlertCircle className="w-3.5 h-3.5 text-red-300 flex-shrink-0" />
            )}
            <span className="text-xs font-ui tracking-wide text-parchment-mid">
              {restoreMsg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuButton({ icon, label, onClick, disabled, hint }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-ui tracking-wide transition-all duration-200 ${
        disabled
          ? "text-text-ghost cursor-default opacity-40"
          : "text-text-secondary hover:bg-white/5 hover:text-parchment"
      }`}
      style={{ minHeight: 40 }}
    >
      <span className="text-text-ghost">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] text-text-ghost">{hint}</span>}
    </button>
  );
}