import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLocales, getTeam, updateTeam } from "../../api/adminApi";
import type { ContentLocale, Team } from "../../types";

export default function TeamDetailPage() {
  const { id = "" } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [locales, setLocales] = useState<ContentLocale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [teamData, localesData] = await Promise.all([getTeam(id), getLocales()]);
        setTeam(teamData);
        setLocales(localesData);
      } catch {
        setError("Failed to load team details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <section className="panel">Loading...</section>;
  if (!team) return <section className="panel">{error ?? "Team not found."}</section>;

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      setTeam(await updateTeam(id, team));
    } catch {
      setError("Failed to save team.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2>{team.canonicalName}</h2>
      {error ? <p className="error-text">{error}</p> : null}
      <label>Country</label>
      <input value={team.countryCode} onChange={(e) => setTeam({ ...team, countryCode: e.target.value.toUpperCase() })} />
      <h3>Localizations</h3>
      {locales
        .filter((l) => l.enabled)
        .map((locale) => {
          const row = team.localizations.find((x) => x.locale === locale.code);
          return (
            <div key={locale.code} className="panel">
              <strong>{locale.code}</strong>
              <input
                placeholder="Display"
                value={row?.displayName ?? ""}
                onChange={(e) =>
                  setTeam((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      localizations: [
                        ...prev.localizations.filter((x) => x.locale !== locale.code),
                        { locale: locale.code, displayName: e.target.value, shortName: row?.shortName ?? "" },
                      ],
                    };
                  })
                }
              />
              <input
                placeholder="Short"
                value={row?.shortName ?? ""}
                onChange={(e) =>
                  setTeam((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      localizations: [
                        ...prev.localizations.filter((x) => x.locale !== locale.code),
                        { locale: locale.code, displayName: row?.displayName ?? "", shortName: e.target.value },
                      ],
                    };
                  })
                }
              />
            </div>
          );
        })}
      <button type="button" onClick={() => void onSave()} disabled={saving}>
        {saving ? "Saving..." : "Save team"}
      </button>
    </section>
  );
}
