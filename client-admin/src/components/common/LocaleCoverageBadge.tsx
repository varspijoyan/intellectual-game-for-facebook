import type { ContentLocale } from "../../types";

type Props = { locales: ContentLocale[]; completedCodes: string[] };

export default function LocaleCoverageBadge({ locales, completedCodes }: Props) {
  const missing = locales.filter((l) => l.enabled && !completedCodes.includes(l.code));
  if (!missing.length) return <span className="badge ok">All locales complete</span>;
  return <span className="badge">Missing: {missing.map((m) => m.code).join(", ")}</span>;
}
