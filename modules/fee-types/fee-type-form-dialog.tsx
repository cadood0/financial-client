"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Modal } from "@/components/shared/modal";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createFeeType, updateFeeType } from "@/services/fee-types.service";
import type { FeeType } from "@/types/fee-type";
import { getApiErrorMessage } from "@/utils/api-error";

const feeTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  description: z.string().max(250, "Description must be at most 250 characters"),
  is_active: z.boolean(),
});

type FeeTypeFormValues = z.infer<typeof feeTypeSchema>;

type FeeTypeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeType?: FeeType | null;
};

export function FeeTypeFormDialog({
  open,
  onOpenChange,
  feeType,
}: FeeTypeFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(feeType);

  const form = useForm<FeeTypeFormValues>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const isActive = useWatch({ control: form.control, name: "is_active" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      feeType
        ? {
            name: feeType.name,
            description: feeType.description ?? "",
            is_active: feeType.is_active,
          }
        : {
            name: "",
            description: "",
            is_active: true,
          },
    );
  }, [feeType, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: FeeTypeFormValues) => {
      const payload = {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
      };
      if (feeType) return updateFeeType(feeType.id, payload);
      return createFeeType(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fee-types"] });
      toast.success(isEdit ? "Fee type updated" : "Fee type created");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to save fee type"));
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Fee Type" : "Create Fee Type"}
      description={
        isEdit
          ? "Update fee category details and active status."
          : "Define a standardized fee category for members and recurring charges."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="fee-type-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Fee Type"}
          </Button>
        </>
      }
    >
      <form
        id="fee-type-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <Label htmlFor="fee-type-name">Name</Label>
          <Input
            id="fee-type-name"
            placeholder="Monthly Membership"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee-type-description">Description</Label>
          <Textarea
            id="fee-type-description"
            placeholder="Standard recurring membership fee for all active residents."
            rows={3}
            aria-invalid={Boolean(form.formState.errors.description)}
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-muted-foreground text-xs">
              Inactive fee types cannot be attached to new monthly charges.
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) =>
              form.setValue("is_active", checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>
      </form>
    </Modal>
  );
}
