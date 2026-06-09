"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadStatusAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LEAD_STATUSES, type LeadStatus } from "@/types";

interface UpdateStatusFormProps {
  leadId: string;
  currentStatus: LeadStatus;
  compact?: boolean;
}

export function UpdateStatusForm({
  leadId,
  currentStatus,
  compact = false,
}: UpdateStatusFormProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (nextStatus: string) => {
    const previous = status;
    setStatus(nextStatus as LeadStatus);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("leadId", leadId);
      formData.set("status", nextStatus);

      const result = await updateLeadStatusAction(formData);

      if ("error" in result && result.error) {
        setStatus(previous);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Status updated",
        description: `Lead status changed to ${nextStatus}`,
      });
      router.refresh();
    });
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          compact ? "h-8 min-w-[160px] text-xs" : "w-full sm:w-[260px]"
        )}
      >
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="z-[200]">
        {LEAD_STATUSES.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
