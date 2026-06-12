import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { User } from './types';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const USERS_COLLECTION = 'users';

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, USERS_COLLECTION), (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    callback(users);
  }, (error) => {
    console.error("Firestore error on subscribeToUsers:", error);
  });
};

export const saveUser = async (user: User) => {
  await setDoc(doc(db, USERS_COLLECTION, user.id.toString()), user);
};

export const deleteUserDb = async (userId: string) => {
  await deleteDoc(doc(db, USERS_COLLECTION, userId.toString()));
};

// Initial admin creation if none exists
export const initAdminUser = async () => {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (querySnapshot.empty) {
        await saveUser({
            id: '1', 
            fullName: 'المدير العام', 
            username: 'admin', 
            password: '123', 
            role: 'admin', 
            createdAt: Date.now()
        });
    }
};
