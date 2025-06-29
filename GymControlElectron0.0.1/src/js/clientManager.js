// clientManager.js
import { getAuth, onAuthStateChanged, signOut  } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc
} from "firebase/firestore";
import { firebaseApp } from "./firebase.js";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const emailSpan      = document.getElementById("trainer-email");
const dropdownBtn    = document.getElementById("user-dropdown-btn");
const dropdownMenu   = document.getElementById("user-menu");
const clientList = document.getElementById("client-list");
const logoutBtn      = document.getElementById("logout-btn");
const openUserManagerBtn = document.getElementById("open-user-manager-btn");

let currentTrainer = null;

onAuthStateChanged(auth, async user => {
  currentTrainer = user;
  emailSpan.textContent = user.email;
  await loadAssignedClients();
});

dropdownBtn.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.api.logout();
});

openUserManagerBtn.addEventListener("click", () => {
  window.api.openUserManager();
});


async function loadAssignedClients() {
  clientList.innerHTML = "";

  const snapshot = await getDocs(collection(db, `trainers/${currentTrainer.uid}/clients`));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const uid  = docSnap.id;

    const li = document.createElement("li");
    li.classList.add("client-item");
    li.innerHTML = `
      <div class="client-info">
        <strong>${data.name}</strong>
        <span class="email">(${data.email})</span>
      </div>
      <div class="client-actions">
        <button class="btn btn-calendar" title="Ver calendario">
          <i class="ri-calendar-line"></i>
        </button>
        <button class="btn btn-remove" title="Quitar cliente">
          <i class="ri-user-unfollow-line"></i>
        </button>
      </div>
    `;

    li.querySelector(".btn-calendar").addEventListener("click", () => {
      window.api.openClientCalendar(uid);
    });

    li.querySelector(".btn-remove").addEventListener("click", async () => {
      const confirmRemove = confirm(`¿Quitar a ${data.name} de tu lista?`);
      if (!confirmRemove) return;

      try {
        await deleteDoc(doc(db, `trainers/${currentTrainer.uid}/clients/${uid}`));
        alert("Cliente eliminado de la lista.");
        await loadAssignedClients();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar cliente.");
      }
    });

    clientList.appendChild(li);
  });

  // Si no hay clientes, mostramos un mensaje
  if (clientList.children.length === 0) {
    clientList.innerHTML = `<li class="no-clients">No tienes clientes asignados.</li>`;
  }
}

openUserManagerBtn.addEventListener("click", () => {
  window.api.openUserManager();
});
