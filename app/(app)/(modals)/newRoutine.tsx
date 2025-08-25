import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function NewRoutine() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified routine editing route
    router.replace("/editRoutine/new");
  }, [router]);

  return null; // This component doesn't render anything
}
