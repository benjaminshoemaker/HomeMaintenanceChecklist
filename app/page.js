'use client';

import { useEffect, useState } from 'react';
import OnboardingForm from '../components/OnboardingForm';
import Checklist from '../components/Checklist';
import SavePromptModal from '../components/SavePromptModal';
import { supabase } from '../lib/supabaseClient';
import { currentSeason, generateTasks } from '../utils/generateTasks';

const LS_KEYS = {
  profile: 'shc_profile_v1',
  status: 'shc_task_status_v1'
};

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savePrompt, setSavePrompt] = useState(false);
  const [booted, setBooted] = useState(false);

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
      setBooted(true);
    }
  }, []);

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

      <footer className="site-footer">
        <span className="small">Built with Next.js & Supabase · Deployed on Render</span>
        <div className="row" style={{ gap: 8 }}>
          <a
            className="gh-link"
            href="https://github.com/benjaminshoemaker/HomeMaintenanceChecklist"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
          <a
            className="gh-link"
            href="mailto:ben.shoemaker.xyz@gmail.com?subject=Seasonal%20Home%20Checklist%20feedback"
            aria-label="Send feedback email"
          >
            Feedback
          </a>
          <a
            className="gh-link"
            href="https://www.linkedin.com/in/benshoemaker000/"
            rel="me"
            target="_blank"
          >
            LinkedIn
          </a>
        </div>
      </footer>



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
