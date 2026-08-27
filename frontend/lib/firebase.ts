import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHlK0KnQzD2CKklJ_WFTuOSeQ5dSBzP_0",
  authDomain: "adbez-advertising.firebaseapp.com",
  projectId: "adbez-advertising",
  storageBucket: "adbez-advertising.firebasestorage.app",
  messagingSenderId: "386548483212",
  appId: "1:386548483212:web:906941c9cf9278e57667a9",
  measurementId: "G-YY7LRMHTMD"
};

// Initialize Firebase (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Analytics conditionally (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
