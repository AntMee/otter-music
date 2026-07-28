import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NETEASE_CATS } from "@/lib/netease/netease-cats";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

interface PlaylistCategorySelectorProps {
  activeCategory: string;
  onSelect: (id: string) => void;
  trigger?: React.ReactNode;
}

export function PlaylistCategorySelector({
  activeCategory,
  onSelect,
  trigger,
}: PlaylistCategorySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary"
          >
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(calc(100vw-2rem),720px)] overflow-hidden rounded-2xl border-border/70 p-0 shadow-xl"
      >
        <div className="border-b px-5 py-4">
          <h3 className="text-base font-semibold tracking-tight">歌单分类</h3>
        </div>

        <ScrollArea className="max-h-[min(62vh,560px)] px-5 py-4">
          <div className="space-y-5">
            {NETEASE_CATS.map((group) => (
              <section key={group.category} className="space-y-3">
                <h4 className="sticky top-0 z-10 bg-popover/95 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 backdrop-blur-sm">
                  {group.category}
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {group.filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleSelect(filter.id)}
                      className={cn(
                        "flex h-10 min-w-0 items-center justify-center rounded-lg border px-3 text-[13px] transition-all duration-200",
                        activeCategory === filter.id
                          ? "scale-[1.02] border-primary bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20"
                          : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
                      )}
                    >
                      <span className="truncate">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
