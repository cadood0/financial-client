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
import { listCities } from "@/services/cities.service";
import { createMember, updateMember } from "@/services/members.service";
import type { Member } from "@/types/member";
import { getApiErrorMessage } from "@/utils/api-error";

const memberSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(150),
  phone: z.string().min(7, "Phone must be at least 7 characters").max(20),
  city_id: z.number().int().positive("City is required"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

type MemberFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
};

export function MemberFormDialog({
  open,
  onOpenChange,
  member,
}: MemberFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(member);

  const citiesQuery = useQuery({
    queryKey: ["cities", "options"],
    queryFn: () => listCities({ page: 1, limit: 100 }),
    enabled: open,
  });

  useQueryErrorToast(
    citiesQuery.isError,
    citiesQuery.error,
    "Unable to load cities.",
  );

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      city_id: 0,
    },
  });

  const cityId = useWatch({ control: form.control, name: "city_id" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      member
        ? {
            full_name: member.full_name,
            phone: member.phone,
            city_id: member.city_id,
          }
        : {
            full_name: "",
            phone: "",
            city_id: 0,
          },
    );
  }, [member, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: MemberFormValues) => {
      if (member) {
        return updateMember(member.id, values);
      }
      return createMember(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success(isEdit ? "Member updated" : "Member created");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to save member"));
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Member" : "Add New Member"}
      description={
        isEdit
          ? "Update member profile details."
          : "Create a new organization member."
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
            form="member-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Member"}
          </Button>
        </>
      }
    >
      <form
        id="member-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="Erik Larsson"
            aria-invalid={Boolean(form.formState.errors.full_name)}
            {...form.register("full_name")}
          />
          {form.formState.errors.full_name ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.full_name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="+46 70 123 4567"
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone")}
          />
          {form.formState.errors.phone ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={cityId > 0 ? String(cityId) : undefined}
            onValueChange={(value) =>
              form.setValue("city_id", Number(value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-10 w-full" size="default">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {(citiesQuery.data?.data ?? []).map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.city_id ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.city_id.message}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
