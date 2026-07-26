"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PrintTicketButtonProps {
  label?: string;
}

export function PrintTicketButton({ label = "Save as PDF" }: PrintTicketButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      icon={<Download className="h-4 w-4" />}
      onClick={() => window.print()}
      className="rounded-full"
    >
      {label}
    </Button>
  );
}
