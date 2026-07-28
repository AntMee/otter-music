import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MusicLayoutProps {
  children: ReactNode;
  player: ReactNode;
  tabBar: ReactNode;
  header?: ReactNode;
  hidePlayer?: boolean;
  className?: string;
  isTab?: boolean;
}

export function MusicLayout({
  children,
  player,
  tabBar,
  header,
  hidePlayer,
  className,
  isTab = true,
}: MusicLayoutProps) {
  return (
    <div
      className={cn(
        "relative flex h-dvh overflow-hidden bg-background pt-safe",
        className
      )}
    >
      {/* Desktop Navigation */}
      {isTab && (
        <div className="hidden w-[88px] shrink-0 border-r border-border/60 bg-card/70 px-3 py-5 backdrop-blur-xl md:block">
          {tabBar}
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Header */}
        {header && <div className="shrink-0 px-5 pb-3">{header}</div>}

        {/* Main Content */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-auto scrollbar-hide">{children}</div>
        </div>

        {/* Now Playing Bar (Floating Island) */}
        {!hidePlayer && (
          <div
            className={cn(
              "flex-none z-50 absolute left-0 right-0 transition-all duration-300",
              isTab
                ? "bottom-(--now-playing-safe-height) md:bottom-4"
                : "bottom-0 md:bottom-4"
            )}
          >
            {player}
          </div>
        )}

        {/* Mobile Tab Bar */}
        {isTab && <div className="z-40 flex-none md:hidden">{tabBar}</div>}
      </div>
    </div>
  );
}
