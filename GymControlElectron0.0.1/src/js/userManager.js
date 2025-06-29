// src/js/userManagerRenderer.js

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword  } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc, // Añadido para eliminación
  query,
  where // Opcional para filtros
} from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const listEl = document.getElementById("unassigned-users-list");
  const errMsg = document.getElementById("um-error");

  let currentTrainer = null;

  onAuthStateChanged(auth, async user => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    currentTrainer = user;
    await loadUnassignedUsers();
  });

  async function loadUnassignedUsers() {
    if (!listEl) return;
    listEl.innerHTML = "";
    
    try {
      // Obtener usuarios asignados a ESTE entrenador
      const assignedSnapshot = await getDocs(
        collection(db, `trainers/${currentTrainer.uid}/clients`)
      );
      const assignedIds = new Set(assignedSnapshot.docs.map(d => d.id));

      // Obtener TODOS los usuarios
      const usersSnapshot = await getDocs(collection(db, "users"));
      
      usersSnapshot.forEach(docSnap => {
        if (!assignedIds.has(docSnap.id)) {
          const userData = docSnap.data();
          const li = document.createElement("li");
          li.innerHTML = `
            ${userData.name || "(sin nombre)"} – ${userData.email || ""}
            <button class="assign-btn" data-uid="${docSnap.id}">Asignar</button>
            <button class="delete-btn" data-uid="${docSnap.id}">Eliminar asignación</button>
          `;
          
          // CORRECCIÓN 1: Función para botón Asignar
          li.querySelector(".assign-btn").addEventListener("click", async () => {
            try {
              await setDoc(
                doc(db, `trainers/${currentTrainer.uid}/clients`, docSnap.id),
                { ...userData, assignedAt: new Date() }
              );
              await loadUnassignedUsers();
            } catch (error) {
              console.error("Error asignando usuario:", error);
              if (errMsg) errMsg.textContent = `Error asignando: ${error.message}`;
            }
          });
          
          // CORRECCIÓN 2: Sintaxis Firebase modular para eliminar
          li.querySelector(".delete-btn").addEventListener("click", async () => {
            try {
              // Solo eliminar de la asignación del entrenador
              await deleteDoc(
                doc(db, `trainers/${currentTrainer.uid}/clients`, docSnap.id)
              );
              await deleteDoc(doc(db, "users", docSnap.id));
              await loadUnassignedUsers();
              window.api?.refreshClientList?.();
            } catch (error) {
              console.error("Error eliminando asignación:", error);
              if (errMsg) errMsg.textContent = `Error eliminando: ${error.message}`;
            }
          });
          
          listEl.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      if (errMsg) errMsg.textContent = `Error: ${error.message}`;
    }
  }

  registerForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const email = document.getElementById("new-email").value.trim();
  const password = document.getElementById("new-password").value.trim();
  const name = document.getElementById("new-name").value.trim();

  if (!email || !password || !name) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    await setDoc(doc(db, "users", newUser.uid), {
      email,
      name,
      createdBy: currentTrainer.uid,
      assignedAt: null
    });

    document.getElementById("notification").classList.add("show");
    setTimeout(() => {
      document.getElementById("notification").classList.remove("show");
    }, 3000);

    registerForm.reset();
  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario: " + error.message);
  }
});
});