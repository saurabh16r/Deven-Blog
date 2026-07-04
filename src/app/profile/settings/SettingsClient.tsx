'use client';

import React, { useState, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import ImageCropperModal from '@/components/profile/ImageCropperModal';

interface UserInfo {
  name: string;
  email: string;
  image: string;
  provider: string;
}

export default function SettingsClient({ initialUser }: { initialUser: UserInfo }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialUser.name);
  const [image, setImage] = useState(initialUser.image);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile Image Upload & Crop States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'FB';
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setAvatarMessage('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Unsupported Format. Please select a JPG, JPEG, PNG, or WEBP image.');
      if (e.target) e.target.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setUploadError('Image Too Large. The maximum allowed size is 5 MB.');
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCropSave = (croppedBlob: Blob) => {
    setCropperOpen(false);
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setAvatarMessage('');

    const form = new FormData();
    form.append('file', croppedBlob, 'profile.jpg');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.onload = async () => {
      setUploading(false);
      setUploadProgress(0);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const secureUrl = data.url;
          
          // Immediately update MongoDB via profile endpoint
          const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name,
              image: secureUrl,
            }),
          });

          if (res.ok) {
            setImage(secureUrl);
            setAvatarMessage('Profile picture updated successfully.');
            // Update client session state instantly
            await updateSession({ image: secureUrl });
            router.refresh();
          } else {
            const errData = await res.json();
            setUploadError(errData.error || 'Failed to update profile settings.');
          }
        } catch (err) {
          setUploadError('Upload failed: Invalid response from server.');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(data.error || 'Upload Failed. Please try again.');
        } catch {
          setUploadError(`Upload Failed with status code ${xhr.status}.`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadProgress(0);
      setUploadError('Network Error. Please check your connection.');
    };

    xhr.open('POST', '/api/profile/upload');
    xhr.send(form);
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setUploading(true);
    setUploadError('');
    setAvatarMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image: '', // clear photo
        }),
      });

      if (res.ok) {
        setImage('');
        setAvatarMessage('Profile picture removed successfully.');
        await updateSession({ image: '' });
        router.refresh();
      } else {
        const errData = await res.json();
        setUploadError(errData.error || 'Failed to remove profile picture.');
      }
    } catch (err) {
      setUploadError('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
        // Sync updates to local session state
        await updateSession({ name, image });
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
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Profile Picture
          </label>
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
            {/* Interactive Avatar Container */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload profile picture"
                className="h-28 w-28 rounded-full border-2 border-border bg-surface overflow-hidden flex items-center justify-center font-serif text-3xl font-bold relative focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all cursor-pointer group-hover:border-muted select-none"
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="Current avatar" className="object-cover h-full w-full transition-all group-hover:scale-105" />
                ) : (
                  <span className="text-foreground/80">{getInitials(name)}</span>
                )}
                
                {/* Hover overlay on desktop */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 text-white gap-1 select-none">
                  <Camera className="h-5 w-5 stroke-[2] drop-shadow-sm" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-center drop-shadow-sm leading-none">Change<br/>Photo</span>
                </div>

                {/* Uploading progress spinner/overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-foreground gap-1.5 z-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest">{uploadProgress}%</span>
                  </div>
                )}
              </button>
            </div>

            {/* Actions & Description */}
            <div className="flex flex-col justify-center gap-1.5 text-center sm:text-left h-auto sm:h-28">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-surface border border-border hover:border-muted text-foreground text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Change Photo
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="px-4 py-2 border border-red-500/20 hover:border-red-500/35 hover:bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted font-medium mt-1 leading-relaxed max-w-xs">
                Supports JPG, JPEG, PNG, or WEBP files. Maximum size: 5 MB. Circular crop is applied automatically.
              </p>
              
              {/* Validation/Upload Errors */}
              {uploadError && (
                <p className="text-red-600 dark:text-red-400 text-xs font-semibold mt-1">
                  {uploadError}
                </p>
              )}
              {/* Success messages specific to avatar */}
              {avatarMessage && (
                <p className="text-green-600 dark:text-green-400 text-xs font-semibold mt-1">
                  {avatarMessage}
                </p>
              )}
            </div>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
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
            disabled={loading || uploading}
            className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-bold text-sm tracking-wide rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Saving...' : uploading ? 'Uploading...' : 'Save Changes'}
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

      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={selectedImage}
          onCancel={() => setCropperOpen(false)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
