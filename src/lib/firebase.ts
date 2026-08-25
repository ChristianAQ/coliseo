import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = initializeFirestore(firebaseApp, {
  // Los Match tienen campos opcionales (label, nextMatchId...) que llegan como
  // `undefined` en vez de omitidos, y Firestore rechaza ese valor por defecto.
  ignoreUndefinedProperties: true,
  // Algunas redes (proxies corporativos, ciertos bloqueadores de anuncios) cortan
  // el streaming WebChannel que usa Firestore por defecto y el SDK lo confunde con
  // estar offline ("Failed to get document because the client is offline"). Con
  // esto, detecta ese caso y cae automáticamente a long-polling.
  experimentalAutoDetectLongPolling: true,
});
