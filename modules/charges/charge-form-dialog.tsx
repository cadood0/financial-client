"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Modal } from "@/components/shared/modal";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { createCharge, updateCharge } from "@/services/charges.service";
import { listFeeTypes } from "@/services/fee-types.service";
import { listMembers } from "@/services/members.service";
import type { MonthlyCharge } from "@/types/charge";
import { getApiErrorMessage } from "@/utils/api-error";
import { toDateInputValue } from "@/utils/charges";
import { centsToDollars, dollarsToCents } from "@/utils/currency";

const createSchema = z.object({
  member_id: z.number().int().positive("Member is required"),
  fee_type_id: z.number().int().positive("Fee type is required"),
  amount: z.string().min(1, "Amount is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});

const editSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  end_date: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type ChargeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge?: MonthlyCharge | null;
};

export function ChargeFormDialog({
  open,
  onOpenChange,
  charge,
}: ChargeFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(charge);

  const membersQuery = useQuery({
    queryKey: ["members", "options"],
    queryFn: () => listMembers({ page: 1, limit: 100 }),
    enabled: open && !isEdit,
  });

  const feeTypesQuery = useQuery({
    queryKey: ["fee-types", "options"],
    queryFn: () => listFeeTypes({ page: 1, limit: 100 }),
    enabled: open && !isEdit,
  });

  useQueryErrorToast(
    membersQuery.isError,
    membersQuery.error,
    "Unable to load members.",
  );
  useQueryErrorToast(
    feeTypesQuery.isError,
    feeTypesQuery.error,
    "Unable to load fee types.",
  );

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      member_id: 0,
      fee_type_id: 0,
      amount: "",
      start_date: "",
      end_date: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      amount: "",
      end_date: "",
    },
  });

  const memberId = useWatch({
    control: createForm.control,
    name: "member_id",
  });
  const feeTypeId = useWatch({
    control: createForm.control,
    name: "fee_type_id",
  });

  useEffect(() => {
    if (!open) return;
    if (charge) {
      editForm.reset({
        amount: centsToDollars(charge.amount_cents).toFixed(2),
        end_date: toDateInputValue(charge.end_date),
      });
    } else {
      createForm.reset({
        member_id: 0,
        fee_type_id: 0,
        amount: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [charge, open, createForm, editForm]);

  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) => {
      const amount_cents = dollarsToCents(values.amount);
      if (amount_cents <= 0) {
        throw new Error("Amount must be greater than zero");
      }
      return createCharge({
        member_id: values.member_id,
        fee_type_id: values.fee_type_id,
        amount_cents,
        start_date: values.start_date,
        end_date: values.end_date ? values.end_date : null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["charges"] });
      toast.success("Charge created");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create charge"));
    },
  });

  const editMutation = useMutation({
    mutationFn: (values: EditFormValues) => {
      if (!charge) throw new Error("Missing charge");
      const amount_cents = dollarsToCents(values.amount);
      if (amount_cents <= 0) {
        throw new Error("Amount must be greater than zero");
      }
      return updateCharge(charge.id, {
        amount_cents,
        end_date: values.end_date ? values.end_date : null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["charges"] });
      toast.success("Charge updated");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update charge"));
    },
  });

  const pending = createMutation.isPending || editMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg"
      title={isEdit ? "Edit Monthly Charge" : "Create Charge"}
      description={
        isEdit
          ? "Update the amount or end date for this recurring charge."
          : "Assign a recurring monthly fee to a member."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={isEdit ? "charge-edit-form" : "charge-create-form"}
            disabled={pending}
          >
            {pending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Charge"}
          </Button>
        </>
      }
    >
      {isEdit && charge ? (
        <form
          id="charge-edit-form"
          className="space-y-4"
          onSubmit={editForm.handleSubmit((values) =>
            editMutation.mutate(values),
          )}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Member</Label>
              <Input value={charge.member_name} disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label>Fee Type</Label>
              <Input value={charge.fee_type_name} disabled readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount (USD)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0.01"
              aria-invalid={Boolean(editForm.formState.errors.amount)}
              {...editForm.register("amount")}
            />
            {editForm.formState.errors.amount ? (
              <p className="text-destructive text-sm">
                {editForm.formState.errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-end-date">End Date</Label>
            <Input
              id="edit-end-date"
              type="date"
              {...editForm.register("end_date")}
            />
            <p className="text-muted-foreground text-xs">
              Leave empty for an ongoing charge.
            </p>
          </div>
        </form>
      ) : (
        <form
          id="charge-create-form"
          className="space-y-4"
          onSubmit={createForm.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
        >
          <div className="space-y-2">
            <Label>Member</Label>
            <Select
              value={memberId > 0 ? String(memberId) : undefined}
              onValueChange={(value) =>
                createForm.setValue("member_id", Number(value), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {(membersQuery.data?.data ?? []).map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {createForm.formState.errors.member_id ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.member_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Fee Type</Label>
            <Select
              value={feeTypeId > 0 ? String(feeTypeId) : undefined}
              onValueChange={(value) =>
                createForm.setValue("fee_type_id", Number(value), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                {(feeTypesQuery.data?.data ?? [])
                  .filter((feeType) => feeType.is_active)
                  .map((feeType) => (
                    <SelectItem key={feeType.id} value={String(feeType.id)}>
                      {feeType.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {createForm.formState.errors.fee_type_id ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.fee_type_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-amount">Amount (USD)</Label>
            <Input
              id="create-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="250.00"
              aria-invalid={Boolean(createForm.formState.errors.amount)}
              {...createForm.register("amount")}
            />
            {createForm.formState.errors.amount ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-start-date">Start Date</Label>
              <Input
                id="create-start-date"
                type="date"
                aria-invalid={Boolean(createForm.formState.errors.start_date)}
                {...createForm.register("start_date")}
              />
              {createForm.formState.errors.start_date ? (
                <p className="text-destructive text-sm">
                  {createForm.formState.errors.start_date.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-end-date">End Date</Label>
              <Input
                id="create-end-date"
                type="date"
                {...createForm.register("end_date")}
              />
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
