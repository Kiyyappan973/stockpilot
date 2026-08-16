import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAuuXWpOr14lXMNxqbCjA7OUxePOb72aP4",
  authDomain: "stockpilot-52981.firebaseapp.com",
  projectId: "stockpilot-52981",
  storageBucket: "stockpilot-52981.firebasestorage.app",
  messagingSenderId: "42651110167",
  appId: "1:42651110167:web:79ec6b5d48adfbb7674552"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)