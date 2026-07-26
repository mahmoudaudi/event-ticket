"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/providers/ToastProvider";

interface ImageUploaderProps {
  /** Ordered list of image URLs. The first one is used as the event's banner image. */
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Drag-and-drop (or click-to-browse) image uploader. Validates type/size
 * client-side before ever hitting the network, shows a progress bar while
 * uploading, and renders thumbnails with a "make cover" and remove action.
 * The first image in the list is treated as the event's banner.
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const uploadFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles: File[] = [];

      for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type)) {
          toast.error(`${file.name}: only JPG, PNG, and WEBP images are allowed.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          toast.error(`${file.name}: file is larger than 5MB.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      const formData = new FormData();
      for (const file of validFiles) formData.append("files", file);

      setUploadProgress(0);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/uploads");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploadProgress(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText) as { uploaded: { url: string; name: string }[]; errors: string[] };
          if (response.uploaded.length > 0) {
            onChange([...images, ...response.uploaded.map((u) => u.url)]);
            toast.success(`${response.uploaded.length} image${response.uploaded.length === 1 ? "" : "s"} uploaded.`);
          }
          response.errors.forEach((message) => toast.error(message));
        } else {
          toast.error("Upload failed. Please try again.");
        }
      };

      xhr.onerror = () => {
        setUploadProgress(null);
        toast.error("Upload failed. Please check your connection and try again.");
      };

      xhr.send(formData);
    },
    [images, onChange, toast]
  );

  async function handleRemove(url: string) {
    setRemovingUrl(url);
    try {
      await fetch("/api/admin/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } finally {
      onChange(images.filter((img) => img !== url));
      setRemovingUrl(null);
    }
  }

  function handleMakeCover(url: string) {
    onChange([url, ...images.filter((img) => img !== url)]);
  }

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-cream-alt">
              <Image src={url} alt="" fill sizes="200px" className="object-cover" unoptimized />
              {index === 0 && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-ink-inverse">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/50 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(url)}
                    aria-label="Make cover image"
                    className="rounded-lg bg-surface p-2 text-ink hover:bg-cream-alt"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  disabled={removingUrl === url}
                  aria-label="Remove image"
                  className="rounded-lg bg-surface p-2 text-danger hover:bg-danger-soft disabled:opacity-50"
                >
                  {removingUrl === url ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 py-8 text-center transition-colors",
          isDraggingOver ? "border-brand bg-brand-soft" : "hover:border-border-strong hover:bg-cream-alt"
        )}
      >
        {uploadProgress !== null ? (
          <>
            <UploadCloud className="h-6 w-6 animate-pulse text-brand" />
            <p className="text-sm font-medium text-ink">Uploading… {uploadProgress}%</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-cream-alt">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-ink-muted" />
            <p className="text-sm font-medium text-ink">Drag and drop images, or click to browse</p>
            <p className="text-xs text-ink-muted">JPG, PNG, or WEBP — up to 5MB each</p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) uploadFiles(e.target.files);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
