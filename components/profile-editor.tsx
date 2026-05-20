'use client';

import { useRef, useState } from 'react';
import { Camera, Trash2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadAvatar, removeAvatar, updateDisplayName } from '@/app/settings/actions';
import type { Profile } from '@/lib/supabase/types';

interface Messages {
  profileHeading: string;
  profileNameLabel: string;
  profileSave: string;
  profileChangePicture: string;
  profileAvatarMimeHint: string;
  profileRemoveConfirm: string;
  profileAvatarUpdated: string;
  profileAvatarRemoved: string;
  profileNameSaved: string;
  profileFailed: string;
  profileAvatarRemove: string;
}

interface Props {
  profile: Profile | null;
  email: string;
  messages: Messages;
}

export function ProfileEditor({ profile, email, messages }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(profile?.avatar_url || null);
  const [name, setName] = useState(profile?.display_name || '');
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function flash(kind: 'ok' | 'err', text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 3000);
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    const r = await uploadAvatar(fd);
    setUploading(false);
    if (r.ok) {
      setAvatar(r.url);
      flash('ok', messages.profileAvatarUpdated);
    } else {
      flash('err', r.error || messages.profileFailed);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onRemove() {
    if (!confirm(messages.profileRemoveConfirm)) return;
    setUploading(true);
    await removeAvatar();
    setUploading(false);
    setAvatar(null);
    flash('ok', messages.profileAvatarRemoved);
  }

  async function onSaveName() {
    setSavingName(true);
    const r = await updateDisplayName(name);
    setSavingName(false);
    if (r.ok) flash('ok', messages.profileNameSaved);
    else flash('err', r.error || messages.profileFailed);
  }

  const initials = (name || email).slice(0, 1).toUpperCase();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-5 font-semibold">{messages.profileHeading}</h2>

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="group relative grid size-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-purple-600 text-2xl font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
              aria-label={messages.profileChangePicture}
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="size-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
              {uploading ? (
                <div className="absolute inset-0 grid place-items-center bg-black/50">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <Camera className="size-6 text-white" />
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={onPick}
            />
          </div>

          {/* Actions */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground" dir="ltr">{email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{messages.profileAvatarMimeHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline" size="sm" className="gap-1.5">
                <Camera className="size-3.5" /> {messages.profileChangePicture}
              </Button>
              {avatar && (
                <Button onClick={onRemove} disabled={uploading} variant="outline" size="sm" className="gap-1.5 text-destructive">
                  <Trash2 className="size-3.5" /> {messages.profileAvatarRemove}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Display name */}
        <div className="mt-6">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{messages.profileNameLabel}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={onSaveName} disabled={savingName || name === (profile?.display_name || '')}>
              {savingName ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {messages.profileSave}
            </Button>
          </div>
        </div>

        {msg && (
          <p className={`mt-3 text-xs ${msg.kind === 'ok' ? 'text-success' : 'text-destructive'}`}>
            {msg.kind === 'ok' ? '✓' : '⚠'} {msg.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
