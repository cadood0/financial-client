type AuthLayoutProps = {
  children: React.ReactNode;
  brandSlot?: React.ReactNode;
};

export function AuthLayout({ children, brandSlot }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="bg-primary text-primary-foreground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
        {brandSlot ?? (
          <div>
            <p className="text-xl font-semibold tracking-tight">FinAdmin</p>
            <p className="mt-6 max-w-md text-2xl leading-snug font-medium">
              The Financial Contribution Management System built for clarity and
              control.
            </p>
          </div>
        )}
      </aside>
      <div className="bg-background flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
