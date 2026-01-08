
// 這是你的雲端手帳連線中心！
// 請將你在 Firebase 網頁上看到的內容填進去。

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// 💡 關鍵就在這裡！
// 把下面這些「你的_...」換成你剛才在 Firebase 網頁上看到的那串長長的字母。
const firebaseConfig = {
  apiKey: "AIzaSyBwSzntqVKPv-5XSVQ0XMIsNjONyi2npRQ",
  authDomain: "osaka-travel-74571.firebaseapp.com",
  projectId: "osaka-travel-74571",
  storageBucket: "osaka-travel-74571.firebasestorage.app",
  messagingSenderId: "84228879322",
  appId: "1:84228879322:web:f6f53c7520276928fb86e3",
  measurementId: "G-69ZGMEKD1F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
