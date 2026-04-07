import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createTeam, deleteTeam, getTeams } from "../../api/adminApi";
import type { Team } from "../../types";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setTeams(await getTeams());
      } catch {
        setError("Failed to load teams.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onAddTeam() {
    const canonicalName = window.prompt("Team canonical name");
    if (!canonicalName?.trim()) return;
    const countryCode = window.prompt("Country code (ISO-2)", "US")?.trim().toUpperCase();
    if (!countryCode) return;
    setError(null);
    try {
      const created = await createTeam({ canonicalName: canonicalName.trim(), countryCode });
      setTeams((curr) => [...curr, created]);
    } catch {
      setError("Failed to create team.");
    }
  }

  async function onDeleteTeam(id: string) {
    if (!window.confirm("Delete this team?")) return;
    setError(null);
    try {
      await deleteTeam(id);
      setTeams((curr) => curr.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete team.");
    }
  }

  return (
    <section className="panel">
      <h2>Teams</h2>
      <div className="h-row">
        <button type="button" onClick={() => void onAddTeam()} disabled={loading}>
          Add team
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Canonical</th>
            <th>Country</th>
            <th>Locales</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.canonicalName}</td>
              <td>{team.countryCode}</td>
              <td>{team.localizations.length}</td>
              <td>
                <Link to={`/teams/${team.id}`}>Open</Link>
                {" | "}
                <button type="button" className="ghost" onClick={() => void onDeleteTeam(team.id)}>
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
