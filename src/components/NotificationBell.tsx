import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  notificationPermission,
  requestNotificationPermission,
  type PermissionState,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

/** Requests OS notification permission on demand — never automatically. */
export function NotificationBell({ className }: { className?: string }) {
  const [state, setState] = useState<PermissionState>(notificationPermission);

  if (state === "unsupported") return null;

  const granted = state === "granted";

  async function enable() {
    if (granted) {
      toast("Уведомления уже включены");
      return;
    }
    const result = await requestNotificationPermission();
    setState(result);
    if (result === "granted") {
      toast.success("Уведомления включены", {
        description: "Будем напоминать о поливе и пересадке.",
      });
    } else if (result === "denied") {
      toast("Уведомления заблокированы", {
        description: "Разрешите их в настройках браузера.",
      });
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        granted ? "Уведомления включены" : "Включить уведомления об уходе"
      }
      onClick={enable}
      className={cn(granted && "text-primary", className)}
    >
      {granted ? (
        <BellRing className="size-5" />
      ) : (
        <Bell className="size-5" />
      )}
    </Button>
  );
}
