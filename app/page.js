'use client';

import { useEffect, useState } from 'react';
import OnboardingForm from '../components/OnboardingForm';
import Checklist from '../components/Checklist';
import SavePromptModal from '../components/SavePromptModal';
import { supabase } from '../lib/supabaseClient';
import { currentSeason, generateTasks } from '../utils/generateTasks';

const LS_KEYS = {
  profile: 'shc_profile_v1',
  status: 'shc_task_status_v1',
  updatedAt: 'shc_updated_at_v1'
};

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({});
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savePrompt, setSavePrompt] = useState(false);
  const [booted, setBooted] = useState(false);

  // Cloud status
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudSavedAt, setCloudSavedAt] = useState(null);

  // NEW: block autosave until cloud load/merge finishes
  const [synced, setSynced] = useState(false);

  // 1) Auth boot
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

  // Recompute tasks whenever the profile changes (works for guest + signed-in)
  useEffect(() => {
    const p = profile;
    if (!p || !p.zip) {
      setTasks([]);
      return;
    }
    const season = currentSeason();
    setTasks(generateTasks({ zip: p.zip, features: p.features || [], season }));
  }, [profile]);

  // 2) Guest boot: only load localStorage if NOT signed in
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      setBooted(true);
      return; // skip local entirely when signed in
    }
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
  }, [authLoading, user]);

  // 3) Signed‑in boot: load from cloud; if no cloud doc yet, migrate local once then CLEAR local
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        setSynced(false); // <- block autosave during initial cloud fetch/merge

        // Try cloud first
        const { data, error } = await supabase
          .from('user_state')
          .select('profile, status, updated_at')
          .eq('auth_uid', user.id)
          .maybeSingle();

        if (error) {
          console.error('Fetch user_state error', error);
          return;
        }

        if (data) {
          // Use cloud
          const p = data.profile || null;
          const s = data.status || {};
          setProfile(p);
          if (p?.zip) {
            const season = currentSeason();
            setTasks(generateTasks({ zip: p.zip, features: p.features || [], season }));
          } else {
            setTasks([]);
          }
          setStatus(s);
          setCloudSavedAt(data.updated_at || null);
        } else {
          // No cloud doc yet — migrate any existing local, then CLEAR local
          let localProfile = null, localStatus = null;
          try {
            localProfile = JSON.parse(localStorage.getItem(LS_KEYS.profile) || 'null');
            localStatus = JSON.parse(localStorage.getItem(LS_KEYS.status) || '{}');
          } catch {}

          const payload = {
            auth_uid: user.id,
            email: user.email,
            profile: localProfile || {},
            status: localStatus || {},
            updated_at: new Date().toISOString()
          };
          const { error: upsertErr } = await supabase.from('user_state').upsert(payload);
          if (upsertErr) {
            console.error('Initial upsert error', upsertErr);
          } else {
            setProfile(payload.profile);
            if (payload.profile?.zip) {
              const season = currentSeason();
              setTasks(generateTasks({ zip: payload.profile.zip, features: payload.profile.features || [], season }));
            } else {
              setTasks([]);
            }
            setStatus(payload.status);
            setCloudSavedAt(payload.updated_at);
          }
        }
      } finally {
        // Wipe localStorage to remove ambiguity while signed in
        try {
          localStorage.removeItem(LS_KEYS.profile);
          localStorage.removeItem(LS_KEYS.status);
          localStorage.removeItem(LS_KEYS.updatedAt);
        } catch {}
        setBooted(true);
        setSynced(true); // <- now allow autosave
      }
    })();
  }, [authLoading, user]);

  // 4) While signed in, NEVER touch localStorage; autosave changes to cloud
  useEffect(() => {
    if (!booted || !user || !synced) return; // <- guard with synced
    const doSave = async () => {
      try {
        setCloudSaving(true);
        const payload = {
          auth_uid: user.id,
          email: user.email,
          profile: profile || {},
          status: status || {},
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('user_state').upsert(payload);
        if (error) {
          console.error('Cloud save error', error);
        } else {
          setCloudSavedAt(payload.updated_at);
        }
      } finally {
        setCloudSaving(false);
      }
    };
    doSave();
  }, [profile, status, user, booted, synced]);

  // 5) Guest: persist to localStorage (signed‑out only)
  useEffect(() => {
    if (!booted || user) return; // only guests
    try {
      localStorage.setItem(LS_KEYS.status, JSON.stringify(status || {}));
    } catch {}
  }, [status, booted, user]);

  const onGenerate = (p) => {
    setProfile(p);
    const season = currentSeason();
    setTasks(generateTasks({ zip: p.zip, features: p.features, season }));

    if (!user) {
      // guest mode: keep local in sync
      try {
        localStorage.setItem(LS_KEYS.profile, JSON.stringify(p));
        localStorage.setItem(LS_KEYS.updatedAt, new Date().toISOString());
      } catch {}
      setSavePrompt(true);
    }
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
            <div className="small">Quarterly tasks by ZIP & features. Sign in to save your progress across devices.</div>
          </div>
        </div>
        <div className="row">
          {authLoading ? (
            <span className="badge">Checking sign‑in…</span>
          ) : user ? (
            <>
              <span className="badge">Signed in: {user.email}</span>
              {cloudSaving ? <span className="badge">…</span> : (cloudSavedAt ? <span className="badge">Saved</span> : null)}
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
