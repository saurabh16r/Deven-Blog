'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  name: string;
  email: string;
  image: string;
  provider: string;
}

export default function SettingsClient({ initialUser }: { initialUser: UserInfo }) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [image, setImage] = useState(initialUser.image);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update settings.');
      } else {
        setSuccess('Profile updated successfully.');
        setPassword('');
        setConfirmPassword('');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (res.ok) {
        signOut({ callbackUrl: '/' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete account.');
        setLoading(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError('An error occurred during account deletion.');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-primary mb-1">
          Preferences
        </h2>
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted text-sm font-medium mt-1">
          Update your credentials and account settings.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Profile Picture */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="image-url">
            Profile Picture URL
          </label>
          <div className="flex gap-4 items-center">
            <div className="h-12 w-12 rounded-full border border-border bg-surface shrink-0 overflow-hidden flex items-center justify-center font-serif text-sm font-bold">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="object-cover h-full w-full" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <input
              id="image-url"
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="flex-grow px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="full-name">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-muted transition-colors"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="email-disabled">
            Email Address
          </label>
          <input
            id="email-disabled"
            type="email"
            disabled
            value={initialUser.email}
            className="w-full px-3 py-2 bg-surface/50 border border-border rounded-lg text-muted text-sm cursor-not-allowed focus:outline-none"
          />
          <p className="text-[10px] text-muted font-medium mt-1">
            Email cannot be modified.
          </p>
        </div>

        {/* Password fields (Only for Credentials Users) */}
        {initialUser.provider === 'credentials' ? (
          <div className="space-y-4 border-t border-border pt-6 mt-6">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-muted">
              Update Password
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="new-password">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted/50 text-sm focus:outline-none focus:border-muted transition-colors"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-6 mt-6">
            <p className="text-xs text-muted font-semibold">
              Signed in via Google. Passwords cannot be managed through Deven settings.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs font-semibold text-muted hover:text-foreground transition-colors hover:underline"
          >
            Logout
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="border-t border-border pt-8 mt-12 space-y-4">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-red-600 dark:text-red-400">
          Danger Zone
        </h3>
        
        <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-foreground">
              Delete Account
            </h4>
            <p className="text-xs text-muted max-w-md font-medium leading-relaxed">
              Once you delete your account, all reading history, bookmarks, and subscriptions will be permanently purged. This action is irreversible.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              type="button"
              className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
                className="px-4 py-2 border border-border hover:bg-surface text-muted text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
