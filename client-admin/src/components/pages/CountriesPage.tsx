import { useEffect, useMemo, useState } from "react";
import { createCountry, deleteCountry, getCountries, getLocales, updateCountries } from "../../api/adminApi";
import type { AdminCountryRow, ContentLocale } from "../../types";

export default function CountriesPage() {
  const [countries, setCountries] = useState<AdminCountryRow[]>([]);
  const [locales, setLocales] = useState<ContentLocale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [countriesData, localesData] = await Promise.all([getCountries(), getLocales()]);
        setCountries(countriesData);
        setLocales(localesData);
      } catch {
        setError("Failed to load countries.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enabledLocales = useMemo(() => locales.filter((l) => l.enabled), [locales]);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      setCountries(await updateCountries(countries));
    } catch {
      setError("Failed to save countries.");
    } finally {
      setSaving(false);
    }
  }

  async function onAddCountry() {
    const codeInput = window.prompt("Country code (ISO-2), e.g. AR");
    const code = codeInput?.trim().toUpperCase();
    if (!code) return;
    setError(null);
    try {
      const created = await createCountry({ code });
      setCountries((curr) => [...curr, created]);
    } catch {
      setError("Failed to create country.");
    }
  }

  async function onDeleteCountry(code: string) {
    if (!window.confirm(`Delete country ${code}?`)) return;
    setError(null);
    try {
      await deleteCountry(code);
      setCountries((curr) => curr.filter((item) => item.code !== code));
    } catch {
      setError("Failed to delete country.");
    }
  }

  return (
    <section className="panel">
      <h2>Countries</h2>
      <div className="h-row">
        <button type="button" onClick={() => void onAddCountry()} disabled={loading}>
          Add country
        </button>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Enabled</th>
            {enabledLocales.map((l) => (
              <th key={l.code}>{l.code}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((row, rowIndex) => (
            <tr key={row.code}>
              <td>{row.code}</td>
              <td>
                <input
                  type="checkbox"
                  checked={row.enabledForGenerator}
                  onChange={(e) =>
                    setCountries((curr) =>
                      curr.map((r, i) => (i === rowIndex ? { ...r, enabledForGenerator: e.target.checked } : r))
                    )
                  }
                />
              </td>
              {enabledLocales.map((locale) => (
                <td key={locale.code}>
                  <input
                    value={row.localizations.find((l) => l.locale === locale.code)?.displayName ?? ""}
                    onChange={(e) =>
                      setCountries((curr) =>
                        curr.map((r, i) =>
                          i !== rowIndex
                            ? r
                            : {
                                ...r,
                                localizations: [
                                  ...r.localizations.filter((x) => x.locale !== locale.code),
                                  { locale: locale.code, displayName: e.target.value },
                                ],
                              }
                        )
                      )
                    }
                  />
                </td>
              ))}
              <td>
                <button type="button" className="ghost" onClick={() => void onDeleteCountry(row.code)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={() => void onSave()} disabled={saving || loading}>
        {saving ? "Saving..." : "Save countries"}
      </button>
    </section>
  );
}
