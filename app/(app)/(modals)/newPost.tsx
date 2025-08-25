import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function NewPost() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified editPost modal for new posts
    router.replace('/editPost/new');
  }, [router]);

  return null;
}