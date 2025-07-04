"use client";
import React, { createContext, useMemo } from "react";
import { useParams } from "next/navigation";

export const MandalSlugContext = createContext<string | undefined>(undefined);

export default function MandalSlugProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = useMemo(
    () =>
      typeof params.slug === "string"
        ? params.slug
        : Array.isArray(params.slug)
        ? params.slug[0]
        : undefined,
    [params.slug],
  );
  return (
    <MandalSlugContext.Provider value={slug}>
      {children}
    </MandalSlugContext.Provider>
  );
}
