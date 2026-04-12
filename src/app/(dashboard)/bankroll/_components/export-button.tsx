"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function ExportButton() {
  function handleClick() {
    toast({
      title: "Export started",
      description: "Your XLS file is being downloaded.",
      variant: "success",
    });
  }

  return (
    <a href="/api/export/sessions" download onClick={handleClick}>
      <Button variant="secondary" size="sm" className="gap-2">
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Export XLS</span>
      </Button>
    </a>
  );
}
