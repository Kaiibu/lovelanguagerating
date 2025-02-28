import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Password validation function
function isValidPassword(password) {
  return password.length >= 15 || (password.length >= 8 && /[a-z]/.test(password) && /\d/.test(password));
}

// Authentication Functions
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await saveUserProfile(user);
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
}

async function signInWithApple() {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    await saveUserProfile(user);
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
  }
}

async function signUpWithEmail(email, password) {
  if (!isValidPassword(password)) {
    console.error("Password does not meet requirements: Must be at least 15 characters OR at least 8 characters including a number and a lowercase letter.");
    return;
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await saveUserProfile(user);
  } catch (error) {
    console.error("Email Sign-Up Error:", error);
  }
}

async function signInWithEmail(email, password) {
  if (!isValidPassword(password)) {
    alert("Password must be at least 15 characters OR at least 8 characters including a number and a lowercase letter.");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email Sign-In Error:", error);
  }
}

async function signOutUser() {
  await signOut(auth);
}

async function saveUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      gender: "",
      birthYear: ""
    });
  }
}

async function saveRatings(userId, ratings, explanations) {
  const totalScore = Object.values(ratings).reduce((acc, val) => acc + val, 0);
  const percentage = (totalScore / (5 * Object.keys(ratings).length)) * 100;
  const docRef = await addDoc(collection(db, "ratings"), {
    userId,
    ratings,
    explanations,
    percentage: percentage.toFixed(2),
    timestamp: new Date().toISOString()
  });
  return docRef.id;
}

async function getRatings(ratingId) {
  const docRef = doc(db, "ratings", ratingId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

async function updateRatings(ratingId, ratings, explanations) {
  const totalScore = Object.values(ratings).reduce((acc, val) => acc + val, 0);
  const percentage = (totalScore / (5 * Object.keys(ratings).length)) * 100;
  const docRef = doc(db, "ratings", ratingId);
  await updateDoc(docRef, {
    ratings,
    explanations,
    percentage: percentage.toFixed(2),
    timestamp: new Date().toISOString()
  });
}

// Frontend UI
function renderUI() {
  document.body.innerHTML = `
    <div>
      <h1>Rate Your Love Languages</h1>
      <button onclick="signInWithGoogle()">Sign in with Google</button>
      <button onclick="signInWithApple()">Sign in with Apple</button>
      <form onsubmit="handleEmailSignIn(event)">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Sign In</button>
      </form>
      <div id="rating-section" style="display: none;">
        <h2>Rate each Love Language</h2>
        <div id="ratings"></div>
        <button onclick="submitRatings()">Submit</button>
        <div id="result"></div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderUI();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("rating-section").style.display = "block";
    }
  });
});

function handleEmailSignIn(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmail(email, password);
}

export { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, signOutUser, saveRatings, getRatings, updateRatings, isValidPassword };
