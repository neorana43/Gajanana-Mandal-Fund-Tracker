import MandalSlugProvider from "./MandalSlugProvider";

export default function MandalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MandalSlugProvider>{children}</MandalSlugProvider>;
}
