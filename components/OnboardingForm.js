'use client';

import { useEffect, useState } from 'react';

const FEATURE_OPTIONS = [
  { id: 'pool', label: 'Pool' },
  { id: 'fireplace', label: 'Fireplace/Chimney' },
  { id: 'lawn', label: 'Lawn/Irrigation' },
  { id: 'gas_heat', label: 'Gas Heat' },
  { id: 'attic', label: 'Attic/Basement' },
  { id: 'septic', label: 'Septic' },
];

export default function OnboardingForm({ onGenerate, initial }) {
  const [zip, setZip] = useState(initial?.zip || '');
  const [features, setFeatures] = useState(initial?.features || []);

  // IMPORTANT: keep inputs in sync if parent updates `initial` later (e.g., after localStorage load)
  useEffect(() => {
    if (initial?.zip !== undefined) setZip(initial.zip || '');
    if (initial?.features !== undefined) setFeatures(initial.features || []);
  }, [initial?.zip, initial?.features]); // narrow deps so it only fires when values change

  const toggleFeature = (id) => {
    setFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const cleanedZip = (zip || '').trim();
    if (!/^\d{5}$/.test(cleanedZip)) {
      alert('Please enter a valid 5‑digit ZIP code');
      return;
    }
    onGenerate({ zip: cleanedZip, features });
  };

  return (
    <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
      <label className="label" htmlFor="zip">ZIP code</label>
      <input
        id="zip"
        className="input"
        inputMode="numeric"
        pattern="\d{5}"
        placeholder="e.g., 98027"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
      />

      <div className="label" style={{ marginTop: 8 }}>Home features</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {FEATURE_OPTIONS.map((f) => (
          <label key={f.id} className="checkbox-chip">
            <input
              type="checkbox"
              checked={features.includes(f.id)}
              onChange={() => toggleFeature(f.id)}
            />
            {f.label}
          </label>
        ))}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <button className="primary" type="submit">Generate checklist</button>
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
    </form>
  );
}
