import { useEffect, useState } from "react";
import { getLocales } from "../api/adminApi";
import type { ContentLocale } from "../types";

export function useContentLocales() {
  const [locales, setLocales] = useState<ContentLocale[]>([]);

  useEffect(() => {
    void getLocales().then(setLocales);
  }, []);

  return locales;
}
