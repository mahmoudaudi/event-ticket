"use client";

import { useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { useToast } from "@/components/providers/ToastProvider";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function EditProfileForm({ profile }: { profile: ProfileData }) {
  const toast = useToast();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const savedRef = useRef({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = firstName !== savedRef.current.firstName || lastName !== savedRef.current.lastName || email !== savedRef.current.email;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong.");
        toast.error(payload.error ?? "Couldn't update profile.");
        return;
      }
      savedRef.current = { firstName, lastName, email };
      const userCookie = JSON.stringify({ id: profile.id, firstName, lastName, email, role: "ADMIN" });
      document.cookie = `user=${encodeURIComponent(userCookie)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      toast.success("Profile updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper label="First name" htmlFor="firstName">
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </FieldWrapper>
        <FieldWrapper label="Last name" htmlFor="lastName">
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Email" htmlFor="email">
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </FieldWrapper>

      <Button type="submit" isLoading={isSubmitting} disabled={!hasChanges} className="self-start">
        Save changes
      </Button>
    </form>
  );
}
