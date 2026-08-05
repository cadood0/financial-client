"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePageReset } from "@/hooks/use-page-reset";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { MemberFormDialog } from "@/modules/members/member-form-dialog";
import { MembersTable } from "@/modules/members/members-table";
import { listCities } from "@/services/cities.service";

export function MembersPage() {
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = usePageReset([debouncedSearch, cityId]);

  const citiesQuery = useQuery({
    queryKey: ["cities", "options"],
    queryFn: () => listCities({ page: 1, limit: 100 }),
  });

  useQueryErrorToast(
    citiesQuery.isError,
    citiesQuery.error,
    "Unable to load cities.",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Members"
        description="Manage member profiles, payments, and residency status."
        actions={
          <>
            <Select
              value={cityId > 0 ? String(cityId) : "all"}
              onValueChange={(value) =>
                setCityId(!value || value === "all" ? 0 : Number(value))
              }
            >
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {(citiesQuery.data?.data ?? []).map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add New Member
            </Button>
          </>
        }
      />

      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search by name or phone..."
        className="max-w-md"
      />

      <MembersTable
        search={debouncedSearch}
        cityId={cityId}
        page={page}
        onPageChange={setPage}
      />

      <MemberFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
