'use client';

import { useEffect, useState } from 'react';
import OnboardingForm from '../components/OnboardingForm';
import Checklist from '../components/Checklist';
import SavePromptModal from '../components/SavePromptModal';
import { supabase } from '../lib/supabaseClient';
import { currentSeason, generateTasks } from '../utils/generateTasks';

const LS_KEYS = {
  profile: 'shc_profile_v1',   // { zip, features: [] }
  status: 'shc_task_status_v1' // { [taskId]: { s: 'completed'|'skipped'|'snoozed', at: number } }
};

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savePrompt, setSavePrompt] = useState(false);
  const [booted, setBooted] = useState(false); // <-- guard so we don't overwrite localStorage on first paint

  // Auth (implicit)
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('getSession error', error);
      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
    });
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  // Load local state once on mount
  useEffect(() => {
    try {
      const rawP = localStorage.getItem(LS_KEYS.profile);
      const rawS = localStorage.getItem(LS_KEYS.status);
      const p = rawP ? JSON.parse(rawP) : null;
      const s = rawS ? JSON.parse(rawS) : {};
      if (p) {
        setProfile(p);
        const season = currentSeason();
        setTasks(generateTasks({ zip: p.zip, features: p.features, season }));
      }
      if (s) setStatus(s);
    } catch (e) {
      console.warn('Failed to load local state', e);
    } finally {
      setBooted(true); // <-- now it's safe to allow the persist effect
    }
  }, []);

  // Persist status when it changes — but ONLY after we've loaded (booted)
  useEffect(() => {
    if (!booted) return;
    try {
      localStorage.setItem(LS_KEYS.status, JSON.stringify(status || {}));
    } catch {}
  }, [status, booted]);

  const onGenerate = (p) => {
    setProfile(p);
    try {
      localStorage.setItem(LS_KEYS.profile, JSON.stringify(p));
    } catch {}
    const season = currentSeason();
    setTasks(generateTasks({ zip: p.zip, features: p.features, season }));
    if (!user) setSavePrompt(true);
  };

  const onICS = async () => {
    try {
      const res = await fetch('/api/ics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, zip: profile?.zip })
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
      <div className="header">
        <div className="brand">
          <div>
            <div className="title">Seasonal Home Checklist</div>
            <div className="small">Quarterly tasks by ZIP & features. Guest mode first; sign in to save with Google.</div>
          </div>
        </div>
        <div className="row">
          {authLoading ? (
            <span className="badge">Checking sign‑in…</span>
          ) : user ? (
            <>
              <span className="badge">Signed in: {user.email}</span>
              <button className="secondary" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </>
          ) : (
            <button
              className="secondary"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL }
                });
                if (error) {
                  console.error('OAuth error', error);
                  alert('Google sign-in failed: ' + error.message);
                }
              }}
            >
              Continue with Google
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>1) Tell us about your home</h3>
          {/* initial={profile} now updates dynamically via OnboardingForm fix below */}
          <OnboardingForm onGenerate={onGenerate} initial={profile} />
        </div>
        <div className="card">
          <h3>2) Your {currentSeason()} checklist</h3>
          <Checklist
            tasks={tasks}
            status={status}
            onStatusChange={(next) => setStatus(next)}
            onICS={onICS}
          />
        </div>
      </div>

      {savePrompt && !user && (
        <SavePromptModal
          onClose={() => setSavePrompt(false)}
          onSignIn={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: process.env.NEXT_PUBLIC_SITE_URL }
            });
            if (error) {
              console.error('OAuth error', error);
              alert('Google sign-in failed: ' + error.message);
            }
          }}
        />
      )}
    </div>
  );
}
