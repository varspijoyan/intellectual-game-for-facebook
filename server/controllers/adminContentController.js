import {
  createAthlete as createAthleteInDb,
  createTeam as createTeamInDb,
  findLocaleByCode,
  listAthletes as listAthletesFromDb,
  listCountries as listCountriesFromDb,
  listLocales as listLocalesFromDb,
  listPositionLabels as listPositionLabelsFromDb,
  listQuestionLocalizations as listQuestionLocalizationsFromDb,
  listTeams as listTeamsFromDb,
  upsertCountry as upsertCountryInDb,
  upsertLocale as upsertLocaleInDb,
  upsertPositionLabel as upsertPositionLabelInDb,
  upsertQuestionLocalization as upsertQuestionLocalizationInDb,
} from "../services/adminContentService.js";

export function createAdminContentController(db) {
  async function listLocales(_req, res) {
    const rows = await listLocalesFromDb(db);
    res.json(rows);
  }

  async function upsertLocale(req, res) {
    const code = String(req.body?.code || "").trim().toLowerCase();
    const name = String(req.body?.name || "").trim();
    const isEnabled = req.body?.is_enabled !== false;
    if (!code || !name) return res.status(400).json({ error: "code and name are required" });

    const { id, created } = await upsertLocaleInDb(db, { code, name, isEnabled });
    return res.status(created ? 201 : 200).json({ ok: true, id });
  }

  async function listCountries(_req, res) {
    const rows = await listCountriesFromDb(db);
    res.json(rows);
  }

  async function upsertCountry(req, res) {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const defaultName = String(req.body?.default_name || "").trim();
    if (code.length !== 2 || !defaultName) return res.status(400).json({ error: "valid country code and default_name are required" });

    const { id, created } = await upsertCountryInDb(db, { code, defaultName });
    return res.status(created ? 201 : 200).json({ ok: true, id });
  }

  async function listTeams(_req, res) {
    const rows = await listTeamsFromDb(db);
    res.json(rows);
  }

  async function createTeam(req, res) {
    const name = String(req.body?.name || "").trim();
    const shortName = req.body?.short_name ? String(req.body.short_name).trim() : null;
    const crestUrl = req.body?.crest_url ? String(req.body.crest_url).trim() : null;
    const countryId = req.body?.country_id ? Number(req.body.country_id) : null;
    if (!name) return res.status(400).json({ error: "name is required" });

    const id = await createTeamInDb(db, { name, shortName, crestUrl, countryId });
    return res.status(201).json({ ok: true, id });
  }

  async function listAthletes(_req, res) {
    const rows = await listAthletesFromDb(db);
    res.json(rows);
  }

  async function createAthlete(req, res) {
    const teamId = Number(req.body?.team_id);
    const firstName = String(req.body?.first_name || "").trim();
    const lastName = String(req.body?.last_name || "").trim();
    const positionCode = String(req.body?.position_code || "").trim().toUpperCase();
    const isActive = req.body?.is_active !== false;
    if (!teamId || !firstName || !lastName || !positionCode) {
      return res.status(400).json({ error: "team_id, first_name, last_name, position_code are required" });
    }

    const id = await createAthleteInDb(db, { teamId, firstName, lastName, positionCode, isActive });
    return res.status(201).json({ ok: true, id });
  }

  async function listPositionLabels(_req, res) {
    const rows = await listPositionLabelsFromDb(db);
    res.json(rows);
  }

  async function upsertPositionLabel(req, res) {
    const positionCode = String(req.body?.position_code || "").trim().toUpperCase();
    const localeCode = String(req.body?.locale_code || "").trim().toLowerCase();
    const label = String(req.body?.label || "").trim();
    if (!positionCode || !localeCode || !label) {
      return res.status(400).json({ error: "position_code, locale_code, label are required" });
    }

    const locale = await findLocaleByCode(db, localeCode);
    if (!locale) return res.status(404).json({ error: "locale not found" });

    const { id, created } = await upsertPositionLabelInDb(db, {
      positionCode,
      localeId: locale.id,
      label,
    });
    return res.status(created ? 201 : 200).json({ ok: true, id });
  }

  async function listQuestionLocalizations(_req, res) {
    const rows = await listQuestionLocalizationsFromDb(db);
    res.json(rows);
  }

  async function upsertQuestionLocalization(req, res) {
    const questionKey = String(req.body?.question_key || "").trim();
    const localeCode = String(req.body?.locale_code || "").trim().toLowerCase();
    const questionText = String(req.body?.question_text || "").trim();
    const answerText = String(req.body?.answer_text || "").trim();
    if (!questionKey || !localeCode || !questionText || !answerText) {
      return res.status(400).json({ error: "question_key, locale_code, question_text, answer_text are required" });
    }

    const locale = await findLocaleByCode(db, localeCode);
    if (!locale) return res.status(404).json({ error: "locale not found" });

    const { id, created } = await upsertQuestionLocalizationInDb(db, {
      questionKey,
      localeId: locale.id,
      questionText,
      answerText,
    });
    return res.status(created ? 201 : 200).json({ ok: true, id });
  }

  return {
    listLocales,
    upsertLocale,
    listCountries,
    upsertCountry,
    listTeams,
    createTeam,
    listAthletes,
    createAthlete,
    listPositionLabels,
    upsertPositionLabel,
    listQuestionLocalizations,
    upsertQuestionLocalization,
  };
}
