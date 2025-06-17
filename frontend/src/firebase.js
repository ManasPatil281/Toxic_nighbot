
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "nightbot-project.firebaseapp.com",
  projectId: "nightbot-project",
  storageBucket: "nightbot-project.firebasestorage.app",
  messagingSenderId: "1085986834483",
  appId: "1:1085986834483:web:8c15ed59d6639359057b46"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);