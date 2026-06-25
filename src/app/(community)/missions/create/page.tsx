"use client";

import { useRouter } from "next/navigation";
import CreateMissionModal from "@/components/missions/Form/CreateMissionModal";

export default function CreateMissionPage() {
  const router = useRouter();

  return (
    <CreateMissionModal onClose={() => router.push("/missions")} />
  );
}
