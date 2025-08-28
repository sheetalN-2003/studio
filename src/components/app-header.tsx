import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
       <SidebarTrigger className="md:hidden" />
      <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
    </header>
  );
}
