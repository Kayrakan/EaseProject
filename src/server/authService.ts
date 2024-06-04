// // src/client/authService.ts
// import { db } from './firebase';
// import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
//
// interface UserInfo {
//     uid: string;
//     displayName: string;
//     email: string;
//     provider: string;
//     accessToken: string;
//     refreshToken: string;
// }
//
// // Add or update user information
// export const storeUserInfo = async (userInfo: UserInfo) => {
//     const usersRef = collection(db, "users");
//
//     // Check if user exists
//     const q = query(usersRef, where("uid", "==", userInfo.uid));
//     const querySnapshot = await getDocs(q);
//
//     if (querySnapshot.empty) {
//         // Add new user document
//         await addDoc(usersRef, userInfo);
//     } else {
//         // Update existing user document
//         querySnapshot.forEach(async (document) => {
//             const userDoc = doc(db, "users", document.id);
//             await updateDoc(userDoc, userInfo);
//         });
//     }
// };
//
// // Retrieve user information
// export const getUserInfo = async (uid: string) => {
//     const usersRef = collection(db, "users");
//     const q = query(usersRef, where("
