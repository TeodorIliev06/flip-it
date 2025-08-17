import React, { useState } from "react";

import { useAuth } from "../../auth/AuthProvider";
import { postScore } from "../../leaderboard/leaderboardApi";
import AuthModal from "../../auth/AuthModal";

import "./SaveScoreForm.css";

interface SaveScoreFormProps {
  moves: number;
  seconds: number;
  difficulty: string;
  gameMode: string;
  onReset: () => void;
}

const SaveScoreForm: React.FC<SaveScoreFormProps> = ({
  moves,
  seconds,
  difficulty,
  gameMode,
  onReset,
}) => {
  const { user, accessToken } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveClick = () => {
    if (user) {
      handleSaveDirect();
    } else {
      setShowAuthPrompt(true);
    }
  };

  const handlePlayAgainClick = () => {
    onReset();
  };

  const handleSaveDirect = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      await postScore({
        playerName: user.username,
        moves,
        timeInSeconds: seconds,
        difficulty,
        gameMode,
        accessToken,
      });
      setSaved(true);
    } catch (err) {
      setError("Failed to save score. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await postScore({
        playerName,
        moves,
        timeInSeconds: seconds,
        difficulty,
        gameMode,
        accessToken,
      });
      setSaved(true);
      setModalOpen(false);
    } catch (err) {
      setError("Failed to save score. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinueAsGuest = () => {
    setShowAuthPrompt(false);
    setModalOpen(true);
  };

  const handleShowAuthModal = () => {
    setShowAuthPrompt(false);
    setShowAuthModal(true);
  };

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <button className="save-btn" onClick={handleSaveClick} disabled={saved}>
          {saved ? "Saved!" : user ? "Save Score" : "Save"}
        </button>

        <button className="play-again-btn" onClick={handlePlayAgainClick}>
          Play Again
        </button>
      </div>

      {showAuthPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Save Your Progress</h2>
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Sign in to save your score and track your progress across all
                games!
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleShowAuthModal}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign In / Sign Up
                </button>
                <button
                  onClick={handleContinueAsGuest}
                  className="w-full p-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Show modal for guests only */}
      {modalOpen && !user && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Save as Guest</h2>
            <form onSubmit={handleSave} className="modal-form">
              <input
                type="text"
                className="modal-input"
                placeholder="Enter your name (guest)"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                disabled={saving}
                autoFocus
              />
              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-confirm"
                  disabled={saving || !playerName.trim()}
                >
                  {saving ? "Saving..." : "Confirm"}
                </button>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setModalOpen(false);
                    setPlayerName("");
                    setError(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="modal-error">{error}</div>}
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
        onAuthSuccess={() => {
          setShowAuthModal(false);
          setModalOpen(true);
        }}
      />
    </>
  );
};

export default SaveScoreForm;
