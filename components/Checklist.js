'use client';

import { useState } from 'react';

function TaskCard({ task, onStatus, st }) {
  const state = st[task.id]; // 'completed' | 'skipped' | 'snoozed' | undefined
  const isDone = state === 'completed';
  const isSkipped = state === 'skipped';

  return (
    <div className="task" style={{ opacity: isSkipped ? 0.55 : 1 }}>
      <h4 style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{task.title}</h4>
      <div className="meta">{task.why}</div>
      <div className="meta">
        Est. time: {task.est_time} |{' '}
        <a href={task.instructions_url} target="_blank" rel="noreferrer noopener external" className="howto-link">
          How‑to
        </a>
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="primary" onClick={() => onStatus(task.id, isDone ? undefined : 'completed')}>
          {isDone ? 'Mark undone' : 'Complete'}
        </button>
        <button className="secondary" onClick={() => onStatus(task.id, isSkipped ? undefined : 'skipped')}>
          {isSkipped ? 'Unskip' : 'Skip'}
        </button>
        <button className="secondary" onClick={() => onStatus(task.id, 'snoozed')}>Snooze</button>
      </div>
    </div>
  );
}

export default function Checklist({ tasks, onICS }) {
  const [status, setStatus] = useState({}); // ephemeral only

  const onStatus = (id, s) => {
    setStatus((prev) => {
      const next = { ...prev };
      if (!s) delete next[id]; else next[id] = s;
      return next;
    });
  };

  const hasTasks = tasks && tasks.length > 0;

  return (
    <div className="grid">
      {!hasTasks && <p className="small">No tasks yet. Complete the form to generate your seasonal checklist.</p>}
      {hasTasks && (
        <>
          <div className="row" style={{ marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="primary" onClick={onICS}>Export as .ics</button>
            <span className="small">
              Calendar events are scheduled for <strong>Saturday 9:00 AM (local time)</strong>, spaced across the season.
              If Saturdays fill up, we’ll also use <strong>Sunday 9:00 AM</strong>.
            </span>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} st={status} onStatus={onStatus} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
