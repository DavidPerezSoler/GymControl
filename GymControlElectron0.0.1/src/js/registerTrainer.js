import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc
} from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const form   = document.getElementById("reg-form");
const errMsg = document.getElementById("reg-error");

form.addEventListener("submit", async e => {
  e.preventDefault();
  errMsg.textContent = "";
  const email = document.getElementById("new-email").value.trim();
  const pass  = document.getElementById("new-password").value.trim();
  const name  = document.getElementById("new-name").value.trim();
  try {
    // Para no cerrar sesión actual del entrenador principal, usa app secundario
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);
    const res = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = res.user.uid;
    // Guarda en Firestore colección trainers/{uid}
    await setDoc(doc(db, "trainers", uid), { name, email });
    alert("Entrenador creado 🎉");
    window.close();
    await fbSignOut(secondaryAuth);
  } catch (e) {
    console.error(e);
    errMsg.textContent = "Error: " + e.message;
  }
});
