'use client';

import { useState } from 'react';

const FEATURES = [
  { id: 'pool', label: 'Pool' },
  { id: 'fireplace', label: 'Fireplace/Chimney' },
  { id: 'lawn', label: 'Lawn / Irrigation' },
  { id: 'gas_heat', label: 'Gas Heat' },
  { id: 'attic', label: 'Attic/Basement' },
  { id: 'septic', label: 'Septic' }
];

export default function OnboardingForm({ onGenerate, initial }) {
  const [zip, setZip] = useState(initial?.zip || '');
  const [features, setFeatures] = useState(initial?.features || []);

  const toggle = (id) => {
    setFeatures((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!/^[0-9]{5}$/.test(zip)) return alert('Please enter a valid 5-digit ZIP');
    onGenerate({ zip, features });
  };

  return (
    <form onSubmit={submit} className="grid">
      <label className="label">ZIP Code</label>
      <input
        className="input"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        placeholder="e.g., 98101"
        maxLength={5}
      />

      <label className="label">Home features</label>
      <div className="row">
        {FEATURES.map((f) => (
          <label key={f.id} className="checkbox-chip">
            <input type="checkbox" checked={features.includes(f.id)} onChange={() => toggle(f.id)} />
            {f.label}
          </label>
        ))}
      </div>

      <div className="row">
        <button className="primary" type="submit">
          Generate my checklist
        </button>
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setZip('');
            setFeatures([]);
          }}
        >
          Reset
        </button>
      </div>

      <p className="small">
        We store this locally in guest mode. Sign in with Google to save and sync across devices.
        Exported calendar events are placed on <strong>Saturday 9:00 AM (local time)</strong>, spaced evenly through the season.
        If there are more tasks than Saturdays, we’ll also use <strong>Sunday 9:00 AM</strong>.
      </p>
    </form>
  );
}
