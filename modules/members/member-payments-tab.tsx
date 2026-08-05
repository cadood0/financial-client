"use client";

import { PaymentHistory } from "@/modules/payments/payment-history";

export function MemberPaymentsTab({ memberId }: { memberId: number }) {
  return (
    <PaymentHistory
      lockedMemberId={memberId}
      showHeader={false}
      title="Payment History"
    />
  );
}
