import { SiteHeader } from "@/components/site-header";
import { getAllModels, toSearchEntry } from "@/lib/models";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader models={getAllModels().map(toSearchEntry)} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
