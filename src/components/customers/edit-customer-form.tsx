"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCustomerAction } from "@/lib/actions";
import {
  updateCustomerSchema,
  type UpdateCustomerData,
} from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/types";

interface EditCustomerFormProps {
  customer: Customer;
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateCustomerData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      company: customer.company ?? "",
    },
  });

  const onSubmit = (data: UpdateCustomerData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("customerId", data.customerId);
      formData.set("name", data.name);
      formData.set("phone", data.phone);
      formData.set("email", data.email ?? "");
      formData.set("company", data.company ?? "");

      const result = await updateCustomerAction(formData);

      if (result && "error" in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Customer updated",
        description: "Contact details have been saved.",
      });
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("customerId")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Customer"}
      </Button>
    </form>
  );
}
