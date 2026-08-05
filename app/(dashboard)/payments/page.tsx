import { Suspense } from "react";

import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PaymentsPage } from "@/modules/payments/payments-page";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={8} />}>
      <PaymentsPage />
    </Suspense>
  );
}
