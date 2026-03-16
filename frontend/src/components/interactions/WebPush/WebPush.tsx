import * as React from "react";
import { useEffect, useState } from "react";
import { presets } from "@styles/presets";

export interface WebPushProps {
  pushStatus?: boolean;
  userId: string;
  onSubscription?: (subscription: PushSubscription | null) => void;
}

const WebPush = ({ pushStatus = true, userId, onSubscription }: WebPushProps) => {
  const [enabled, setEnabled] = useState(pushStatus);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Vérification de la compatibilité des notifications push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Permission refusée");
        return;
      }

     const registration = await navigator.serviceWorker.ready;
        if (!registration.pushManager) {
        console.error("PushManager non disponible sur ce navigateur.");
        return;
        }

        const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

      setSubscription(sub);
    } catch (err) {
      console.error("Erreur d’abonnement :", err);
    }
  };

  const handleUnsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe();
        setSubscription(null);
        onSubscription?.(null);
      } catch (err) {
        console.error("Erreur de désinscription :", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enabled && subscription) {
        const json = subscription.toJSON();
        if (!json.keys?.p256dh || !json.keys?.auth) {
            console.error("Clés de souscription manquantes.");
            return;
        }

        const cleanSubscription = {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: {
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
            },
        };

      try {
        const res = await fetch("/api/supabase/manage-push-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            subscription: cleanSubscription,
          }),
        });

        if (!res.ok) {
          console.error("❌ Échec de l’enregistrement Supabase :", await res.text());
        } else {
          console.log("✅ Abonnement enregistré");
          onSubscription?.(cleanSubscription as any);
        }
      } catch (error) {
        console.error("❌ Erreur réseau :", error);
      }
    } else if (!enabled) {
      try {
        // Appel API pour supprimer l'abonnement de Supabase
        const res = await fetch("/api/supabase/manage-push-notification", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!res.ok) {
          console.error("❌ Échec de la suppression de l’abonnement", await res.text());
        } else {
          console.log("✅ Abonnement supprimé");
        }
      } catch (error) {
        console.error("❌ Erreur de suppression réseau :", error);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  };

  return isSupported ? (
    <div style={presets.wrappers.custom as React.CSSProperties}>
        <form style={presets.form as React.CSSProperties} onSubmit={handleSubmit}>
                <div style={ presets.inputGroupItem as React.CSSProperties }>
        
        <label style={presets.formLabel as React.CSSProperties}>
            <input
            type="checkbox"
            name="notifications"
            style={presets.inputs.simple as React.CSSProperties}
            checked={enabled}
            onChange={(e) => {
                setEnabled(e.target.checked);
                if (e.target.checked) handleSubscribe();
                else {
                handleUnsubscribe();
                }
            }}
            />
            Recevoir les notifications
        </label>
        
            </div>


            <button 
                type="submit"
                style={presets.buttons.secondary as React.CSSProperties}
                disabled={enabled && !subscription}
            >
                {enabled ? "Activer les notifications" : "Désactiver les notifications"}
            </button>
        </form>
    </div>
    ) : (
        <p>Notifications non supportées par ce navigateur.</p>
    );
};

export default WebPush;
