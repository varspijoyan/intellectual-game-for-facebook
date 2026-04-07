import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createAthlete, deleteAthlete, getAthletes } from "../../api/adminApi";
import type { Athlete } from "../../types";

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setAthletes(await getAthletes());
      } catch {
        setError("Failed to load athletes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onAddAthlete() {
    const firstName = window.prompt("Athlete first name");
    const lastName = window.prompt("Athlete last name");
    const teamId = window.prompt("Team ID");
    const position = window.prompt("Position code (GK/DF/MF/FW)", "FW");
    if (!firstName?.trim() || !lastName?.trim() || !teamId?.trim() || !position?.trim()) return;
    setError(null);
    try {
      const created = await createAthlete({
        canonicalFirstName: firstName.trim(),
        canonicalLastName: lastName.trim(),
        teamId: teamId.trim(),
        position: position.trim(),
        active: true,
      });
      setAthletes((curr) => [...curr, created]);
    } catch {
      setError("Failed to create athlete.");
    }
  }

  async function onDeleteAthlete(id: string) {
    if (!window.confirm("Delete this athlete?")) return;
    setError(null);
    try {
      await deleteAthlete(id);
      setAthletes((curr) => curr.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete athlete.");
    }
  }

  return (
    <section className="panel">
      <h2>Athletes</h2>
      <div className="h-row">
        <button type="button" onClick={() => void onAddAthlete()} disabled={loading}>
          Add athlete
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((athlete) => (
            <tr key={athlete.id}>
              <td>
                {athlete.canonicalFirstName} {athlete.canonicalLastName}
              </td>
              <td>{athlete.teamId}</td>
              <td>{athlete.position}</td>
              <td>
                <Link to={`/athletes/${athlete.id}`}>Open</Link>
                {" | "}
                <button type="button" className="ghost" onClick={() => void onDeleteAthlete(athlete.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
