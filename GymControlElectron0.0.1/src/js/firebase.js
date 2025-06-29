import { initializeApp } from "firebase/app";
import {
  getAuth
} from "firebase/auth";
import {
  getFirestore
} from "firebase/firestore";
import {
  getDatabase
} from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyAa4MzfkhCmSk6pd-8tVj385jm3RIf8n1k",
  authDomain: "gymcontrol-e1b96.firebaseapp.com",
  databaseURL: "https://gymcontrol-e1b96-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gymcontrol-e1b96",
  storageBucket: "gymcontrol-e1b96.firebasestorage.app",
  messagingSenderId: "1057055037851",
  appId: "1:1057055037851:web:e0171e1eeb09ace9d3693e"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const secondaryApp = initializeApp(firebaseConfig, "secondary");

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const rtdb = getDatabase(firebaseApp);