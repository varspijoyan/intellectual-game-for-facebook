import type { Db } from "../db.js";

export type QuestionDto = {
  id: number;
  text: string;
  options: [string, string, string, string];
};

export function rowToDto(row: {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}): QuestionDto {
  return {
    id: row.id,
    text: row.text,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
  };
}

export async function pickRandomQuestionId(db: Db): Promise<number | null> {
  const rows = await db("questions").select("id").orderByRaw("RAND()").limit(1);
  const id = rows[0]?.id;
  return id !== undefined ? Number(id) : null;
}

export async function getQuestionById(db: Db, id: number) {
  return db("questions").where({ id }).first();
}
