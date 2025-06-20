// Service Worker for Push Notifications
const CACHE_NAME = "flickpick-notifications-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event received");

  let notificationData = {
    title: "FlickPick Notification",
    body: "You have a new notification",
    icon: "/logo.svg",
    badge: "/logo.svg",
    tag: "flickpick-notification",
    data: {
      url: "/",
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          url: pushData.action_url || "/",
          notificationId: pushData.id,
          ...pushData.data,
        },
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.priority === "urgent",
      actions: notificationData.actions || [],
      image: notificationData.image_url,
      timestamp: Date.now(),
      renotify: true,
    }),
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");

  event.notification.close();

  // Handle action clicks
  if (event.action) {
    console.log("Service Worker: Action clicked:", event.action);

    switch (event.action) {
      case "dismiss":
        return; // Just close the notification
      case "mark-read":
        // Could send a message to mark as read
        break;
      default:
        break;
    }
  }

  // Navigate to the notification URL
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Background sync for offline notification actions
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync triggered");

  if (event.tag === "notification-actions") {
    event.waitUntil(handleOfflineNotificationActions());
  }
});

async function handleOfflineNotificationActions() {
  // Handle any queued notification actions when back online
  // This would integrate with IndexedDB or similar for offline storage
  console.log("Service Worker: Handling offline notification actions");
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received:", event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        self.skipWaiting();
        break;
      case "CLAIM_CLIENTS":
        self.clients.claim();
        break;
      case "UPDATE_BADGE":
        // Could update app badge here
        break;
    }
  }
});
