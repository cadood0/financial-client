"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageReset } from "@/hooks/use-page-reset";
import { CitiesTable } from "@/modules/cities/cities-table";
import { CityFormDialog } from "@/modules/cities/city-form-dialog";

export function CitiesPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = usePageReset([debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cities Management"
        description="Manage global geographic entities and regional fee zones."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add City
          </Button>
        }
      />

      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search cities, regions, or codes..."
        className="max-w-md"
      />

      <CitiesTable
        search={debouncedSearch}
        page={page}
        onPageChange={setPage}
      />

      <CityFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
