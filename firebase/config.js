


import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCz5_N1mcCCHiLgAspujCbyxlMvN_x-Oak",
  authDomain: "pickmeup-716f6.firebaseapp.com",
  projectId: "pickmeup-716f6",
  storageBucket: "pickmeup-716f6.firebasestorage.app",
  //storageBucket: "pickmeup-716f6.appspot.com",
  messagingSenderId: "380650369905",
  appId: "1:380650369905:web:f06dc225b0dedc121dfcd0"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
