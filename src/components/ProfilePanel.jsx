import { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function ProfilePanel() {
  const [open, setOpen] = useState(false);
  const user = auth.currentUser;

  if (!user) return null;

  return (
    <>
      <button className="theme-btn" onClick={() => setOpen(true)} title="Profile">
        {user.photoURL
          ? <img src={user.photoURL} className="avatar-sm" alt="avatar" referrerPolicy="no-referrer" />
          : '👤'}
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal profile-modal">
            <div className="modal-header">
              <h2>Profile</h2>
              <button className="btn-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="profile-body">
              {user.photoURL && (
                <img src={user.photoURL} className="avatar-lg" alt="avatar" referrerPolicy="no-referrer" />
              )}
              <div className="profile-name">{user.displayName}</div>
              <div className="profile-email">{user.email}</div>

              <div className="profile-uid-box">
                <span className="profile-uid-label">Your UID (for widget setup)</span>
                <code className="profile-uid">{user.uid}</code>
                <button
                  className="btn-copy"
                  onClick={() => navigator.clipboard.writeText(user.uid)}
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              className="btn-signout"
              onClick={() => { signOut(auth); setOpen(false); }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
