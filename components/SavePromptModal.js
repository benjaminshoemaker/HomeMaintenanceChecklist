'use client';

export default function SavePromptModal({ onClose, onSignIn }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Save your progress">
      <div className="modal-body">
        <h3>Save your checklist</h3>
        <p className="small">
          Sign in with Google to save your home profile and history, and sync across devices.
        </p>
        <div className="row">
          <button className="primary" onClick={onSignIn}>
            Continue with Google
          </button>
          <button className="secondary" onClick={onClose}>
            Not now
          </button>
        </div>
        <p className="small">We only store your email + home profile. You can delete your data at any time.</p>
      </div>
    </div>
  );
}
