import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import type { Notification } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface NotificationPanelProps {
  notifications: Notification[]
}

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  const getIcon = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Нет уведомлений</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground"
            >
              <div className="mt-0.5">{getIcon(notification.type)}</div>
              <div className="space-y-1">
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{formatDate(notification.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
}

