"use client";

import { ReactNode } from "react";
import MissionNavbar from "@/components/missions/layout/MissionNavbar";

interface Props {
  children: ReactNode;
}

export default function MissionsSupportLayout({ children }: Props) {
  return (
    <>
      <MissionNavbar />
      <main className="min-w-0 px-0 pb-24 lg:pb-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </>
  );
}
