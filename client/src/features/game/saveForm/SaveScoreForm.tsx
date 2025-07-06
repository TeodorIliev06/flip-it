import React, { useState } from "react";

import { postScore } from "../../leaderboard/leaderboardApi";

import "./SaveScoreForm.css";

interface SaveScoreFormProps {
  moves: number;
  seconds: number;
}

const SaveScoreForm: React.FC<SaveScoreFormProps> = ({ moves, seconds }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await postScore({ playerName, moves, timeInSeconds: seconds });
      setSaved(true);
      setModalOpen(false);
    } catch (err) {
      setError("Failed to save score. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        className="save-btn"
        onClick={() => setModalOpen(true)}
        disabled={saved}
      >
        {saved ? "Saved!" : "Save"}
      </button>
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Save Your Score</h2>
            <form onSubmit={handleSave} className="modal-form">
              <input
                type="text"
                className="modal-input"
                placeholder="Enter your name"
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
    </>
  );
};

export default SaveScoreForm;
