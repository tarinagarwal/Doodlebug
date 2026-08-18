"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./doodles";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-ghost btn-sm"
      aria-label="Log out"
      title="Log out"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <Icon name="logout" size={18} />
    </button>
  );
}
