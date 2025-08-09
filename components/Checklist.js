'use client';

import { useMemo, useState } from 'react';

function TaskCard({ task, onStatus }) {
  return (
    <div className="task">
      <h4>{task.title}</h4>
      <div className="meta">{task.why}</div>
      <div className="meta">Est. time: {task.est_time} | Source: <a href={task.instructions_url} target="_blank" rel="noopener noreferrer">how‑to</a></div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="primary" onClick={() => onStatus(task.id, 'completed')}>Complete</button>
        <button className="secondary" onClick={() => onStatus(task.id, 'skipped')}>Skip</button>
        <button className="secondary" onClick={() => onStatus(task.id, 'snoozed')}>Snooze</button>
      </div>
    </div>
  );
}

export default function Checklist({ tasks, onICS }) {
  const [status, setStatus] = useState({}); // id -> completed|skipped|snoozed

  const onStatus = (id, s) => {
    setStatus(prev => ({ ...prev, [id]: s }));
    const key = 'shc_task_status_v1';
    const merged = { ...(JSON.parse(localStorage.getItem(key) || '{}')), [id]: { s, at: Date.now() } };
    localStorage.setItem(key, JSON.stringify(merged));
  };

  const hasTasks = tasks && tasks.length > 0;

  return (
    <div className="grid">
      {!hasTasks && <p className="small">No tasks yet. Complete the form to generate your seasonal checklist.</p>}
      {hasTasks && (
        <>
          <div className="row">
            <button className="primary" onClick={onICS}>Export as .ics</button>
            <span className="badge">Tasks: {tasks.length}</span>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            {tasks.map(t => <TaskCard key={t.id} task={t} onStatus={onStatus} />)}
          </div>
        </>
      )}
    </div>
  );
}
