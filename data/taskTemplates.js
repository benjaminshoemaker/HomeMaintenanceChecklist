// data/taskTemplates.js
export const TASK_TEMPLATES = [
  // SPRING
  { id: 'spr1', season: 'Spring', title: 'Test smoke & CO detectors', why: 'Battery swap reduces failure risk.', est_time: '10m', instructions_url: 'https://www.nfpa.org/education-and-research/home-fire-safety/smoke-alarms', regions: [], features: [] },
  { id: 'spr2', season: 'Spring', title: 'Inspect gutters and downspouts', why: 'Prevent water damage in spring rains.', est_time: '30–60m', instructions_url: 'https://www.thisoldhouse.com/gutters/how-to-clean-gutters', regions: ['rain'], features: [] },
  { id: 'spr3', season: 'Spring', title: 'HVAC filter replacement', why: 'Improves air quality and efficiency.', est_time: '10m', instructions_url: 'https://www.energy.gov/energysaver/air-conditioner-maintenance', regions: [], features: [] },
  { id: 'spr4', season: 'Spring', title: 'Pool opening checklist', why: 'Safe startup after winter.', est_time: '1–2h', instructions_url: 'https://www.swimuniversity.com/open-inground-pool/', regions: [], features: ['pool'] },

  // SUMMER
  { id: 'sum1', season: 'Summer', title: 'Lawn irrigation check', why: 'Fix leaks & adjust heads for coverage.', est_time: '20–40m', instructions_url: 'https://extension.umn.edu/lawn-care/auditing-home-lawn-irrigation-systems', regions: [], features: ['lawn'] },
  { id: 'sum2', season: 'Summer', title: 'Inspect and clean exterior dryer vent', why: 'Reduce lint fire risk.', est_time: '15–30m', instructions_url: 'https://www.cpsc.gov/Safety-Education/Safety-Education-Materials', regions: [], features: [] },
  { id: 'sum3', season: 'Summer', title: 'Chimney cap & crown visual check', why: 'Keep pests and rain out.', est_time: '10–20m', instructions_url: 'https://www.csia.org/homeowners.html', regions: [], features: ['fireplace'] },
  { id: 'sum4', season: 'Summer', title: 'Wildfire smoke prep kit', why: 'Have filters/masks ready for smoke events.', est_time: '20m', instructions_url: 'https://www.epa.gov/emergencies-iaq/wildfires-and-indoor-air-quality-iaq', regions: ['wildfire'], features: [] },

  // FALL
  { id: 'fal1', season: 'Fall', title: 'Furnace service: test heat early', why: 'Avoid surprises on first cold night.', est_time: '15–30m', instructions_url: 'https://www.energy.gov/energysaver/furnaces-and-boilers', regions: ['freeze'], features: ['gas_heat'] },
  { id: 'fal2', season: 'Fall', title: 'Clean gutters & add leaf guards (if needed)', why: 'Prevent ice dams & overflow.', est_time: '30–60m', instructions_url: 'https://www.thisoldhouse.com/gutters/how-to-clean-gutters', regions: ['rain','freeze'], features: [] },
  { id: 'fal3', season: 'Fall', title: 'Shut down irrigation / blowout', why: 'Avoid cracked lines and heads.', est_time: '30–60m', instructions_url: 'https://www.irrigation.org/IA/FileUploads/SWAT/Homeowners_Guide_to_Landscape_Irrigation_2017.pdf', regions: ['freeze'], features: ['lawn'] },
  { id: 'fal4', season: 'Fall', title: 'Chimney sweep & inspection', why: 'Prevent creosote fires.', est_time: '1–2h', instructions_url: 'https://www.csia.org/homeowners.html', regions: ['freeze'], features: ['fireplace'] },

  // WINTER
  { id: 'win1', season: 'Winter', title: 'Weatherstrip drafty doors/windows', why: 'Save on heating; improve comfort.', est_time: '30–60m', instructions_url: 'https://www.energy.gov/energysaver/air-sealing-your-home', regions: ['freeze'], features: [] },
  { id: 'win2', season: 'Winter', title: 'Attic inspection for ice dams/leaks', why: 'Catch moisture issues early.', est_time: '20–40m', instructions_url: 'https://www.energy.gov/energysaver/attic-insulation', regions: ['freeze'], features: ['attic'] },
  { id: 'win3', season: 'Winter', title: 'Septic tank winter readiness', why: 'Avoid backups during freezes.', est_time: '30–60m', instructions_url: 'https://www.epa.gov/septic/how-care-your-septic-system', regions: ['freeze'], features: ['septic'] },
  { id: 'win4', season: 'Winter', title: 'Prepare for heavy rain/flooding', why: 'Stage sandbags; check sump pump.', est_time: '20–40m', instructions_url: 'https://www.ready.gov/floods', regions: ['rain'], features: [] }
];
