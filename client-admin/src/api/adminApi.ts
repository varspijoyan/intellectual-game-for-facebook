import { http } from "./http";
import type { AdminCountryRow, Athlete, AthletePhoto, ContentLocale, Team } from "../types";

export async function getLocales(): Promise<ContentLocale[]> {
  const { data } = await http.get<ContentLocale[]>("/locales");
  return data;
}

export async function updateLocales(payload: ContentLocale[]): Promise<ContentLocale[]> {
  const { data } = await http.patch<ContentLocale[]>("/locales", payload);
  return data;
}

export async function getCountries(): Promise<AdminCountryRow[]> {
  const { data } = await http.get<AdminCountryRow[]>("/countries/localizations");
  return data;
}

export async function updateCountries(payload: AdminCountryRow[]): Promise<AdminCountryRow[]> {
  const { data } = await http.patch<AdminCountryRow[]>("/countries/localizations", payload);
  return data;
}

export async function createCountry(payload: { code: string }): Promise<AdminCountryRow> {
  const { data } = await http.post<AdminCountryRow>("/countries", payload);
  return data;
}

export async function deleteCountry(code: string): Promise<void> {
  await http.delete(`/countries/${code}`);
}

export async function getTeams(): Promise<Team[]> {
  const { data } = await http.get<Team[]>("/teams");
  return data;
}

export async function getTeam(id: string): Promise<Team> {
  const { data } = await http.get<Team>(`/teams/${id}`);
  return data;
}

export async function updateTeam(id: string, payload: Team): Promise<Team> {
  const { data } = await http.patch<Team>(`/teams/${id}`, payload);
  return data;
}

export async function createTeam(payload: Pick<Team, "canonicalName" | "countryCode">): Promise<Team> {
  const { data } = await http.post<Team>("/teams", payload);
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  await http.delete(`/teams/${id}`);
}

export async function getAthletes(): Promise<Athlete[]> {
  const { data } = await http.get<Athlete[]>("/athletes");
  return data;
}

export async function getAthlete(id: string): Promise<Athlete> {
  const { data } = await http.get<Athlete>(`/athletes/${id}`);
  return data;
}

export async function updateAthleteLocalizations(id: string, payload: Athlete["localizations"]) {
  const { data } = await http.patch<Athlete["localizations"]>(`/athletes/${id}/localizations`, payload);
  return data;
}

export async function createAthlete(payload: {
  canonicalFirstName: string;
  canonicalLastName: string;
  teamId: string;
  position: string;
  active: boolean;
}): Promise<Athlete> {
  const { data } = await http.post<Athlete>("/athletes", payload);
  return data;
}

export async function deleteAthlete(id: string): Promise<void> {
  await http.delete(`/athletes/${id}`);
}

export async function getAthletePhotos(id: string): Promise<AthletePhoto[]> {
  const { data } = await http.get<AthletePhoto[]>(`/athletes/${id}/photos`);
  return data;
}

export async function addAthletePhoto(id: string, imageUrl: string): Promise<AthletePhoto> {
  const { data } = await http.post<AthletePhoto>(`/athletes/${id}/photos`, { imageUrl });
  return data;
}

export async function updateAthletePhotos(id: string, payload: AthletePhoto[]): Promise<AthletePhoto[]> {
  const { data } = await http.patch<AthletePhoto[]>(`/athletes/${id}/photos`, payload);
  return data;
}
