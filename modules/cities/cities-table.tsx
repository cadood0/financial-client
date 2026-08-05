"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/components/shared/toast";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { CityFormDialog } from "@/modules/cities/city-form-dialog";
import { deleteCity, listCities } from "@/services/cities.service";
import type { City } from "@/types/city";
import { getApiErrorMessage } from "@/utils/api-error";

type CitiesTableProps = {
  search: string;
  page: number;
  onPageChange: (page: number) => void;
};

export function CitiesTable({ search, page, onPageChange }: CitiesTableProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<City | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const citiesQuery = useQuery({
    queryKey: ["cities", { search, page }],
    queryFn: () =>
      listCities({
        page,
        limit: 10,
        search: search || undefined,
      }),
  });

  useQueryErrorToast(
    citiesQuery.isError,
    citiesQuery.error,
    "Unable to load cities.",
  );

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCity(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City deleted");
      setDeleting(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete city"));
    },
  });

  const cities = citiesQuery.data?.data ?? [];
  const meta = citiesQuery.data?.meta;

  return (
    <>
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "region", header: "Region" },
          { key: "actions", header: "Actions", className: "w-16 text-right" },
        ]}
        data={cities}
        isLoading={citiesQuery.isLoading}
        isError={citiesQuery.isError}
        errorMessage="Unable to load cities."
        meta={meta}
        onPageChange={onPageChange}
        paginationLabel="cities"
        emptyTitle="No cities found"
        emptyDescription="Try adjusting your search, or add a new city."
        emptyIcon={Building2}
        getRowKey={(city) => city.id}
        renderRow={(city) => (
          <>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-3.5" />
                </span>
                <span className="font-medium">{city.name}</span>
              </div>
            </TableCell>
            <TableCell>{city.region}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="City actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(city)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(city)}
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

      <CityFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        city={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete city?"
        description={`This will soft-delete ${deleting?.name ?? "this city"}. Cities with active members cannot be deleted.`}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
      />
    </>
  );
}
