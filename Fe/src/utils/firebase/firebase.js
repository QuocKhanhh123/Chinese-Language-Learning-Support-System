import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoYcFGi8vturT3DMVtmtEm_Zr8rTbzwA8",
  authDomain: "upload-image-product-54525.firebaseapp.com",
  projectId: "upload-image-product-54525",
  storageBucket: "upload-image-product-54525.appspot.com",
  messagingSenderId: "319121692610",
  appId: "1:319121692610:web:fccb99939bbb461400e85b",
  measurementId: "G-87HXQ3N7NG",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const db = getFirestore(app);

export { storage, app, auth, googleProvider, db };
