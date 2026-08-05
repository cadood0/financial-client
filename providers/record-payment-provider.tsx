"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type RecordPaymentContextValue = {
  open: boolean;
  sessionKey: number;
  preselectedMemberId: number | null;
  openWizard: (memberId?: number) => void;
  closeWizard: () => void;
};

const RecordPaymentContext = createContext<RecordPaymentContextValue | null>(
  null,
);

export function RecordPaymentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [preselectedMemberId, setPreselectedMemberId] = useState<number | null>(
    null,
  );

  const openWizard = useCallback((memberId?: number) => {
    setPreselectedMemberId(memberId && memberId > 0 ? memberId : null);
    setSessionKey((key) => key + 1);
    setOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setOpen(false);
    setPreselectedMemberId(null);
  }, []);

  const value = useMemo(
    () => ({
      open,
      sessionKey,
      preselectedMemberId,
      openWizard,
      closeWizard,
    }),
    [open, sessionKey, preselectedMemberId, openWizard, closeWizard],
  );

  return (
    <RecordPaymentContext.Provider value={value}>
      {children}
    </RecordPaymentContext.Provider>
  );
}

export function useRecordPayment() {
  const context = useContext(RecordPaymentContext);
  if (!context) {
    throw new Error(
      "useRecordPayment must be used within RecordPaymentProvider",
    );
  }
  return context;
}
