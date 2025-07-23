// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDigQh21F1jabo7fYcMi-inq7G4orU4oI",
  authDomain: "nepcart-adb12.firebaseapp.com",
  projectId: "nepcart-adb12",
  storageBucket: "nepcart-adb12.appspot.com",
  messagingSenderId: "984958918758",
  appId: "1:984958918758:web:f28dedf5aed99dd8980da7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
