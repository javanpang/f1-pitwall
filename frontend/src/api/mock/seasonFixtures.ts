import type { MeetingWithSessions } from "../../types/f1";

type SessionSpec = readonly [
  name: string,
  type: string,
  dayOffset: number,
  start: string,
  end: string,
];

const STANDARD: readonly SessionSpec[] = [
  ["Practice 1", "Practice", 0, "11:30", "12:30"],
  ["Practice 2", "Practice", 0, "15:00", "16:00"],
  ["Practice 3", "Practice", 1, "11:30", "12:30"],
  ["Qualifying", "Qualifying", 1, "15:00", "16:00"],
  ["Race", "Race", 2, "14:00", "16:00"],
];

const SPRINT: readonly SessionSpec[] = [
  ["Practice 1", "Practice", 0, "11:30", "12:30"],
  ["Sprint Qualifying", "Qualifying", 0, "15:30", "16:15"],
  ["Sprint", "Race", 1, "11:00", "12:00"],
  ["Qualifying", "Qualifying", 1, "15:00", "16:00"],
  ["Race", "Race", 2, "14:00", "16:00"],
];

interface WeekendSeed {
  key: number;
  name: string;
  circuit: string;
  location: string;
  country: string;
  friday: string;
  sprint?: boolean;
}

function at(friday: string, dayOffset: number, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${friday}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

function buildWeekend(seed: WeekendSeed): MeetingWithSessions {
  const sessions = (seed.sprint ? SPRINT : STANDARD).map(
    ([name, type, day, start, end], i) => ({
      key: seed.key * 10 + i + 1,
      name,
      type,
      dateStart: at(seed.friday, day, start),
      dateEnd: at(seed.friday, day, end),
    }),
  );

  return {
    meeting: {
      key: seed.key,
      name: seed.name,
      officialName: null,
      circuit: seed.circuit,
      country: seed.country,
      location: seed.location,
      dateStart: sessions[0].dateStart,
      dateEnd: sessions[sessions.length - 1].dateEnd,
      year: Number(seed.friday.slice(0, 4)),
    },
    sessions,
  };
}

const SEEDS: Record<number, WeekendSeed[]> = {
  2026: [
    {
      key: 2601,
      name: "Australian Grand Prix",
      circuit: "Albert Park",
      location: "Melbourne",
      country: "Australia",
      friday: "2026-03-06",
    },
    {
      key: 2602,
      name: "Chinese Grand Prix",
      circuit: "Shanghai",
      location: "Shanghai",
      country: "China",
      friday: "2026-03-13",
      sprint: true,
    },
    {
      key: 2603,
      name: "Japanese Grand Prix",
      circuit: "Suzuka",
      location: "Suzuka",
      country: "Japan",
      friday: "2026-03-27",
    },
    {
      key: 2604,
      name: "Bahrain Grand Prix",
      circuit: "Sakhir",
      location: "Sakhir",
      country: "Bahrain",
      friday: "2026-04-10",
    },
    {
      key: 2605,
      name: "Monaco Grand Prix",
      circuit: "Monte Carlo",
      location: "Monaco",
      country: "Monaco",
      friday: "2026-06-05",
    },
    {
      key: 2606,
      name: "British Grand Prix",
      circuit: "Silverstone",
      location: "Silverstone",
      country: "United Kingdom",
      friday: "2026-07-03",
    },
    {
      key: 2607,
      name: "Italian Grand Prix",
      circuit: "Monza",
      location: "Monza",
      country: "Italy",
      friday: "2026-09-04",
    },
    {
      key: 2608,
      name: "Singapore Grand Prix",
      circuit: "Marina Bay",
      location: "Singapore",
      country: "Singapore",
      friday: "2026-10-09",
      sprint: true,
    },
    {
      key: 2609,
      name: "United States Grand Prix",
      circuit: "Austin",
      location: "Austin",
      country: "United States",
      friday: "2026-10-23",
      sprint: true,
    },
    {
      key: 2610,
      name: "Abu Dhabi Grand Prix",
      circuit: "Yas Marina",
      location: "Abu Dhabi",
      country: "United Arab Emirates",
      friday: "2026-12-04",
    },
  ],
  2025: [
    {
      key: 2501,
      name: "Australian Grand Prix",
      circuit: "Albert Park",
      location: "Melbourne",
      country: "Australia",
      friday: "2025-03-14",
    },
    {
      key: 2502,
      name: "Monaco Grand Prix",
      circuit: "Monte Carlo",
      location: "Monaco",
      country: "Monaco",
      friday: "2025-05-23",
    },
    {
      key: 2503,
      name: "Belgian Grand Prix",
      circuit: "Spa-Francorchamps",
      location: "Spa",
      country: "Belgium",
      friday: "2025-07-25",
      sprint: true,
    },
    {
      key: 2504,
      name: "Abu Dhabi Grand Prix",
      circuit: "Yas Marina",
      location: "Abu Dhabi",
      country: "United Arab Emirates",
      friday: "2025-12-05",
    },
  ],
  2024: [
    {
      key: 2401,
      name: "Bahrain Grand Prix",
      circuit: "Sakhir",
      location: "Sakhir",
      country: "Bahrain",
      friday: "2024-02-29",
    },
    {
      key: 2402,
      name: "Miami Grand Prix",
      circuit: "Miami",
      location: "Miami",
      country: "United States",
      friday: "2024-05-03",
      sprint: true,
    },
    {
      key: 2403,
      name: "Abu Dhabi Grand Prix",
      circuit: "Yas Marina",
      location: "Abu Dhabi",
      country: "United Arab Emirates",
      friday: "2024-12-06",
    },
  ],
};

// Mock API function to simulate fetching season data with a delay
export async function getMockSeason(
  year: number,
): Promise<MeetingWithSessions[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return (SEEDS[year] ?? []).map(buildWeekend);
}
