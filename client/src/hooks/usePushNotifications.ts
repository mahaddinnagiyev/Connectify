import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotifications = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          Notification.requestPermission().then((permission) => {
            if (permission !== "granted") {
              return;
            }

            registration.pushManager.getSubscription().then((subscription) => {
              if (!subscription) {
                const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
                const convertedKey = urlBase64ToUint8Array(vapidPublicKey!);
                registration.pushManager
                  .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedKey,
                  })
                  .then((newSubscription) => {
                    fetch("/api/webpush/subscribe", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(newSubscription),
                    })
                      .then((res) => res.json())
                      .catch((error) =>
                        console.error("Send subscription error:", error)
                      );
                  });
              } else {
                return;
              }
            });
          });
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    }
  }, []);
};

export default usePushNotifications;
