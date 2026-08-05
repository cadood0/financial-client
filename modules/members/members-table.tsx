"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";

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
import { routes } from "@/constants/routes";
import { MemberFormDialog } from "@/modules/members/member-form-dialog";
import { deleteMember, listMembers } from "@/services/members.service";
import type { Member } from "@/types/member";
import { getApiErrorMessage } from "@/utils/api-error";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const avatarTones = [
  "bg-sky-100 text-sky-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

type MembersTableProps = {
  search: string;
  cityId: number;
  page: number;
  onPageChange: (page: number) => void;
};

export function MembersTable({
  search,
  cityId,
  page,
  onPageChange,
}: MembersTableProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  const membersQuery = useQuery({
    queryKey: ["members", { search, cityId, page }],
    queryFn: () =>
      listMembers({
        page,
        limit: 10,
        search: search || undefined,
        city_id: cityId || undefined,
      }),
  });

  useQueryErrorToast(
    membersQuery.isError,
    membersQuery.error,
    "Unable to load members.",
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted");
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete member"));
    },
  });

  const members = membersQuery.data?.data ?? [];

  return (
    <>
      <DataTable
        columns={[
          { key: "name", header: "Full Name" },
          { key: "phone", header: "Phone" },
          { key: "city", header: "City" },
          { key: "created", header: "Created Date" },
          { key: "actions", header: "Actions", className: "w-16 text-right" },
        ]}
        data={members}
        isLoading={membersQuery.isLoading}
        isError={membersQuery.isError}
        errorMessage="Unable to load members."
        meta={membersQuery.data?.meta}
        onPageChange={onPageChange}
        paginationLabel="members"
        emptyTitle="No members found"
        emptyDescription="Try adjusting your search or city filter."
        emptyIcon={UserRound}
        getRowKey={(member) => member.id}
        renderRow={(member, index) => (
          <>
            <TableCell>
              <Link
                href={`${routes.members}/${member.id}`}
                className="flex items-center gap-3 hover:opacity-90"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTones[index % avatarTones.length]}`}
                >
                  {initials(member.full_name)}
                </span>
                <span className="font-medium">{member.full_name}</span>
              </Link>
            </TableCell>
            <TableCell className="tabular-nums">{member.phone}</TableCell>
            <TableCell>{member.city_name}</TableCell>
            <TableCell>
              <DateFormatter value={member.created_at} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Member actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(member)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(member)}
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

      <MemberFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        member={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete member?"
        description={`This will soft-delete ${deleting?.full_name ?? "this member"}. You can confirm to continue.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
      />
    </>
  );
}
