import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxA5WxmEZNGmB8sGob6RYIz6AIOyrUG2Y",
  authDomain: "crubsuite.firebaseapp.com",
  projectId: "crubsuite",
  storageBucket: "crubsuite.firebasestorage.app",
  messagingSenderId: "401434497254",
  appId: "1:401434497254:web:0680567c56aefe83cdeb27",
  measurementId: "G-5KF7HTCVME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);