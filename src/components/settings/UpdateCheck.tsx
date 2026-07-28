import { useState } from "react";
import { format } from "date-fns";
import { Milestone, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAppStore } from "@/store/app-store";
import { SettingItem } from "./SettingItem";

interface UpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateDialog({ open, onOpenChange }: UpdateDialogProps) {
  const {
    currentVersion,
    latestVersionInfo,
    isChecking,
    checkUpdate,
    lastCheckTime,
  } = useAppStore();

  const neverChecked = lastCheckTime === 0;
  const hasUpdate = Boolean(latestVersionInfo);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="items-center pt-4">
          <DrawerTitle className="text-xl font-bold mt-2">版本更新</DrawerTitle>
          <div className="text-xs font-mono text-muted-foreground">
            {currentVersion}
          </div>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-5">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">版本更新</span>
              <Badge
                variant={hasUpdate ? "default" : "secondary"}
                className={`gap-1 cursor-pointer select-none ${
                  isChecking ? "opacity-70" : ""
                }`}
                onClick={() => !isChecking && checkUpdate(false)}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`}
                />
                {isChecking
                  ? "检查中..."
                  : neverChecked
                    ? "检查更新"
                    : hasUpdate
                      ? `新版本 ${latestVersionInfo?.latestVersion}`
                      : "已是最新版本"}
              </Badge>
            </div>

            {latestVersionInfo && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>
                    {format(
                      new Date(latestVersionInfo.publishDate),
                      "yyyy-MM-dd HH:mm"
                    )}
                  </span>
                  <span>
                    {(latestVersionInfo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="max-h-32 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed bg-muted/40 p-2 rounded">
                  {latestVersionInfo.changelog}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function UpdateCheck() {
  const [showDialog, setShowDialog] = useState(false);
  const { currentVersion, latestVersionInfo } = useAppStore();
  const hasUpdate = Boolean(latestVersionInfo);

  return (
    <>
      <SettingItem
        icon={Milestone}
        title="版本更新"
        onClick={() => setShowDialog(true)}
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {currentVersion}
            </span>

            {hasUpdate && (
              <Badge variant="destructive" className="gap-1 animate-bounce">
                新版本
              </Badge>
            )}
          </div>
        }
        showChevron
      />

      <UpdateDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
