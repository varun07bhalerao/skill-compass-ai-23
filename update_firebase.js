import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

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

async function migrate() {
  const rolesCol = collection(db, "jobRoles");
  const rolesSnap = await getDocs(rolesCol);
  
  let count = 0;
  for (const d of rolesSnap.docs) {
    const data = d.data();
    
    // Determine the real job name
    let realName = data.jobRole || data.roleName || d.id;
    if (d.id === "data analytics" && !data.jobRole) {
      realName = "Data Analytics";
    }
    
    // Determine the required skills
    let requiredSkills = data.requiredSkills || data.jobrole || [];
    
    // New document data
    const newData = {
      roleName: realName,
      jobRole: realName,
      requiredSkills: requiredSkills
    };
    
    // Create new document with realName as ID
    await setDoc(doc(db, "jobRoles", realName), newData);
    
    console.log(`Created new document for: ${realName}`);
    
    // Delete the old document if the ID is different
    if (d.id !== realName) {
      await deleteDoc(doc(db, "jobRoles", d.id));
      console.log(`Deleted old document: ${d.id}`);
    }
    count++;
  }
  
  console.log(`Successfully migrated ${count} roles.`);
}

migrate().then(() => process.exit(0)).catch(console.error);
