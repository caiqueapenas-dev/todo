import type { Holiday } from "./types";

export const fetchHolidays = async (year: number): Promise<Holiday[]> => {
  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/feriados/v1/${year}`
    );
    if (!response.ok) {
      throw new Error("Não foi possível buscar os feriados.");
    }
    const data = await response.json();
    return data.map((holiday: any) => ({
      date: holiday.date,
      name: holiday.name,
    }));
  } catch (error) {
    console.error("Erro ao buscar feriados:", error);
    return [];
  }
};
