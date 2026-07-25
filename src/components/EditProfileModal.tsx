"use client";

import { useState } from "react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: { firstName: string; lastName: string; profileImage?: string };
  onSave: (data: { firstName: string; lastName: string; profileImage?: string }) => void;
}

export default function EditProfileModal({ open, onClose, user, onSave }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [profileImage, setProfileImage] = useState(user.profileImage || "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Edit Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Profile Image URL</label>
            <input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-surface text-on-surface font-medium hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave({ firstName, lastName, profileImage: profileImage || undefined })} className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:brightness-110 transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
