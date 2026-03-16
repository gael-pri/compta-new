import webPush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

// Configuration des clés VAPID
webPush.setVapidDetails(
  'mailto:contact@exemple.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type NotificationWithPayload = {
  subscription: webPush.PushSubscription;
  message: {
    title: string;
    body: string;
  };
};

const getSubscriptions = async (): Promise<NotificationWithPayload[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_URL}/api/supabase/get-notifications`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error('❌ Erreur HTTP en appelant l’API :', res.status);
    return [];
  }

  const json = await res.json();

  if (!Array.isArray(json.notifications)) {
    console.error('❌ Réponse inattendue de l’API :', json);
    return [];
  }

  return json.notifications;
};

const sendPushNotifications = async () => {
  const notifications = await getSubscriptions();

  for (const { subscription, message } of notifications) {
    try {
      await webPush.sendNotification(subscription, JSON.stringify(message));
      console.log('✅ Notification envoyée à', subscription.endpoint);
    } catch (err) {
      console.error('❌ Erreur en envoyant à', subscription.endpoint, err);
    }
  }
};

sendPushNotifications();
