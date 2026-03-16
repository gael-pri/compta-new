// import { useEffect } from "react";
// import { useSession } from "@supabase/auth-helpers-react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// const supabase = createClientComponentClient();

// export default function GeolocationUpdater() {
//   const session = useSession();

//   useEffect(() => {
//     if (!session?.user) return;

//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (pos) => {
//           const { latitude, longitude } = pos.coords;

//           // 🔄 Envoi à Supabase
//           const { error } = await supabase
//             .from("profiles") // Remplace par le nom de ta table
//             .update({
//               latitude,
//               longitude,
//               // location: `POINT(${longitude} ${latitude})`, // si tu utilises un champ `geometry`
//             })
//             .eq("id", session.user.id); // ou selon ta logique de user_id

//           if (error) {
//             console.error("Erreur mise à jour des coordonnées GPS :", error.message);
//           } else {
//             console.log("Coordonnées GPS mises à jour avec succès");
//           }
//         },
//         (err) => {
//           console.warn("Géolocalisation refusée ou échouée", err);
//         }
//       );
//     }
//   }, [session]);

//   return null; // Pas besoin d'affichage
// }
