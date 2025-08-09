import { TASK_TEMPLATES } from '../data/taskTemplates';
import { addWeeks, startOfToday } from 'date-fns';

export function currentSeason(date = new Date()) {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'Spring';
  if (m >= 6 && m <= 8) return 'Summer';
  if (m >= 9 && m <= 11) return 'Fall';
  return 'Winter';
}

// Extremely simple heuristics for demo; replace with real climate/region rules
function regionFlagsFromZip(zip) {
  const z = parseInt(String(zip).slice(0, 1), 10);
  return {
    freeze_risk: [0, 1, 2, 5].includes(z),  // arbitrary demo mapping
    wildfire_risk: [8, 9].includes(z),
    heavy_rain: [9, 0].includes(z)
  };
}

export function generateTasks({ zip, features, season }) {
  const flags = regionFlagsFromZip(zip);
  const pool = new Set(features || []);
  const candidates = TASK_TEMPLATES.filter(t => {
    if (t.season !== season) return false;
    if (t.features && t.features.length && !t.features.some(f => pool.has(f))) return false;
    if (t.regions && t.regions.length) {
      // Regions are expressed as flags like 'freeze', 'wildfire', 'rain'
      const needs = new Set(t.regions);
      if (needs.has('freeze') && !flags.freeze_risk) return false;
      if (needs.has('wildfire') && !flags.wildfire_risk) return false;
      if (needs.has('rain') && !flags.heavy_rain) return false;
    }
    return true;
  });

  // Schedule hint (client-side): weekly from next week
  const start = startOfToday();
  return candidates.map((t, idx) => ({
    ...t,
    id: t.id,
    scheduled_date: addWeeks(start, idx % 8).toISOString()
  }));
}
