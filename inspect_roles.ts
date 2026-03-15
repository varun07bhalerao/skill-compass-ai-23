import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectJobRoles() {
  const rolesCol = collection(db, "jobRoles");
  const rolesSnap = await getDocs(rolesCol);
  console.log("Found", rolesSnap.size, "job roles");
  
  rolesSnap.forEach((doc) => {
    console.log("ID:", doc.id, "=> Data:", doc.data());
  });
}

inspectJobRoles().catch(console.error);
