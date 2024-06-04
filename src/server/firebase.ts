// firebase.ts

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, update, remove } from 'firebase/database';

// Firebase configuration object
const firebaseConfig = {
    apiKey: 'AIzaSyD7p-ItPqGTSwXujlwAoKJ2xxzkWyeLCQk',
    authDomain: 'ease-c477e.firebaseapp.com',
    databaseURL: 'https://ease-c477e-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'ease-c477e',
    storageBucket: 'ease-c477e.appspot.com',
    messagingSenderId: '221227049058',
    appId: '1:221227049058:web:3b1ab5f688f0e0c98af13b',
    measurementId: 'G-6S21T38W4X'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to save data to Realtime Database
export const saveData = (path: string, data: object) => {
    return set(ref(database, path), data);
};

// Function to get data from Realtime Database
export const getData = (path: string) => {
    const dbRef = ref(database);
    return get(child(dbRef, path)).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('No data available');
        }
    }).catch((error) => {
        console.error(error);
    });
};

// Function to update data in Realtime Database
export const updateData = (path: string, data: object) => {
    return update(ref(database, path), data);
};

// Function to delete data from Realtime Database
export const deleteData = (path: string) => {
    return remove(ref(database, path));
};