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
import { registerUser, updateUser } from "@/services/users.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/api-error";

const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(user);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      editForm.reset({ name: user.name, email: user.email });
    } else {
      createForm.reset({ name: "", email: "", password: "" });
    }
  }, [user, open, createForm, editForm]);

  const createMutation = useMutation({
    mutationFn: (values: CreateFormValues) => registerUser(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create user"));
    },
  });

  const editMutation = useMutation({
    mutationFn: (values: EditFormValues) => {
      if (!user) throw new Error("Missing user");
      return updateUser(user.id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update user"));
    },
  });

  const pending = createMutation.isPending || editMutation.isPending;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit User" : "Create User"}
      description={
        isEdit
          ? "Update the operator name and email address."
          : "Register a new system user with POST /auth/register."
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
            form={isEdit ? "edit-user-form" : "create-user-form"}
            disabled={pending}
          >
            {pending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create User"}
          </Button>
        </>
      }
    >
      {isEdit ? (
        <form
          id="edit-user-form"
          className="space-y-4"
          onSubmit={editForm.handleSubmit((values) => editMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-user-name">Name</Label>
            <Input
              id="edit-user-name"
              aria-invalid={Boolean(editForm.formState.errors.name)}
              {...editForm.register("name")}
            />
            {editForm.formState.errors.name ? (
              <p className="text-destructive text-sm">
                {editForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-user-email">Email</Label>
            <Input
              id="edit-user-email"
              type="email"
              aria-invalid={Boolean(editForm.formState.errors.email)}
              {...editForm.register("email")}
            />
            {editForm.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {editForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
        </form>
      ) : (
        <form
          id="create-user-form"
          className="space-y-4"
          onSubmit={createForm.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="create-user-name">Name</Label>
            <Input
              id="create-user-name"
              aria-invalid={Boolean(createForm.formState.errors.name)}
              {...createForm.register("name")}
            />
            {createForm.formState.errors.name ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input
              id="create-user-email"
              type="email"
              aria-invalid={Boolean(createForm.formState.errors.email)}
              {...createForm.register("email")}
            />
            {createForm.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-user-password">Password</Label>
            <Input
              id="create-user-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(createForm.formState.errors.password)}
              {...createForm.register("password")}
            />
            {createForm.formState.errors.password ? (
              <p className="text-destructive text-sm">
                {createForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>
        </form>
      )}
    </Modal>
  );
}
