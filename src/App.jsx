import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import RecordScreen from "./components/RecordScreen";
import VaultScreen from "./components/VaultScreen";
import DreamDetail from "./components/DreamDetail";
import useDreams from "./hooks/useDreams";
import useAuth from "./hooks/useAuth";

export default function App() {
  const { userId, authLoading } = useAuth();
  const { dreams, loading, error, createDream, deleteDream, updateDream } = useDreams(userId);
  const [currentView, setCurrentView] = useState("record");
  const [selectedDreamId, setSelectedDreamId] = useState(null);

  const navigate = useCallback((view) => {
    setCurrentView(view);
    setSelectedDreamId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSaveDream = useCallback(async (dream) => {
    try {
      await createDream(dream);
      setCurrentView("vault");
      setSelectedDreamId(null);
    } catch (err) {
      console.error("Failed to save dream:", err);
    }
  }, [createDream]);

  const handleSelectDream = useCallback((dream) => {
    setSelectedDreamId(dream.id);
    setCurrentView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteDream = useCallback(async (id) => {
    try {
      await deleteDream(id);
      setCurrentView("vault");
      setSelectedDreamId(null);
    } catch (err) {
      console.error("Failed to delete dream:", err);
    }
  }, [deleteDream]);

  const selectedDream = dreams.find((d) => d.id === selectedDreamId);

  return (
    <div className="min-h-screen bg-page">
      {/* Auth loading gate — shown only for the first ~200ms on first visit */}
      {authLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-gold text-2xl font-editorial mb-2">✦</div>
            <p className="text-parchment-dark text-sm">Opening your journal…</p>
          </motion.div>
        </div>
      ) : (
        <>
          <Header currentView={currentView} onNavigate={navigate} />

      <AnimatePresence mode="wait">
        {currentView === "record" ? (
          <motion.div
            key="record"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RecordScreen onSave={handleSaveDream} onNavigate={navigate} />
          </motion.div>
        ) : currentView === "vault" ? (
          <motion.div
            key="vault"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VaultScreen
              dreams={dreams}
              loading={loading}
              onSelectDream={handleSelectDream}
              onNavigateRecord={() => navigate("record")}
            />
          </motion.div>
        ) : currentView === "detail" && selectedDream ? (
          <motion.div
            key={`detail-${selectedDreamId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DreamDetail
              dream={selectedDream}
              onBack={() => navigate("vault")}
              onDelete={handleDeleteDream}
              onUpdate={updateDream}
            />
          </motion.div>
        ) : (
          // Fallback to vault if detail view has no selected dream
          <motion.div
            key="vault-fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VaultScreen
              dreams={dreams}
              loading={loading}
              onSelectDream={handleSelectDream}
              onNavigateRecord={() => navigate("record")}
            />
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}