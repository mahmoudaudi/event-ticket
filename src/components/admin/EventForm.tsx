"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input, Select, Textarea } from "@/components/ui/Field";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { LocationPicker } from "@/components/admin/LocationPicker";
import type { AdminCategory, AdminEventDetail } from "@/types/admin";
import { useToast } from "@/components/providers/ToastProvider";
import { eventInputSchema } from "@/lib/validation/event";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  categories: AdminCategory[];
  initialData?: AdminEventDetail;
}

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  venue: string;
  address: string;
  city: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  organizer: string;
  images: string[];
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
};

const EMPTY_STATE: FormState = {
  title: "",
  description: "",
  categoryId: "",
  venue: "",
  address: "",
  city: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  organizer: "Crescent Live Event Hall",
  images: [],
  status: "DRAFT",
};

/** Create/edit form for an Event. On create, redirects to the edit page so ticket tiers can be added. */
export function EventForm({ mode, eventId, categories, initialData }: EventFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          categoryId: initialData.categoryId,
          venue: initialData.venue,
          address: initialData.address,
          city: initialData.city,
          eventDate: initialData.eventDate,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          organizer: initialData.organizer,
          images: initialData.images.length > 0 ? initialData.images : initialData.bannerImage ? [initialData.bannerImage] : [],
          status: initialData.status,
        }
      : { ...EMPTY_STATE, categoryId: categories[0]?.id ?? "" }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setServerError(null);

    const payload = {
      ...form,
      bannerImage: form.images[0] ?? "",
    };

    // Validate with the same schema the API enforces, so mistakes surface
    // instantly instead of after a round-trip to the server.
    const parsed = eventInputSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${eventId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const responseBody = await res.json();
        if (responseBody.error?.fieldErrors) {
          const fieldErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(responseBody.error.fieldErrors)) {
            if (Array.isArray(messages) && messages[0]) fieldErrors[field] = messages[0] as string;
          }
          setErrors(fieldErrors);
          toast.error("Please fix the highlighted fields and try again.");
        } else {
          const message = responseBody.error ?? "Something went wrong. Please try again.";
          setServerError(message);
          toast.error(message);
        }
        return;
      }

      if (mode === "create") {
        const { id } = await res.json();
        toast.success("Event created. Add ticket tiers below.");
        router.push(`/admin/events/${id}/edit`);
      } else {
        toast.success("Event updated.");
        router.push("/admin/events");
      }
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">{serverError}</p>
      )}

      <FieldWrapper label="Event title" htmlFor="title" error={errors.title}>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Midnight Symphony: World Tour 2026"
          required
        />
      </FieldWrapper>

      <FieldWrapper label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What should guests know about this event?"
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldWrapper label="Category" htmlFor="categoryId" error={errors.categoryId}>
          <Select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FieldWrapper>

        <FieldWrapper label="Status" htmlFor="status">
          <Select
            id="status"
            value={form.status}
            onChange={(e) => update("status", e.target.value as FormState["status"])}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </FieldWrapper>
      </div>

      <FieldWrapper label="Location" error={errors.venue || errors.city}>
        <LocationPicker
          venue={form.venue}
          address={form.address}
          city={form.city}
          onChange={(fields) => {
            setForm((prev) => ({ ...prev, ...fields }));
          }}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FieldWrapper label="Event date" htmlFor="eventDate" error={errors.eventDate}>
          <Input
            id="eventDate"
            type="date"
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            required
          />
        </FieldWrapper>
        <FieldWrapper label="Start time" htmlFor="startTime" error={errors.startTime}>
          <Input
            id="startTime"
            placeholder="8:00 PM"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            required
          />
        </FieldWrapper>
        <FieldWrapper label="End time" htmlFor="endTime" error={errors.endTime}>
          <Input
            id="endTime"
            placeholder="10:30 PM"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            required
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Organizer" htmlFor="organizer" error={errors.organizer}>
        <Input id="organizer" value={form.organizer} onChange={(e) => update("organizer", e.target.value)} />
      </FieldWrapper>

      <FieldWrapper label="Event images" htmlFor="images" error={errors.bannerImage}>
        <ImageUploader images={form.images} onChange={(images) => update("images", images)} />
      </FieldWrapper>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Create event & add tickets" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/events")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
