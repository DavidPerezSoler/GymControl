import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

const API_BASE = "http://localhost:10001/api/Exercises";

export async function getExercisesForDate(trainerId, date) {
  const ref = doc(db, "workoutSchedules", trainerId, "days", date);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().exercises || [] : [];
}

export async function addExerciseToDate(trainerId, date, exercise) {
  const ref = doc(db, "workoutSchedules", trainerId, "days", date);
  await setDoc(ref, { exercises: arrayUnion(exercise) }, { merge: true });
}

export async function getExerciseDetailsByName(name) {
  const response = await fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error("No se encontró el ejercicio");
  return await response.json();
}