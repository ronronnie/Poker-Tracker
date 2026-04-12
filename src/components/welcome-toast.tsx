"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export function WelcomeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      // Fire the toast
      toast({
        title: "Welcome to Outs! 🃏",
        description: "Your account is set up. Let's start tracking.",
        variant: "success",
      });
      // Clean the URL — replace without the query param
      router.replace(pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
