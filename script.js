// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration (Replace with your Firebase config)
  const firebaseConfig = {
    apiKey: "AIzaSyCZK2Thpk5ySAR1xdl94D7MqLr1rAm0okY",
    authDomain: "lovelanguagerating.firebaseapp.com",
    projectId: "lovelanguagerating",
    storageBucket: "lovelanguagerating.firebasestorage.app",
    messagingSenderId: "386450885810",
    appId: "1:386450885810:web:31ad4656e9e81d0c9e4dab",
    measurementId: "G-6RH88610F4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Sign-In Function
window.signInWithGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google Sign-In Successful:", user);
    await saveUserProfile(user);
    showRatingSection();
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

// Apple Sign-In Function
window.signInWithApple = async function () {
  const provider = new OAuthProvider('apple.com');
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Apple Sign-In Successful:", user);
    await saveUserProfile(user);
    showRatingSection();
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
  }
};

// Email Sign-In
window.handleEmailSignIn = async function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Email Sign-In Successful");
    showRatingSection();
  } catch (error) {
    console.error("Email Sign-In Error:", error);
    alert("Sign-In Failed: " + error.message);
  }
};

// Email Sign-Up
window.handleSignUp = async function (event) {
  event.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Account Created:", result.user);
    await saveUserProfile(result.user);
    alert("Account Created Successfully! You can now sign in.");
  } catch (error) {
    console.error("Sign-Up Error:", error);
    alert("Sign-Up Failed: " + error.message);
  }
};

// Save User Profile to Firestore
async function saveUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      createdAt: new Date().toISOString()
    });
  }
}

// Show Rating Section After Login
function showRatingSection() {
  document.getElementById("rating-section").classList.remove("hidden");
}
