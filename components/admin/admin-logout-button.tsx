"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Se deconnecter
    </Button>
  );
}
