import { notFound } from "next/navigation";
import { ShowcaseNav } from "./_components/showcase-nav";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <ShowcaseNav />
      <main className="container mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
