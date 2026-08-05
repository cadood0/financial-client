"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageReset } from "@/hooks/use-page-reset";
import { UserFormDialog } from "@/modules/users/user-form-dialog";
import { UsersTable } from "@/modules/users/users-table";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = usePageReset([debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users Management"
        description="Control system access, manage permissions, and audit user creation dates for all administrative personnel."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add User
          </Button>
        }
      />

      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search system users..."
        className="max-w-md"
      />

      <UsersTable
        search={debouncedSearch}
        page={page}
        onPageChange={setPage}
      />

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
