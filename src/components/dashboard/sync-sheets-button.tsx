"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncSheetsAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export function SyncSheetsButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncSheetsAction();

      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Sync failed",
          description: result.error,
        });
        return;
      }

      toast({
        title: result.imported > 0 ? "Leads imported" : "Sync complete",
        description: result.message,
        variant: result.imported === 0 && result.invalid > 0 ? "destructive" : "default",
      });
    });
  };

  return (
    <Button onClick={handleSync} disabled={isPending} variant="outline">
      <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Syncing..." : "Sync from Google Sheet"}
    </Button>
  );
}
