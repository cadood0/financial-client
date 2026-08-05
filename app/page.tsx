import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "FinAdmin",
};

export default function HomePage() {
  redirect(routes.login);
}
