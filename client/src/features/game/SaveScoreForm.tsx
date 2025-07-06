import React, { useState } from "react";
import { postScore } from "../leaderboard/leaderboardApi";

interface SaveScoreFormProps {
  moves: number;
  seconds: number;
}

const SaveScoreForm: React.FC<SaveScoreFormProps> = ({ moves, seconds }) => {
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
    } catch (err) {
      setError("Failed to save score. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="flex flex-row items-center gap-2" onSubmit={handleSave}>
      <input
        type="text"
        className="px-3 py-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter your name"
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
        required
        disabled={saving || saved}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        disabled={saving || !playerName.trim() || saved}
      >
        {saved ? "Saved!" : saving ? "Saving..." : "Save"}
      </button>
      {error && <div className="text-red-500 text-sm ml-2">{error}</div>}
    </form>
  );
};

export default SaveScoreForm; 