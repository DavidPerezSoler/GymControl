// src/js/loginRenderer.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  // ← ya no necesitamos onAuthStateChanged ni signOut aquí
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc
} from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const loginForm = document.getElementById("login-form");
const emailIn   = document.getElementById("email");
const passIn    = document.getElementById("password");
const errMsg    = document.getElementById("login-error");
const regBtn    = document.getElementById("register-trainer-btn");

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  errMsg.textContent = "";
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      emailIn.value.trim(),
      passIn.value.trim()
    );
    // Solo SI el login es correcto y además existe en trainers/uid,
    // abrimos inmediatamente la ventana de Client Manager:
    const userDoc = await getDoc(doc(db, "trainers", cred.user.uid));
    if (userDoc.exists()) {
      window.api.openClientManager();
      // opcionalmente cerrar la ventana de Login:
      window.close();
    } else {
      errMsg.textContent = "Acceso denegado: sólo entrenadores";
      await auth.signOut();
    }
  } catch (e) {
    errMsg.textContent = "Usuario o contraseña incorrectos";
  }
});

// ya no necesitamos onAuthStateChanged aquí

regBtn.addEventListener("click", () => {
  window.api.openRegisterTrainer();
});
