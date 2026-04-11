// Import fungsi-fungsi inisialisasi dari SDK Firebase
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"; // Modul Database (Firestore)

// TODO: TIMPA objek konfigurasi di bawah ini dengan milik Anda dari Firebase Console!
const firebaseConfig = {
  apiKey: "AIzaSyDT8JE21jTX-t19HBmc-HD9yHF4aVqjWS0",
  authDomain: "l10-meeting-ammarkids.firebaseapp.com",
  projectId: "l10-meeting-ammarkids",
  storageBucket: "l10-meeting-ammarkids.firebasestorage.app",
  messagingSenderId: "496500544899",
  appId: "1:496500544899:web:4fa8d9e2fbc2bfd43112b6",
  measurementId: "G-2S7QP7ZC1B"
};

// 1. Inisialisasi Aplikasi Firebase
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Layanan Database dengan Force Long Polling
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
