// src/server/firebaseService.ts

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7p-ItPqGTSwXujlwAoKJ2xxzkWyeLCQk",
    authDomain: "ease-c477e.firebaseapp.com",
    databaseURL: "https://ease-c477e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ease-c477e",
    storageBucket: "ease-c477e.appspot.com",
    messagingSenderId: "221227049058",
    appId: "1:221227049058:web:3b1ab5f688f0e0c98af13b",
    measurementId: "G-6S21T38W4X"
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

//
// function getFirebaseUrl() {
//     var projectId = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID');
//     return 'https://' + projectId + '.firebaseio.com';
// }
//
// function getFirebaseApiKey() {
//     return PropertiesService.getScriptProperties().getProperty('FIREBASE_API_KEY');
// }
//
// function storeUserData(userId, data) {
//     var url = getFirebaseUrl() + '/users/' + userId + '.json?auth=' + getFirebaseApiKey();
//     var options = {
//         'method': 'PUT',
//         'contentType': 'application/json',
//         'payload': JSON.stringify(data)
//     };
//     var response = UrlFetchApp.fetch(url, options);
//     Logger.log(response.getContentText());
// }
//
// function getUserData(userId) {
//     var url = getFirebaseUrl() + '/users/' + userId + '.json?auth=' + getFirebaseApiKey();
//     var response = UrlFetchApp.fetch(url);
//     var data = JSON.parse(response.getContentText());
//     Logger.log(data);
//     return data;
// }

