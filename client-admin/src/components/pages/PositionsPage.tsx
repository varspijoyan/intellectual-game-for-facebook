import { useEffect, useState } from "react";
import { createPosition, deletePosition, getPositions, updatePositions } from "../../api/adminApi";
import type { Position } from "../../types";

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setPositions(await getPositions());
      } catch {
        setError("Failed to load positions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onAddPosition() {
    const code = window.prompt("Position code (e.g. GK, DF, MF, FW)")?.trim().toUpperCase();
    const label = window.prompt("Position label")?.trim();
    if (!code || !label) return;
    setError(null);
    try {
      const created = await createPosition({ code, label });
      setPositions((curr) => [...curr, created]);
    } catch {
      setError("Failed to create position.");
    }
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      setPositions(await updatePositions(positions));
    } catch {
      setError("Failed to save positions.");
    } finally {
      setSaving(false);
    }
  }

  async function onDeletePosition(id: string) {
    if (!window.confirm("Delete this position?")) return;
    setError(null);
    try {
      await deletePosition(id);
      setPositions((curr) => curr.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete position.");
    }
  }

  return (
    <section className="panel">
      <h2>Positions</h2>
      <div className="h-row">
        <button type="button" onClick={() => void onAddPosition()} disabled={loading}>
          Add position
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Label</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={position.id}>
              <td>
                <input
                  value={position.code}
                  onChange={(e) =>
                    setPositions((curr) => curr.map((item, i) => (i === index ? { ...item, code: e.target.value } : item)))
                  }
                />
              </td>
              <td>
                <input
                  value={position.label}
                  onChange={(e) =>
                    setPositions((curr) => curr.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))
                  }
                />
              </td>
              <td>
                <button type="button" className="ghost" onClick={() => void onDeletePosition(position.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={() => void onSave()} disabled={saving || loading}>
        {saving ? "Saving..." : "Save positions"}
      </button>
    </section>
  );
}
