"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addNoteAction } from "@/lib/actions";
import { addNoteSchema, type AddNoteData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

interface AddNoteFormProps {
  leadId: string;
}

export function AddNoteForm({ leadId }: AddNoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddNoteData>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { leadId, note: "" },
  });

  const onSubmit = (data: AddNoteData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("leadId", data.leadId);
      formData.set("note", data.note);

      const result = await addNoteAction(formData);

      if (result && "error" in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Note added",
        description: "Your note has been saved.",
      });
      reset({ leadId, note: "" });
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("leadId")} />
      <div className="space-y-2">
        <Label htmlFor="note">Add a note</Label>
        <Textarea
          id="note"
          placeholder="Enter your note about this lead..."
          rows={3}
          {...register("note")}
        />
        {errors.note && (
          <p className="text-sm text-destructive">{errors.note.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Add Note"}
      </Button>
    </form>
  );
}
