"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Info, BellOff, Bell } from "lucide-react"
import { useNotifications } from "@/lib/context/NotificationContext"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/lib/types"

interface NotificationPanelProps {
  notifications?: Notification[];
}

export default function NotificationPanel({ notifications: propsNotifications }: NotificationPanelProps) {
  const { notifications: contextNotifications } = useNotifications()
  
  // Use props notifications if provided, otherwise use context notifications
  const notifications = propsNotifications || contextNotifications || []

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
    <div className="flex flex-col h-full">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-gray-500 h-[300px]">
          <BellOff className="h-12 w-12 mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет уведомлений</h3>
          <p className="text-sm text-center">Здесь будут отображаться уведомления о действиях в системе</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">
              {notifications.length} {notifications.length === 1 ? 'уведомление' : 'уведомлений'}
            </span>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500">
              Очистить все
            </Button>
          </div>
          <ScrollArea className="flex-1 h-[400px]">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50"
                >
                  <div className="shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}

