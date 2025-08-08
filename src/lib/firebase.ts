import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnyXQ3obx-RGKjZDrKY5Hoh9uYcj4gG9A",
  authDomain: "gift-card-north-via-marketing.firebaseapp.com",
  projectId: "gift-card-north-via-marketing",
  storageBucket: "gift-card-north-via-marketing.firebasestorage.app",
  messagingSenderId: "1085390205337",
  appId: "1:1085390205337:web:9b30014b23a8e181036308"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
}

export default app; 