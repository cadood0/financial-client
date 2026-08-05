"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DateFormatter } from "@/components/shared/date-formatter";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { UserFormDialog } from "@/modules/users/user-form-dialog";
import { useAuth } from "@/providers/auth-provider";
import { deleteUser, listUsers } from "@/services/users.service";
import type { User } from "@/types/auth";
import { getApiErrorMessage } from "@/utils/api-error";

type UsersTableProps = {
  search: string;
  page: number;
  onPageChange: (page: number) => void;
};

export function UsersTable({ search, page, onPageChange }: UsersTableProps) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users", { search, page }],
    queryFn: () =>
      listUsers({
        page,
        limit: 10,
        search: search || undefined,
      }),
  });

  useQueryErrorToast(
    usersQuery.isError,
    usersQuery.error,
    "Unable to load users.",
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete user"));
    },
  });

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <>
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "created", header: "Created Date" },
          { key: "actions", header: "Actions", className: "w-16 text-right" },
        ]}
        data={users}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        errorMessage="Unable to load users."
        meta={meta}
        onPageChange={onPageChange}
        paginationLabel="users"
        emptyTitle="No users found"
        emptyDescription="Create a system user to grant portal access."
        emptyIcon={Users}
        getRowKey={(user) => user.id}
        renderRow={(user) => (
          <>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell className="font-mono text-sm">{user.email}</TableCell>
            <TableCell>
              <DateFormatter value={user.created_at} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="User actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(user)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={currentUser?.id === user.id}
                    onClick={() => setDeleting(user)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </>
        )}
      />

      <UserFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        user={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete user?"
        description={
          deleting?.id === currentUser?.id
            ? "You cannot delete your own account."
            : `This will remove ${deleting?.name ?? "this user"} from the system.`
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
      />
    </>
  );
}
