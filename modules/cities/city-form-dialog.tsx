"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Modal } from "@/components/shared/modal";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCity, updateCity } from "@/services/cities.service";
import type { City } from "@/types/city";
import { getApiErrorMessage } from "@/utils/api-error";

const citySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  region: z.string().min(2, "Region must be at least 2 characters").max(100),
});

type CityFormValues = z.infer<typeof citySchema>;

type CityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City | null;
};

export function CityFormDialog({
  open,
  onOpenChange,
  city,
}: CityFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(city);

  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
      region: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      city
        ? { name: city.name, region: city.region }
        : { name: "", region: "" },
    );
  }, [city, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CityFormValues) => {
      if (city) return updateCity(city.id, values);
      return createCity(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success(isEdit ? "City updated" : "City created");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to save city"));
    },
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit City" : "Add City"}
      description={
        isEdit
          ? "Update geographic entity details."
          : "Create a new city for member residency and fee zones."
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
            form="city-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create City"}
          </Button>
        </>
      }
    >
      <form
        id="city-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <Label htmlFor="city-name">Name</Label>
          <Input
            id="city-name"
            placeholder="Copenhagen"
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
          <Label htmlFor="city-region">Region</Label>
          <Input
            id="city-region"
            placeholder="Hovedstaden"
            aria-invalid={Boolean(form.formState.errors.region)}
            {...form.register("region")}
          />
          {form.formState.errors.region ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.region.message}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
