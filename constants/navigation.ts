import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Scale,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/constants/routes";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard },
  { label: "Members", href: routes.members, icon: UsersRound },
  { label: "Payments", href: routes.payments, icon: CreditCard },
  { label: "Monthly Charges", href: routes.monthlyCharges, icon: Receipt },
  { label: "Cities", href: routes.cities, icon: Building2 },
  { label: "Fee Types", href: routes.feeTypes, icon: Scale },
  { label: "Users", href: routes.users, icon: Users },
];
