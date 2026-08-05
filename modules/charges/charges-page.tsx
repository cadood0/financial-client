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
import { ChargeFormDialog } from "@/modules/charges/charge-form-dialog";
import { ChargesTable } from "@/modules/charges/charges-table";
import { listFeeTypes } from "@/services/fee-types.service";
import { listMembers } from "@/services/members.service";

export function ChargesPage() {
  const [search, setSearch] = useState("");
  const [memberId, setMemberId] = useState(0);
  const [feeTypeId, setFeeTypeId] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = usePageReset([memberId, feeTypeId]);

  const membersQuery = useQuery({
    queryKey: ["members", "options"],
    queryFn: () => listMembers({ page: 1, limit: 100 }),
  });

  const feeTypesQuery = useQuery({
    queryKey: ["fee-types", "options"],
    queryFn: () => listFeeTypes({ page: 1, limit: 100 }),
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

  const members = (membersQuery.data?.data ?? []).filter((member) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      member.full_name.toLowerCase().includes(q) ||
      member.phone.toLowerCase().includes(q)
    );
  });

  const feeTypes = feeTypesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Charges"
        description="Manage recurring monthly fees, membership dues, and automated service charges for all active organization members."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Charge
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Filter members in the member dropdown..."
          className="max-w-md"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Select
            value={memberId > 0 ? String(memberId) : "all"}
            onValueChange={(value) =>
              setMemberId(!value || value === "all" ? 0 : Number(value))
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={feeTypeId > 0 ? String(feeTypeId) : "all"}
            onValueChange={(value) =>
              setFeeTypeId(!value || value === "all" ? 0 : Number(value))
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <SelectValue placeholder="All Fee Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fee Types</SelectItem>
              {feeTypes.map((feeType) => (
                <SelectItem key={feeType.id} value={String(feeType.id)}>
                  {feeType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ChargesTable
        memberId={memberId}
        feeTypeId={feeTypeId}
        page={page}
        onPageChange={setPage}
      />

      <ChargeFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
