"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Receipt,
  SearchIcon,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { z } from "zod";

import { CurrencyFormatter } from "@/components/shared/currency-formatter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PaymentSummary } from "@/components/shared/payment-summary";
import { toast } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { cn } from "@/lib/utils";
import { PaymentReceipt } from "@/modules/payments/payment-receipt";
import { useRecordPayment } from "@/providers/record-payment-provider";
import { listCharges } from "@/services/charges.service";
import { getMember, listMembers } from "@/services/members.service";
import {
  getPaymentSummary,
  recordPayment,
} from "@/services/payments.service";
import type { MonthlyCharge } from "@/types/charge";
import type { Member } from "@/types/member";
import type { Payment } from "@/types/payment";
import { getApiErrorMessage } from "@/utils/api-error";
import { isActiveCharge, toMonthInputValue } from "@/utils/charges";
import { centsToDollars, dollarsToCents } from "@/utils/currency";

const paymentDetailsSchema = z.object({
  period: z.string().min(1, "Period is required"),
  amount: z.string().min(1, "Amount is required"),
  note: z.string().max(250, "Note must be at most 250 characters").optional(),
});

type PaymentDetailsValues = z.infer<typeof paymentDetailsSchema>;

export function RecordPaymentWizard() {
  const { open, closeWizard, sessionKey } = useRecordPayment();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeWizard();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-4xl"
      >
        {open ? <WizardSession key={sessionKey} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function WizardSession() {
  const queryClient = useQueryClient();
  const { closeWizard, preselectedMemberId } = useRecordPayment();

  const [step, setStep] = useState<1 | 2>(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberCleared, setMemberCleared] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<MonthlyCharge | null>(
    null,
  );
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const detailsForm = useForm<PaymentDetailsValues>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      period: toMonthInputValue(),
      amount: "",
      note: "",
    },
  });

  const period = useWatch({ control: detailsForm.control, name: "period" });
  const amount = useWatch({ control: detailsForm.control, name: "amount" });

  const debouncedMemberSearch = useDebouncedValue(memberSearch, 300);

  const membersQuery = useQuery({
    queryKey: ["members", "payment-wizard", debouncedMemberSearch],
    queryFn: () =>
      listMembers({
        page: 1,
        limit: 8,
        search: debouncedMemberSearch || undefined,
      }),
    enabled: step === 1,
  });

  const preselectedMemberQuery = useQuery({
    queryKey: ["members", preselectedMemberId],
    queryFn: () => getMember(preselectedMemberId!),
    enabled: Boolean(preselectedMemberId) && !memberCleared,
  });

  const activeMember =
    selectedMember ??
    (!memberCleared ? (preselectedMemberQuery.data ?? null) : null);

  const chargesQuery = useQuery({
    queryKey: ["charges", "payment-wizard", activeMember?.id],
    queryFn: () =>
      listCharges({
        page: 1,
        limit: 100,
        member_id: activeMember?.id,
      }),
    enabled: Boolean(activeMember?.id),
  });

  const activeCharges = useMemo(
    () =>
      (chargesQuery.data?.data ?? []).filter((charge) => isActiveCharge(charge)),
    [chargesQuery.data],
  );

  const summaryQuery = useQuery({
    queryKey: ["payments", "summary", selectedCharge?.id, period],
    queryFn: () =>
      getPaymentSummary({
        charge_id: selectedCharge!.id,
        period,
      }),
    enabled: step === 2 && Boolean(selectedCharge?.id) && Boolean(period),
  });

  useQueryErrorToast(
    membersQuery.isError,
    membersQuery.error,
    "Unable to load members.",
  );
  useQueryErrorToast(
    preselectedMemberQuery.isError,
    preselectedMemberQuery.error,
    "Unable to load member.",
  );
  useQueryErrorToast(
    chargesQuery.isError,
    chargesQuery.error,
    "Unable to load charges.",
  );
  useQueryErrorToast(
    summaryQuery.isError,
    summaryQuery.error,
    "Unable to load payment summary.",
  );

  const recordMutation = useMutation({
    mutationFn: async (values: PaymentDetailsValues) => {
      if (!selectedCharge) throw new Error("Select a charge");
      const amount_cents = dollarsToCents(values.amount);
      if (amount_cents <= 0) throw new Error("Amount must be greater than zero");
      return recordPayment({
        charge_id: selectedCharge.id,
        period: values.period,
        amount_cents,
        note: values.note?.trim() || undefined,
      });
    },
    onSuccess: async (payment) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      setReceipt(payment);
      toast.success("Payment recorded");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to record payment"));
    },
  });

  const canContinue = Boolean(activeMember && selectedCharge);

  function selectCharge(charge: MonthlyCharge) {
    setSelectedCharge(charge);
    detailsForm.setValue(
      "amount",
      centsToDollars(charge.amount_cents).toFixed(2),
      { shouldValidate: true },
    );
  }

  if (receipt) {
    return <PaymentReceipt payment={receipt} onClose={closeWizard} />;
  }

  return (
    <div className="grid min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden flex-col justify-between bg-slate-800 p-6 text-white lg:flex">
        <div>
          <DialogTitle className="text-xl font-semibold text-white">
            Record Payment
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-white/70">
            Enter the member&apos;s payment details to update their balance in
            real-time.
          </DialogDescription>

          <div className="mt-8 space-y-3">
            <div
              className={cn(
                "rounded-xl border p-3",
                step === 1
                  ? "border-sky-300/40 bg-white/10"
                  : "border-white/10 bg-white/5 opacity-70",
              )}
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
                Select Member
              </p>
              <p className="mt-1 text-sm">
                {activeMember?.full_name ?? "Choose a member and charge"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-3",
                step === 2
                  ? "border-sky-300/40 bg-white/10"
                  : "border-white/10 bg-white/5 opacity-70",
              )}
            >
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
                Configure Amount
              </p>
              <p className="mt-1 text-sm">Period, amount, and live summary</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="size-4" />
          Secure Transaction Entry
        </div>
      </aside>

      <div className="flex min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  step >= 1 ? "bg-primary" : "bg-muted",
                )}
              />
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  step >= 2 ? "bg-primary" : "bg-muted",
                )}
              />
            </div>
            <h3 className="text-lg font-semibold">
              {step === 1 ? "Select Member" : "Configure Amount"}
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={closeWizard}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 1 ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Search Member
                </Label>
                <div className="relative">
                  <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Start typing name or ID..."
                    className="h-10 pl-9"
                  />
                </div>
                {!activeMember ? (
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1">
                    {membersQuery.isLoading ||
                    (preselectedMemberId &&
                      !memberCleared &&
                      preselectedMemberQuery.isLoading) ? (
                      <LoadingSkeleton rows={3} />
                    ) : null}
                    {(membersQuery.data?.data ?? []).map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className="hover:bg-muted flex w-full flex-col rounded-md px-3 py-2 text-left"
                        onClick={() => {
                          setSelectedMember(member);
                          setMemberCleared(false);
                          setSelectedCharge(null);
                        }}
                      >
                        <span className="text-sm font-medium">
                          {member.full_name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {member.phone} · {member.city_name}
                        </span>
                      </button>
                    ))}
                    {!membersQuery.isLoading &&
                    (membersQuery.data?.data.length ?? 0) === 0 ? (
                      <EmptyState
                        title="No members found"
                        description="Try a different search term."
                        icon={Users}
                        className="border-0 py-6"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-muted/40 flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">
                        {activeMember.full_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {activeMember.phone}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberCleared(true);
                        setSelectedCharge(null);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Active Charges
                </Label>
                {!activeMember ? (
                  <p className="text-muted-foreground text-sm">
                    Select a member to load active charges.
                  </p>
                ) : chargesQuery.isLoading ? (
                  <LoadingSkeleton rows={3} />
                ) : activeCharges.length === 0 ? (
                  <EmptyState
                    title="No active charges"
                    description="This member has no active charges to pay against."
                    icon={Receipt}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {activeCharges.map((charge) => {
                      const selected = selectedCharge?.id === charge.id;
                      return (
                        <button
                          key={charge.id}
                          type="button"
                          onClick={() => selectCharge(charge)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40",
                            )}
                          >
                            {selected ? <Check className="size-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">
                              {charge.fee_type_name}
                            </span>
                            <span className="text-muted-foreground block text-xs">
                              Started{" "}
                              {new Date(charge.start_date).toLocaleDateString()}
                              {charge.end_date
                                ? ` · Ends ${new Date(charge.end_date).toLocaleDateString()}`
                                : " · Ongoing"}
                            </span>
                          </span>
                          <CurrencyFormatter
                            cents={charge.amount_cents}
                            className="text-sm font-semibold tabular-nums"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form
              id="payment-details-form"
              className="space-y-5"
              onSubmit={detailsForm.handleSubmit((values) =>
                recordMutation.mutate(values),
              )}
            >
              <div className="bg-muted/30 rounded-xl border px-4 py-3 text-sm">
                <p className="font-medium">
                  {activeMember?.full_name} · {selectedCharge?.fee_type_name}
                </p>
                <p className="text-muted-foreground mt-1">
                  Charge amount{" "}
                  <CurrencyFormatter
                    cents={selectedCharge?.amount_cents ?? 0}
                  />
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-period">Period</Label>
                  <Input
                    id="payment-period"
                    type="month"
                    aria-invalid={Boolean(detailsForm.formState.errors.period)}
                    {...detailsForm.register("period")}
                  />
                  {detailsForm.formState.errors.period ? (
                    <p className="text-destructive text-sm">
                      {detailsForm.formState.errors.period.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">Amount (USD)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    aria-invalid={Boolean(detailsForm.formState.errors.amount)}
                    {...detailsForm.register("amount")}
                  />
                  {detailsForm.formState.errors.amount ? (
                    <p className="text-destructive text-sm">
                      {detailsForm.formState.errors.amount.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-note">Note (optional)</Label>
                <Textarea
                  id="payment-note"
                  rows={3}
                  maxLength={250}
                  placeholder="Add a short ledger note..."
                  {...detailsForm.register("note")}
                />
                {detailsForm.formState.errors.note ? (
                  <p className="text-destructive text-sm">
                    {detailsForm.formState.errors.note.message}
                  </p>
                ) : null}
              </div>

              <PaymentSummary
                summary={summaryQuery.data}
                isLoading={summaryQuery.isLoading}
                error={
                  summaryQuery.isError
                    ? getApiErrorMessage(
                        summaryQuery.error,
                        "Unable to load payment summary",
                      )
                    : null
                }
              />
            </form>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          {step === 1 ? (
            <Button type="button" variant="outline" onClick={closeWizard}>
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={recordMutation.isPending}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep(2)}
            >
              Next Step
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="payment-details-form"
              disabled={recordMutation.isPending || !period || !amount}
            >
              {recordMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
