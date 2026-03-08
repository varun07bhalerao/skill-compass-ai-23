import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "./types";
import { demoUser } from "./seed-data";
import { auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  signup: async () => false,
  loginWithGoogle: async () => false,
  logout: async () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        // Load additional user data from local storage if available, to merge with Firebase user
        const savedUser = localStorage.getItem("skillbridge-user");
        let userData: UserProfile = savedUser ? JSON.parse(savedUser) : {
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || "",
          completedCourses: [],
          completedMilestones: [],
        };
        // Update user state with fresh data from Firebase
        userData = { ...userData, name: firebaseUser.displayName || userData.name, email: firebaseUser.email || userData.email };
        setUser(userData);
        localStorage.setItem("skillbridge-auth", JSON.stringify(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("skillbridge-auth");
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const newUser: UserProfile = {
        name,
        email,
        completedCourses: [],
        completedMilestones: [],
      };
      localStorage.setItem("skillbridge-user", JSON.stringify(newUser));
      setUser(newUser);
      
      return true;
    } catch (error) {
      console.error("Signup Error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const savedUser = localStorage.getItem("skillbridge-user");
      let userData: UserProfile = savedUser ? JSON.parse(savedUser) : {
        name: userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "User",
        email: userCredential.user.email || "",
        completedCourses: [],
        completedMilestones: [],
      };
      
      // Force update the name to the Google User's name if they have one
      userData.name = userCredential.user.displayName || userData.name;
      
      localStorage.setItem("skillbridge-user", JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error("Google Login Error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem("skillbridge-user", JSON.stringify(updated));
      localStorage.setItem("skillbridge-auth", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
