"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageReset } from "@/hooks/use-page-reset";
import { FeeTypeFormDialog } from "@/modules/fee-types/fee-type-form-dialog";
import { FeeTypesTable } from "@/modules/fee-types/fee-types-table";

export function FeeTypesPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = usePageReset([debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Types Management"
        description="Streamline your financial organization by creating standardized fee categories for members and recurring charges."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Fee Type
          </Button>
        }
      />

      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search fee types..."
        className="max-w-md"
      />

      <FeeTypesTable
        search={debouncedSearch}
        page={page}
        onPageChange={setPage}
      />

      <FeeTypeFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
