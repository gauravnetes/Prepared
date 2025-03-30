import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbIPLDIP1wqx191VNt33tNxB7Q2EVDtWM",
  authDomain: "prepared-64d0a.firebaseapp.com",
  projectId: "prepared-64d0a",
  storageBucket: "prepared-64d0a.firebasestorage.app",
  messagingSenderId: "686611488288",
  appId: "1:686611488288:web:25ee4853202d2d135aa645",
  measurementId: "G-B5H6LDZL3Q"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app); 
export const db = getFirestore(app); 