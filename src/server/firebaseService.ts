// src/server/firebaseService.ts

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    databaseURL: 'YOUR_DATABASE_URL',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Store user OAuth data
export const storeUserOauthInfo = async (userId: string, platform: string, oauthData: any) => {
    try {
        await set(ref(database, `users/${userId}/${platform}_oauth`), oauthData);
        console.log('OAuth data stored successfully');
    } catch (error) {
        console.error('Error storing OAuth data:', error);
    }
};

// Retrieve user OAuth data
export const getUserOauthInfo = async (userId: string, platform: string) => {
    try {
        const snapshot = await get(child(ref(database), `users/${userId}/${platform}_oauth`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log('No data available');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving OAuth data:', error);
        return null;
    }
};
