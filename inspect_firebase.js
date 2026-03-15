import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyCv8Q7jJbCUuwgN3Kw-fcC-NueizaZtbTc",
  authDomain: "technova-hackethon.firebaseapp.com",
  projectId: "technova-hackethon",
  storageBucket: "technova-hackethon.firebasestorage.app",
  messagingSenderId: "47078234728",
  appId: "1:47078234728:web:64dd8fc038bcd40eb039dd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  const rolesCol = collection(db, "jobRoles");
  const rolesSnap = await getDocs(rolesCol);
  const data = [];
  rolesSnap.forEach(d => data.push({ id: d.id, data: d.data() }));
  fs.writeFileSync('roles.json', JSON.stringify(data, null, 2));
  console.log("Dumped", data.length, "roles to roles.json");
}

inspect().then(() => process.exit(0)).catch(console.error);
