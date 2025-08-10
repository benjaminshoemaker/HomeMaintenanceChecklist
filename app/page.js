'use client';

import { useEffect, useState } from 'react';
import OnboardingForm from '../components/OnboardingForm';
import Checklist from '../components/Checklist';
import SavePromptModal from '../components/SavePromptModal';
import { supabase } from '../lib/supabaseClient';
import { currentSeason, generateTasks } from '../utils/generateTasks';

export default function Home() {
  const [profile, setProfile] = useState(null);       // { zip, features: [] }
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savePrompt, setSavePrompt] = useState(false);

  useEffect(() => {
    // Initialize auth from session; implicit flow will parse tokens from URL hash automatically
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('getSession error', error);
      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
    });

    // Keep user state live
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      const season = currentSeason();
      const generated = generateTasks({ zip: profile.zip, features: profile.features, season });
      setTasks(generated);
    } else {
      setTasks([]);
    }
  }, [profile]);

  const onGenerate = (p) => {
    setProfile(p); // ephemeral only
    const season = currentSeason();
    const generated = generateTasks({ zip: p.zip, features: p.features, season });
    setTasks(generated);
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
          <OnboardingForm onGenerate={onGenerate} initial={null} />
        </div>
        <div className="card">
          <h3>2) Your {currentSeason()} checklist</h3>
          <Checklist tasks={tasks} onICS={onICS} />
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
