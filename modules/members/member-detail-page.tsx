"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Pencil } from "lucide-react";
import { useState } from "react";

import { DateFormatter } from "@/components/shared/date-formatter";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/constants/routes";
import { useQueryErrorToast } from "@/hooks/use-query-error-toast";
import { MemberChargesTab } from "@/modules/members/member-charges-tab";
import { MemberFormDialog } from "@/modules/members/member-form-dialog";
import { MemberPaymentsTab } from "@/modules/members/member-payments-tab";
import { useRecordPayment } from "@/providers/record-payment-provider";
import { getMember } from "@/services/members.service";

export function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const memberId = Number(params.id);
  const [editOpen, setEditOpen] = useState(false);
  const { openWizard } = useRecordPayment();

  const memberQuery = useQuery({
    queryKey: ["members", memberId],
    queryFn: () => getMember(memberId),
    enabled: Number.isFinite(memberId) && memberId > 0,
  });

  useQueryErrorToast(
    memberQuery.isError,
    memberQuery.error,
    "Unable to load member.",
  );

  if (!Number.isFinite(memberId) || memberId <= 0) {
    return <p className="text-destructive text-sm">Invalid member id.</p>;
  }

  if (memberQuery.isLoading) {
    return <LoadingSkeleton rows={8} />;
  }

  if (memberQuery.isError || !memberQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-destructive text-sm">Member not found.</p>
        <Button type="button" variant="outline" onClick={() => router.push(routes.members)}>
          Back to members
        </Button>
      </div>
    );
  }

  const member = memberQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={routes.members}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          Members
        </Link>
        <PageHeader
          title={member.full_name}
          description={`${member.phone} · ${member.city_name}`}
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button
                type="button"
                onClick={() => openWizard(member.id)}
              >
                <CreditCard className="size-4" />
                Record Payment
              </Button>
            </>
          }
        />
        <p className="text-muted-foreground -mt-4 text-sm">
          Created <DateFormatter value={member.created_at} />
        </p>
      </div>

      <div className="bg-card rounded-xl border p-4 shadow-sm sm:p-5">
        <Tabs defaultValue="charges">
          <TabsList>
            <TabsTrigger value="charges">Charges</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="charges" className="pt-4">
            <MemberChargesTab memberId={member.id} />
          </TabsContent>
          <TabsContent value="payments" className="pt-4">
            <MemberPaymentsTab memberId={member.id} />
          </TabsContent>
        </Tabs>
      </div>

      <MemberFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={member}
      />
    </div>
  );
}
