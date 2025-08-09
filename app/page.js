'use client';

import { useEffect, useMemo, useState } from 'react';
import OnboardingForm from '../components/OnboardingForm';
import Checklist from '../components/Checklist';
import SavePromptModal from '../components/SavePromptModal';
import { supabase } from '../lib/supabaseClient';
import { generateTasks, currentSeason } from '../utils/generateTasks';

export default function Home() {
  const [profile, setProfile] = useState(null);       // { zip, features: [] }
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [savePrompt, setSavePrompt] = useState(false);

  useEffect(() => {
    // Load guest profile from localStorage
    const raw = localStorage.getItem('shc_profile_v1');
    if (raw) setProfile(JSON.parse(raw));
    // Auth session
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const onGenerate = (p) => {
    setProfile(p);
    localStorage.setItem('shc_profile_v1', JSON.stringify(p));
    const season = currentSeason();
    const generated = generateTasks({ zip: p.zip, features: p.features, season });
    setTasks(generated);
    // Show save prompt after first generation (only if not signed in)
    if (!user) setSavePrompt(true);
  };

  const onICS = async () => {
    try {
      const res = await fetch('/api/ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      if (!res.ok) throw new Error('Failed to generate ICS');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'seasonal-home-checklist.ics';
      a.click();
      URL.revokeObjectURL(url);
      if (!user) setSavePrompt(true);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Seasonal Home Checklist</h1>
        <p className="small">Personalized quarterly tasks by ZIP & home features. Guest mode first; sign in to save with Google.</p>
        <div className="row">
          {user ? (
            <>
              <span className="badge">Signed in: {user.email}</span>
              <button className="secondary" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </>
          ) : (
            <button className="secondary" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL } })}>Continue with Google</button>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>1) Tell us about your home</h3>
          <OnboardingForm onGenerate={onGenerate} initial={profile} />
        </div>
        <div className="card">
          <h3>2) Your {currentSeason()} checklist</h3>
          <Checklist tasks={tasks} onICS={onICS} />
        </div>
      </div>

      {savePrompt && !user && (
        <SavePromptModal
          onClose={() => setSavePrompt(false)}
          onSignIn={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL } })}
        />
      )}
    </div>
  );
}
