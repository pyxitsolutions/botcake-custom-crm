"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadAction } from "@/lib/actions";
import { updateLeadSchema, type UpdateLeadData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { LEAD_SOURCES, type Lead } from "@/types";

interface EditLeadFormProps {
  lead: Lead;
}

export function EditLeadForm({ lead }: EditLeadFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateLeadData>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      leadId: lead.id,
      project_type: lead.project_type,
      project_goal: lead.project_goal,
      budget: lead.budget ?? "",
      timeline: lead.timeline ?? "",
      source: lead.source,
    },
  });

  const onSubmit = (data: UpdateLeadData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("leadId", data.leadId);
      formData.set("project_type", data.project_type);
      formData.set("project_goal", data.project_goal);
      formData.set("budget", data.budget ?? "");
      formData.set("timeline", data.timeline ?? "");
      formData.set("source", data.source ?? "botcake");

      const result = await updateLeadAction(formData);

      if (result && "error" in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Lead updated",
        description: "Project details have been saved.",
      });
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("leadId")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project_type">Project Type</Label>
          <Input id="project_type" {...register("project_type")} />
          {errors.project_type && (
            <p className="text-sm text-destructive">
              {errors.project_type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="project_goal">Project Goal</Label>
          <Textarea
            id="project_goal"
            rows={3}
            {...register("project_goal")}
          />
          {errors.project_goal && (
            <p className="text-sm text-destructive">
              {errors.project_goal.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" {...register("budget")} />
          {errors.budget && (
            <p className="text-sm text-destructive">{errors.budget.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline</Label>
          <Input id="timeline" {...register("timeline")} />
          {errors.timeline && (
            <p className="text-sm text-destructive">{errors.timeline.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Lead"}
      </Button>
    </form>
  );
}
