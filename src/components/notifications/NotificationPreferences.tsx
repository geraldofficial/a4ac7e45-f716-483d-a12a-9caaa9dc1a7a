import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotificationPreferences() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Notification Preferences
        </h2>
        <p className="text-gray-400">
          Notification system has been simplified.
        </p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Simplified Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-300">
            <p className="mb-3">
              The notification system has been simplified to focus only on admin
              messaging.
            </p>
            <p className="mb-3">
              Complex features like preferences, push notifications, quiet
              hours, and multiple notification types have been removed.
            </p>
            <p className="text-yellow-400">
              You will now only receive simple messages from administrators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
